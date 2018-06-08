using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Timers;
using GDO.Core.Apps;
using GDO.Core.Scenarios;
using GDO.Core.States;
using log4net;
using Microsoft.AspNet.SignalR;
using Newtonsoft.Json;
using Timer = System.Timers.Timer;

namespace GDO.Core
{
    /// <summary>
    /// The root hub for controlling the GDO - deploying sections, apps ect. 
    /// communicated with from the .js control panel 
    /// </summary>
    /// <seealso cref="Microsoft.AspNet.SignalR.Hub" />
    /// <seealso cref="GDO.Core.Apps.IHubLog" />
    public class CaveHub : Hub, IHubLog
    {
        public ILog Log { get; set; } = LogManager.GetLogger(typeof(CaveHub));

        public void LogCall(string message) {
            Log.Info("CAVE HUB CAlled"+message);
        }

        public override System.Threading.Tasks.Task OnDisconnected(bool stopCalled)
        {
            lock (Cave.ServerLock)
            {
                Node node = Cave.Layout.GetNode(Context.ConnectionId);
                if (node != null)
                {
                    node.IsConnectedToCaveServer = false;
                    BroadcastNodeUpdate(node.Id);
                }

                if (stopCalled)
                {
                    // We know that Stop() was called on the client,
                    // and the connection shut down gracefully.
                }
                else
                {
                    // This server hasn't heard from the client in the last ~35 seconds.
                    // If SignalR is behind a load balancer with scaleout configured, 
                    // the client may still be connected to another SignalR server.
                }
            }
            return base.OnDisconnected(stopCalled);

        }

        /// <summary>
        /// Deploys the node.
        /// </summary>
        /// <param name="sectionId">The section identifier.</param>
        /// <param name="nodeId">The node identifier.</param>
        /// <param name="col">The col.</param>
        /// <param name="row">The row.</param>
        public bool DeployNode(int sectionId, int nodeId, int col, int row)
        {
            lock (Cave.ServerLock)
            {
                Node node = Cave.Layout.DeployNode(sectionId, nodeId, col, row);
                if (node != null)
                {
                    BroadcastNodeUpdate(nodeId);
                    return true;
                }
                else
                {
                    return false;
                }
            }
        }

        /// <summary>
        /// Frees the node.
        /// </summary>
        /// <param name="nodeId">The node identifier.</param>
        public bool FreeNode(int nodeId)
        {
            lock (Cave.ServerLock)
            {
                Node node = Cave.Layout.FreeNode(nodeId);
                if (node != null)
                {
                    BroadcastNodeUpdate(nodeId);
                    return true;
                }
                else
                {
                    return false;
                }
            }
        }

        /// <summary>
        /// Creates a section.
        /// </summary>
        /// <param name="colStart">The col start.</param>
        /// <param name="rowStart">The row start.</param>
        /// <param name="colEnd">The col end.</param>
        /// <param name="rowEnd">The row end.</param>
        /// <returns>the new section id or -1 if error</returns>
        public int CreateSection(int colStart, int rowStart, int colEnd, int rowEnd)
        {
            lock (Cave.ServerLock)
            {
                // deploy the section
                int sectionId = Cave.Deployment.CreateSection(colStart, rowStart, colEnd, rowEnd);
                Log.Info("created section "+sectionId);
                List<Node> deployedNodes = Cave.Deployment.Sections[sectionId].NodeList;

                if (!deployedNodes.Any()) return -1;

                // add the nodes to the signal R connection group for the new section
                foreach (Node node in deployedNodes)
                {
                    if (node.ConnectionId != null)
                    {
                        Groups.Add(node.ConnectionId, node.SectionId.ToString());
                    }
                }

                // broadcast an update saying that connection is updated. 
                BroadcastSectionUpdate(Cave.GetSectionId(colStart, rowStart));

                return sectionId;
            }
        }

        /// <summary>
        /// Closes a section.
        /// </summary>
        /// <param name="sectionId">The section identifier.</param>
        /// <returns></returns>
        public bool CloseSection(int sectionId)
        {
            lock (Cave.ServerLock) {
                // close the section
                List<Node> freedNodes = Cave.Deployment.CloseSection(sectionId);

                if (!freedNodes.Any()) return false;

                // remove them from the SignalR group
                foreach (Node node in freedNodes) {
                    if (node.ConnectionId != null) {
                        Groups.Remove(node.ConnectionId, node.SectionId.ToString());
                    }
                }
                
                // send an update...
                BroadcastSectionUpdate(sectionId);
                return true;

            }
        }

        /// <summary>
        /// Sets the section P2P mode.
        /// </summary>
        /// <param name="sectionId">The section identifier.</param>
        /// <param name="p2pmode">The p2pmode.</param>
        public bool SetSectionP2PMode(int sectionId, int p2pmode)
        {
            lock (Cave.ServerLock) {
                List<Node> affectedNodes = Cave.Deployment.SetSectionP2PMode(sectionId, p2pmode);
                if (!affectedNodes.Any()) return false;

                BroadcastSectionUpdate(sectionId);
                foreach (Node node in affectedNodes) {
                    BroadcastNodeUpdate(node.Id);
                }
                return true;

            }
        }
        /// <summary>
        /// Sets the default P2P mode.
        /// </summary>
        /// <param name="p2pmode">The p2pmode.</param>
        public void SetDefaultP2PMode(int p2pmode)
        {
            lock (Cave.ServerLock)
            {
                Cave.DefaultP2PMode = p2pmode;
            }
        }

        /// <summary>
        /// Requests the default p2p mode.
        /// </summary>
        public void RequestDefaultP2PMode()
        {
            lock (Cave.ServerLock)
            {
                Clients.Caller.receiveDefaultP2PMode(Cave.DefaultP2PMode);
            }
        }

        /// <summary>
        /// Deploys the application.
        /// </summary>
        /// <param name="sectionId">The section identifier.</param>
        /// <param name="appName">Name of the application.</param>
        /// <param name="configName">Name of the configuration.</param>
        /// <returns></returns>
        public int DeployBaseApp(int sectionId, string appName, dynamic configName)// dynamic is hateful but handy - can be string for name or JSON or an actual state object
        {
            lock (Cave.ServerLock)
            {
                int instanceId = Cave.Deployment.CreateBaseAppInstance(sectionId, appName, configName);
                Cave.Deployment.SetSectionP2PMode(sectionId, Cave.Deployment.Apps[appName].P2PMode);
                if (instanceId >= 0)
                {
                    string serializedInstance = GetInstanceUpdate(instanceId);
                    BroadcastAppUpdate(true, instanceId, serializedInstance);
                }

                //signal config updated
                
                Task.Factory.StartNew(() => {
                    Thread.Sleep(1000);
                    var appHub = Cave.Deployment.GetInstancebyID(instanceId).App.Hub as GDOHub;
                    if (appHub != null) {
                        appHub.SignalConfigUpdated(instanceId);
                    }
                });

                return instanceId;
            }
        }

        /// <summary>
        /// Deploys the application.
        /// </summary>
        /// <param name="sectionId">The section identifier.</param>
        /// <param name="appName">Name of the application.</param>
        /// <param name="config">The configuration.</param>
        /// <returns></returns>
        private int DeployBaseApp(int sectionId, string appName, IAppConfiguration config)
        {
            lock (Cave.ServerLock)
            {
                
                int instanceId = Cave.Deployment.CreateBaseAppInstance(sectionId, appName, config);
                Cave.Deployment.SetSectionP2PMode(sectionId, Cave.Deployment.Apps[appName].P2PMode);
                if (instanceId >= 0)
                {
                    string serializedInstance = GetInstanceUpdate(instanceId);
                    BroadcastAppUpdate(true, instanceId, serializedInstance);
                }

              //signal config updated
               Task.Factory.StartNew(() => {
                   Thread.Sleep(1000);
                    var appHub = Cave.Deployment.GetInstancebyID(instanceId).App.Hub as GDOHub;
                    if (appHub != null) {
                        appHub.SignalConfigUpdated(instanceId);
                    }
                });

                return instanceId;
            }
        }

        public int DeployChildApp(int sectionId, string appName, string configName, int parentId)
        {
            lock (Cave.ServerLock)
            {
                int instanceId = Cave.Deployment.CreateChildAppInstance(sectionId, appName, configName, true, parentId);
                Cave.Deployment.SetSectionP2PMode(sectionId, Cave.Deployment.Apps[appName].P2PMode);
                if (instanceId >= 0)
                {
                    string serializedInstance = GetInstanceUpdate(instanceId);
                    BroadcastAppUpdate(true, instanceId, serializedInstance);
                }
                return instanceId;
            }
        }


        public int DeployCompositeApp(List<int> instanceIds, string appName, string configName)
        {
            lock (Cave.ServerLock)
            {
                int instanceId = Cave.Deployment.CreateCompositeAppInstance(instanceIds, appName, configName);
                if (instanceId >= 0)
                {
                    //Do more
                    //BroadcastAppUpdate(appName, configName, instanceId, true, instanceIds);
                }
                return instanceId;
            }
        }

        /// <summary>
        /// Closes the application.
        /// </summary>
        /// <param name="instanceId">The instance identifier.</param>
        /// <returns></returns>
        public bool CloseApp(int instanceId)
        {
            lock (Cave.ServerLock)
            {
                if (Cave.Deployment.ContainsInstance(instanceId))
                {
                    string appName = Cave.GetAppName(instanceId);
                    string serializedInstance = GetInstanceUpdate(instanceId);
                    if (Cave.Deployment.Apps[appName].Instances[instanceId] is IBaseAppInstance)
                    {
                        int sectionId = ((IBaseAppInstance)Cave.Deployment.Apps[appName].Instances[instanceId]).Section.Id;
                        Cave.Deployment.SetSectionP2PMode(sectionId, Cave.DefaultP2PMode);
                    }
                    else if (Cave.Deployment.Apps[appName].Instances[instanceId] is ICompositeAppInstance)
                    {
                        List<int> integratedInstances = ((ICompositeAppInstance)Cave.Deployment.Apps[appName].Instances[instanceId]).GetListofIntegratedInstances();
                        //todo this is unfinished - var not used
                    }
                    if (Cave.Deployment.DisposeAppInstance(appName, instanceId))
                    {
                        BroadcastAppUpdate(false, instanceId, serializedInstance);
                        return true;
                    }
                }
                return false;
            }
        }

        /// <summary>
        /// Uploads the node information.
        /// </summary>
        /// <param name="nodeId">The node identifier.</param>
        /// <param name="connectionId">The connection identifier.</param>
        /// <param name="connectedNodes">The connected nodes.</param>
        /// <param name="peerId">The peer identifier.</param>
        /// <param name="isConnectedToPeerServer">whether the peer is connected to a server or not</param>
        public void UploadNodeInfo(int nodeId, string connectionId, string connectedNodes, string peerId, bool isConnectedToPeerServer)
        {
            lock (Cave.ServerLock) {

                GDOAPISingleton.Instance.Hub = this;// GDO API

                Node node;
                Cave.Layout.Nodes.TryGetValue(nodeId, out node);
                if (node != null) {
                    node.IsConnectedToCaveServer = true;
                    node.ConnectionId = connectionId;
                    node.PeerId = peerId;
                    node.IsConnectedToPeerServer = isConnectedToPeerServer;
                    int[] deserializedConnectedNodes = JsonConvert.DeserializeObject<int[]>(connectedNodes);
                    node.ConnectedNodeList.Clear();
                    foreach (int connectedNode in deserializedConnectedNodes) {
                        node.ConnectedNodeList.Add(connectedNode);
                    }
                    if (node.IsDeployed) {
                        Groups.Add(node.ConnectionId, node.SectionId.ToString());
                    }
                    else {
                        Groups.Remove(node.ConnectionId, node.SectionId.ToString());
                    }
                    node.AggregateConnectionHealth();
                }
                else {
                    Log.Debug("could not find node number "+nodeId);
                }
                BroadcastNodeUpdate(nodeId);//todo should we broadcast?
            }
            // Check for node health
            CaveMonitor.ScanNodeHealth();
        }

        public void RequestCaveUpdate(int nodeId)
        {
            //lock (Cave.ServerLock) {
                try {
                    var watch = System.Diagnostics.Stopwatch.StartNew();

                    

                    List<string> nodes = new List<string>(Cave.Layout.Nodes.Count);
                    nodes.AddRange(Cave.Layout.Nodes.Select(nodeEntry => GetNodeUpdate(nodeEntry.Value.Id)));
                    List<string> sections = new List<string>(Cave.Deployment.Sections.Count);
                    sections.AddRange(Cave.Deployment.Sections.Select(sectionEntry => GetSectionUpdate(sectionEntry.Value.Id)));
                    List<string> modules = new List<string>(Cave.Layout.Modules.Count);
                    modules.AddRange(Cave.Layout.Modules.Select(moduleEntry => GetModuleUpdate(moduleEntry.Value.Name)));
                    List<string> apps = new List<string>(Cave.Deployment.Apps.Count);
                    apps.AddRange(Cave.Deployment.Apps.Select(appEntry => GetAppUpdate(appEntry.Value.Name)));
                    List<string> instances = new List<string>(Cave.Deployment.Instances.Count);
                    instances.AddRange(Cave.Deployment.Instances.Select(instanceEntry => GetInstanceUpdate(instanceEntry.Value.Id)));
                    List<string> states = Cave.States.Keys.ToList();
                    List<string> scenarios = new List<string>(Cave.Scenarios.Count);
                    scenarios.AddRange(Cave.Scenarios.Select(scenarioEntry => GetScenarioUpdate(scenarioEntry.Value.Name)));
                    string nodeMap = JsonConvert.SerializeObject(Cave.GetNodeMap());
                    string neighbourMap = JsonConvert.SerializeObject(Cave.GetNeighbourMap(nodeId));
                    string moduleList = JsonConvert.SerializeObject(Cave.GetModuleList());
                    string appList = JsonConvert.SerializeObject(Cave.GetAppList());

                    watch.Stop();
                    var elapsedMs = watch.ElapsedMilliseconds;
                    if (elapsedMs > 100) {
                        Log.Info("Long time to get "+nodeId+" status" +elapsedMs);
                        Log.Debug("message data is "+  nodeMap+"|"+ neighbourMap+"|"+ moduleList+"|"+ appList+"|"+ nodes+"|"+ sections+"|"+ modules+"|"+ apps+"|"+ instances+"|"+ states+"|"+ scenarios);
                    }

                    Clients.Caller.receiveCaveUpdate(Cave.Cols, Cave.Rows, Cave.MaintenanceMode, Cave.BlankMode, Cave.DefaultP2PMode, nodeMap, neighbourMap, moduleList, appList, nodes, sections, modules, apps, instances, states, scenarios);
                }
                catch (Exception e)
                {
                    Log.Error("failed to prepare Cave Update ", e);
                }
            //}
        }

        public void BroadcastAppConfigurations(int instanceId)
        {
            lock (Cave.ServerLock)
            {
                try
                {
                    if (Cave.Deployment.ContainsInstance(instanceId))
                    {
                        List<string> configList = Cave.Deployment.Apps[Cave.GetAppName(instanceId)].GetConfigurationList();
                        Clients.All.receiveAppConfigList(instanceId, JsonConvert.SerializeObject(configList));
                    }
                }
                catch (Exception e)
                {
                    Log.Error("failed to BroadcastAppConfigurations", e);
                }
            }
        }

        /// <summary>
        /// Deploys a configuration to an application instance 
        /// </summary>
        /// <param name="instanceId">The instance identifier.</param>
        /// <param name="configName">Name of the configuration.</param>
        public void UseAppConfiguration(int instanceId, string configName)
        {
            lock (Cave.ServerLock)
            {
                try
                {
                    if (Cave.Deployment.ContainsInstance(instanceId)) {
                        var appName = Cave.GetAppName(instanceId);
                        var app = Cave.Deployment.Apps[appName];    
                        if (app.Configurations.ContainsKey(configName))
                        {
                            app.Instances[instanceId].SetConfiguration( app.Configurations[configName]);
                            Cave.LoadAllAppConfigurations(appName, configName);// db805 todo i dont know why this is called
                            List<string> configList = Cave.GetConfigListForApp(appName);
                            string serializedInstance = GetInstanceUpdate(instanceId);
                            BroadcastAppUpdate(true, instanceId, serializedInstance);
                            Clients.All.receiveAppConfigList(instanceId, JsonConvert.SerializeObject(configList));
                            Clients.Group(""+((IBaseAppInstance)Cave.Deployment.Instances[instanceId]).Section.Id).reloadNodeIFrame();
                        }
                    }
                }
                catch (Exception e)
                {
                    Log.Error("failed to UseAppConfiguration", e);
                }
            }
        }

        public void LoadAppConfiguration(int instanceId, string configName)
        {
            lock (Cave.ServerLock)
            {
                try
                {
                    if (Cave.Deployment.ContainsInstance(instanceId)) {
                        var appName = Cave.GetAppName(instanceId);
                        Cave.LoadAllAppConfigurations(appName, configName);// db805 todo i dont know why this is called
                        List<string> configList = Cave.GetConfigListForApp(appName);
                        Clients.All.receiveAppConfigList(instanceId, JsonConvert.SerializeObject(configList));
                    }
                }
                catch (Exception e)
                {
                    Log.Error("failed to LoadAppConfiguration", e);
                }
            }
        }

        public void UnloadAppConfiguration(int instanceId, string configName)
        {
            lock (Cave.ServerLock)
            {
                try
                {
                    if (Cave.Deployment.ContainsInstance(instanceId))
                    {
                        List<string> configList = Cave.UnloadAppConfiguration(Cave.GetAppName(instanceId), configName);
                        Clients.All.receiveAppConfigList(instanceId, JsonConvert.SerializeObject(configList));
                    }
                }
                catch (Exception e)
                {
                    Log.Error("failed to UnloadAppConfiguration", e);
                }
            }
        }

        public void RequestAppConfiguration(int instanceId)
        {
            lock (Cave.ServerLock)
            {
                try
                {
                    if (Cave.Deployment.ContainsInstance(instanceId)) {
                        var configuration = Cave.Deployment.GetInstancebyID(instanceId).GetConfiguration();
                        Clients.Caller.receiveAppConfig(instanceId, Cave.GetAppName(instanceId),
                            configuration.Name,
                            configuration.GetJsonForBrowsers()
                            , true);
                    }
                }
                catch (Exception e)
                {
                    Log.Error("failed to prepare RequestAppConfiguration", e);
                }
            }
        }

        private string GetNodeUpdate(int nodeId)
        {
            if (Cave.Layout.ContainsNode(nodeId))
            {
                try
                {
                    Node node;
                    Cave.Layout.Nodes.TryGetValue(nodeId, out node);
                    if (node != null) {
                        node.AggregateConnectionHealth();
                        return node.SerializeJSON();
                    }
                }
                catch (Exception e)
                {
                    Log.Error("failed to GetNodeUpdate", e);
                    return null;
                }
            }
            return null;
        }

        private string GetSectionUpdate(int sectionId)
        {
            try {
                if (Cave.Deployment.ContainsSection(sectionId)) {
                    Section section;
                    Cave.Deployment.Sections.TryGetValue(sectionId, out section);
                    if (section != null) return section.SerializeJSON();
                }

                Log.Error("failed to GetNodeUpdate for a section which doesn't exist " + sectionId);
                return null;

            }
            catch (Exception e) { // dont think this will hit
                Console.WriteLine(e);
                Log.Error("failed to GetNodeUpdate "+sectionId, e);
                return null;
            }
        }

        private string GetModuleUpdate(string moduleName)
        {
            try
            {
                if (Cave.Layout.ContainsModule(moduleName))
                {

                    return "{\"Name\":\""+moduleName+"\"}";
                }
                else
                {
                    return null;
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return null;
            }
        }

        private string GetAppUpdate(string appName)
        {
            try
            {
                if (Cave.Deployment.ContainsApp(appName))
                {
                    App app;
                    Cave.Deployment.Apps.TryGetValue(appName, out app);
                    if (app != null) return app.SerializeJSON();
                }

                    Log.Error("could not get app update " + appName);
                    return null;                
            }
            catch (Exception e) // dont think this will reach
            {
                Console.WriteLine(e);
                Log.Error("could not get app update "+appName,e);
                return null;
            }
        }

        private string GetInstanceUpdate(int instanceId)//todo i wonder if we actually need to be sending a serialized copy of the instance back and forth? 
        {
            try
            {
                if (Cave.Deployment.ContainsInstance(instanceId))
                {
                    IAppInstance instance;
                    Cave.Deployment.Instances.TryGetValue(instanceId, out instance);
                    return JsonConvert.SerializeObject(instance);
                }
                else
                {
                    return null;
                }
            }
            catch (Exception e)
            {
                Log.Error("failed to get instance update for id "+instanceId+" error was "+e);
                Console.WriteLine(e);
                return null;
            }
        }

        private string GetScenarioUpdate(string scenarioName)
        {
            try
            {
                if (Cave.ContainsScenario(scenarioName))
                {
                    Scenario scenario;
                    Cave.Scenarios.TryGetValue(scenarioName, out scenario);
                    return JsonConvert.SerializeObject(scenario);
                }
                else
                {
                    return null;
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return null;
            }
        }

        /// <summary>
        /// Broadcasts the node update.
        /// </summary>
        /// <param name="nodeId">The node identifier.</param>
        private bool BroadcastNodeUpdate(int nodeId)
        {
            if (Cave.Layout.ContainsNode(nodeId))
            {
                try
                {
                    string serializedNode = GetNodeUpdate(nodeId);
                    if (serializedNode != null)
                    {
                        Clients.All.receiveNodeUpdate(serializedNode);
                        return true;
                    }
                    else
                    {
                        return false;
                    }

                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    return false;
                }
            }
            return false;
        }

        /// <summary>
        /// Broadcasts the section update.
        /// </summary>
        /// <param name="sectionId">The section identifier.</param>
        /// <returns></returns>
        private bool BroadcastSectionUpdate(int sectionId)
        {
            try
            {
                string serializedSection = GetSectionUpdate(sectionId);
                if (Cave.Deployment.ContainsSection(sectionId) && serializedSection != null)
                {
                    Clients.All.receiveSectionUpdate(true, sectionId, serializedSection);
                    return true;
                }
                else
                {
                    Clients.All.receiveSectionUpdate(false, sectionId, "");
                    return true;
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return false;
            }
        }

        private bool BroadcastAppUpdate(bool exists, int instanceId, string serializedInstance)
        {
            try
            {
                Clients.All.receiveAppUpdate(exists, instanceId, serializedInstance);
                return true;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return false;
            }
        }

        /// <summary>
        /// Sends the data.
        /// </summary>
        /// <param name="senderId">The sender identifier.</param>
        /// <param name="receiverId">The receiver identifier.</param>
        /// <param name="data">The data.</param>
        public void SendData(int senderId, int receiverId, string data)
        {
            try
            {
                Clients.Client(Cave.Layout.Nodes[receiverId].ConnectionId).receiveData(senderId, data);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        /// <summary>
        /// Broadcasts the data.
        /// </summary>
        /// <param name="senderID">The sender identifier.</param>
        /// <param name="data">The data.</param>
        public void BroadcastData(int senderID, string data)
        {
            try
            {
                Clients.Others.receiveBroadcast(senderID, data);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        public void SetMaintenanceMode(bool mode)
        {
            lock (Cave.ServerLock)
            {
                Cave.MaintenanceMode = mode;
                Clients.All.setMaintenanceMode(mode);
                //  Clients.All.reloadNodeIFrame(mode); TODO This is showing up a concurrency bug which is crashing the server and some nodes! possibly related to issue #15
            }
        }

        /// <summary>
        /// Tells all clients what maintainence mode they should be in 
        /// </summary>
        public void RequestMaintenanceMode()
        {
            lock (Cave.ServerLock)
            {
                Clients.All.setMaintenanceMode(Cave.MaintenanceMode);
            }
        }

        public void SetBlankMode(bool mode)
        {
            lock (Cave.ServerLock)
            {
                Cave.BlankMode = mode;
                Clients.All.setBlankMode(mode);
                //  Clients.All.reloadNodeIFrame(mode); TODO This is showing up a concurrency bug which is crashing the server and some nodes! possibly related to issue #15
            }
        }

        public void RequestBlankMode()
        {
            lock (Cave.ServerLock)
            {
                Clients.All.setBlankMode(Cave.BlankMode);
            }
        }

        public void JoinGroup(int sectionId)
        {
            Groups.Add(Context.ConnectionId, "" + sectionId);
        }
        public void ExitGroup(int sectionId)
        {
            Groups.Remove(Context.ConnectionId, "" + sectionId);
        }

        public void Initialize()
        {
            InitializeSynchronization();
        }

        private void InitializeSynchronization()
        {
            if (!Cave.InitializedSync)
            {
                Cave.InitializedSync = true;
                Cave.SyncTimer = new Timer(70);
                Cave.SyncTimer.Elapsed += BroadcastHeartbeat;
                Cave.SyncTimer.Start();
            }
        }

        private void BroadcastHeartbeat(object source, ElapsedEventArgs e)
        {
            DateTime now = DateTime.Now;
            Clients.All.receiveHeartbeat((long)(now - new DateTime(1970, 1, 1)).TotalMilliseconds);
        }

        public void ClearCave() {
            lock (Cave.ServerLock) {
                foreach (KeyValuePair<int, IAppInstance> instanceKeyValuePair in Cave.Deployment.Instances) {
                    CloseApp(instanceKeyValuePair.Value.Id);
                }
                foreach (KeyValuePair<int, Section> sectionKeyValuePair in Cave.Deployment.Sections) {
                    if (sectionKeyValuePair.Key != 0) {
                        CloseSection(sectionKeyValuePair.Value.Id);
                    }
                }
            }
        }
        #region CaveState

        public void SaveCaveState(string name)
        {
            lock (Cave.ServerLock) {
                if (Cave.SaveCaveState(name)) {
                    BroadcastCaveState(name);
                }
            }
        }
        public void RemoveCaveState(string name)
        {
            lock (Cave.ServerLock)
            {
                if (Cave.RemoveCaveState(name)) {
                    BroadcastCaveState(name);
                }
            }
        }

        /// <summary>
        /// Clears the Cave and Restores the state of the cave.
        /// </summary>
        /// <param name="name">The name of the CAVE State</param>
        public void RestoreCaveState(string name)
        {
            Log.Info("about to restore Cave state "+name);
           // lock (Cave.ServerLock) { i fear we are double locking here...
                Log.Info("about to restore Cave state " + name);
                State caveState = Cave.States[name];
                RestoreCaveState(caveState);
            //}

        }

        /// <summary>
        /// Clears the Cave and Restores the state of the cave.
        /// </summary>
        /// <param name="caveState">The state of the CAVE</param>
        private void RestoreCaveState(State caveState) {
            Log.Info("about to restore cave state "+caveState.Name);
            ClearCave();

            //TODO Composite apps
            foreach (AppState appState in caveState.States) {
                try {
                    Log.Info("creating section");
                    CreateSection(appState.Col, appState.Row, (appState.Col + appState.Cols - 1),
                        (appState.Row + appState.Rows - 1));
                    Cave.GetSectionId(appState.Col, appState.Row);
                    Log.Info("deploying app " + appState.AppName + " with config " + appState.Config.Name);
                    DeployBaseApp(Cave.GetSectionId(appState.Col, appState.Row), appState.AppName, appState.Config);
                }
                catch (Exception e) {
                    Log.Error("failed to load app state "+e);
                }
            }
        }

        /// <summary>
        /// Sends a series of messages to the caller with the name of each cave state which is known about....
        /// </summary>
        public void RequestStates()
        {
            foreach (var caveState in Cave.States)
            {
                Clients.Caller.receiveCaveState(caveState.Value.Name);
            }
        }

        public void BroadcastStates()
        {
            foreach (var caveState in Cave.States)
            {
                BroadcastCaveState(caveState.Value.Name);
            }
        }

        public void BroadcastCaveState(string name) {
            Clients.All.receiveCaveState(name, Cave.States.ContainsKey(name));
        }

        #endregion

        public void SaveScenario(string json)
        {
            lock (Cave.ServerLock)
            {
                Scenario scenario = Cave.SaveScenario(json);
                if (scenario != null)
                {
                    Clients.All.receiveScenarioUpdate(true, scenario.Name, GetScenarioUpdate(scenario.Name));
                }
            }
        }
        public void RemoveScenario(string name)
        {
            lock (Cave.ServerLock)
            {
                if (Cave.RemoveScenario(name))
                {
                    Clients.All.receiveScenarioUpdate(false, name, "");
                }
            }
        }

        public void DisplayTime()
        {
            lock (Cave.ServerLock)
            {
               Clients.All.displayTime();
            }
        }
        public void ExecuteFunction(string func, int section)
        {
            lock (Cave.ServerLock)
            {
                Clients.Group(""+section).executeFunction(func);
            }
        }

        public void ExecuteDelayedFunction(string func, int section, int start)
        {
            lock (Cave.ServerLock)
            {
                Clients.Group("" + section).executeDelayedFunction(func,start);
            }
        }

        public void UpdateConsole(string consoleId)
        {
            lock (Cave.ServerLock)
            {
                Cave.ConsoleId = consoleId;
                Clients.All.receiveConsoleId(consoleId);
            }
        }

        public void RequestConsole()
        {
            Clients.Caller.receiveConsoleId(Cave.ConsoleId);
        }

        /// <summary>
        /// Converts a section ID to an App ID 
        /// </summary>
        /// <param name="sectionId">The section identifier.</param>
        /// <returns>App Instance Id</returns>
        public int GetAppID(int sectionId) {

            if (Cave.Deployment.ContainsSection(sectionId)) {
                Section section;
                Cave.Deployment.Sections.TryGetValue(sectionId, out section);
                if (section != null) {
                    return section.AppInstanceId; 
                }
            }

            Log.Error("could not find section Id "+sectionId);
            return -1;
        }
    }

}