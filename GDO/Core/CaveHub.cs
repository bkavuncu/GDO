using System;
using System.Collections.Generic;
using System.Linq;
using System.Timers;
using GDO.Core.Apps;
using GDO.Core.Scenarios;
using GDO.Core.States;
using log4net;
using Microsoft.AspNet.SignalR;
using Newtonsoft.Json;

namespace GDO.Core
{
    public class CaveHub : Hub
    {
        private static readonly ILog Log = LogManager.GetLogger(typeof(CaveHub));

        public override System.Threading.Tasks.Task OnConnected()
        {
            return base.OnConnected();
        }

        public override System.Threading.Tasks.Task OnDisconnected(bool stopCalled)
        {
            lock (Cave.ServerLock)
            {
                Node node = Cave.GetNode(Context.ConnectionId);
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
                Node node = Cave.DeployNode(sectionId, nodeId, col, row);
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
                Node node = Cave.FreeNode(nodeId);
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
        /// <returns></returns>
        public bool CreateSection(int colStart, int rowStart, int colEnd, int rowEnd)
        {
            lock (Cave.ServerLock)
            {
                List<Node> deployedNodes = Cave.CreateSection(colStart, rowStart, colEnd, rowEnd);
                if (deployedNodes.Capacity > 0)
                {
                    foreach (Node node in deployedNodes)
                    {
                        if (node.ConnectionId != null)
                        {
                            Groups.Add(node.ConnectionId, node.SectionId.ToString());
                        }
                    }
                    BroadcastSectionUpdate(Cave.GetSectionId(colStart, rowStart));
                    return true;
                }
                else
                {
                    return false;
                }
            }
        }

        /// <summary>
        /// Closes a section.
        /// </summary>
        /// <param name="sectionId">The section identifier.</param>
        /// <returns></returns>
        public bool CloseSection(int sectionId)
        {
            lock (Cave.ServerLock)
            {
                List<Node> freedNodes = Cave.CloseSection(sectionId);
                if (freedNodes.Capacity > 0)
                {
                    foreach (Node node in freedNodes)
                    {
                        if (node.ConnectionId != null)
                        {
                            Groups.Remove(node.ConnectionId, node.SectionId.ToString());
                        }
                    }
                    BroadcastSectionUpdate(sectionId);
                    return true;
                }
                else
                {
                    return false;
                }
            }
        }

        /// <summary>
        /// Sets the section P2P mode.
        /// </summary>
        /// <param name="sectionId">The section identifier.</param>
        /// <param name="p2pmode">The p2pmode.</param>
        public bool SetSectionP2PMode(int sectionId, int p2pmode)
        {
            lock (Cave.ServerLock)
            {
                List<Node> affectedNodes = Cave.SetSectionP2PMode(sectionId, p2pmode);
                if (affectedNodes.Capacity > 0)
                {
                    BroadcastSectionUpdate(sectionId);
                    foreach (Node node in affectedNodes)
                    {
                        BroadcastNodeUpdate(node.Id);
                    }
                    return true;
                }
                else
                {
                    return false;
                }
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
        public int DeployBaseApp(int sectionId, string appName, string configName)
        {
            lock (Cave.ServerLock)
            {
                int instanceId = Cave.CreateBaseAppInstance(sectionId, appName, configName);
                Cave.SetSectionP2PMode(sectionId, Cave.Apps[appName].P2PMode);
                if (instanceId >= 0)
                {
                    string serializedInstance = GetInstanceUpdate(instanceId);
                    BroadcastAppUpdate(true, instanceId, serializedInstance);
                }
                return instanceId;
            }
        }


        public int DeployAdvancedApp(List<int> instanceIds, string appName, string configName)
        {
            lock (Cave.ServerLock)
            {
                int instanceId = Cave.CreateAdvancedAppInstance(instanceIds, appName, configName);
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
                if (Cave.ContainsInstance(instanceId))
                {
                    string appName = Cave.GetAppName(instanceId);
                    string serializedInstance = GetInstanceUpdate(instanceId);
                    if (Cave.Apps[appName].Instances[instanceId] is IBaseAppInstance)
                    {
                        int sectionId = ((IBaseAppInstance)Cave.Apps[appName].Instances[instanceId]).Section.Id;
                        Cave.SetSectionP2PMode(sectionId, Cave.DefaultP2PMode);
                    }
                    else if (Cave.Apps[appName].Instances[instanceId] is IAdvancedAppInstance)
                    {
                        List<int> integratedInstances = ((IAdvancedAppInstance)Cave.Apps[appName].Instances[instanceId]).GetListofIntegratedInstances();
                    }
                    if (Cave.DisposeAppInstance(appName, instanceId))
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
            lock (Cave.ServerLock)
            {
                Node node;
                Cave.Nodes.TryGetValue(nodeId, out node);
                node.IsConnectedToCaveServer = true;
                node.ConnectionId = connectionId;
                node.PeerId = peerId;
                node.IsConnectedToPeerServer = isConnectedToPeerServer;
                int[] deserializedConnectedNodes = JsonConvert.DeserializeObject<int[]>(connectedNodes);
                node.ConnectedNodeList.Clear();
                foreach (int connectedNode in deserializedConnectedNodes)
                {
                    node.ConnectedNodeList.Add(connectedNode);
                }
                if (node.IsDeployed)
                {
                    Groups.Add(node.ConnectionId, node.SectionId.ToString());
                }
                else
                {
                    Groups.Remove(node.ConnectionId, node.SectionId.ToString());
                }
                node.AggregateConnectionHealth();
                BroadcastNodeUpdate(nodeId);
            }
        }

        public void RequestCaveUpdate(int nodeId)
        {
            lock (Cave.ServerLock)
            {
                try
                {
                    List<string> nodes = new List<string>(Cave.Nodes.Count);
                    nodes.AddRange(Cave.Nodes.Select(nodeEntry => GetNodeUpdate(nodeEntry.Value.Id)));
                    List<string> sections = new List<string>(Cave.Sections.Count);
                    sections.AddRange(Cave.Sections.Select(sectionEntry => GetSectionUpdate(sectionEntry.Value.Id)));
                    List<string> modules = new List<string>(Cave.Modules.Count);
                    modules.AddRange(Cave.Modules.Select(moduleEntry => GetModuleUpdate(moduleEntry.Value.Name)));
                    List<string> apps = new List<string>(Cave.Apps.Count);
                    apps.AddRange(Cave.Apps.Select(appEntry => GetAppUpdate(appEntry.Value.Name)));
                    List<string> instances = new List<string>(Cave.Instances.Count);
                    instances.AddRange(Cave.Instances.Select(instanceEntry => GetInstanceUpdate(instanceEntry.Value.Id)));
                    List<string> states = new List<string>(Cave.States.Count);
                    states.AddRange(Cave.States.Select(stateEntry => GetStateUpdate(stateEntry.Value.Id)));
                    List<string> scenarios = new List<string>(Cave.Scenarios.Count);
                    scenarios.AddRange(Cave.Scenarios.Select(scenarioEntry => GetScenarioUpdate(scenarioEntry.Value.Name)));
                    string nodeMap = JsonConvert.SerializeObject(Cave.GetNodeMap());
                    string neighbourMap = JsonConvert.SerializeObject(Cave.GetNeighbourMap(nodeId));
                    string moduleList = JsonConvert.SerializeObject(Cave.GetModuleList());
                    string appList = JsonConvert.SerializeObject(Cave.GetAppList());

                    Clients.Caller.receiveCaveUpdate(Cave.Cols, Cave.Rows, Cave.MaintenanceMode, Cave.BlankMode, Cave.DefaultP2PMode, nodeMap, neighbourMap, moduleList, appList, nodes, sections, modules, apps, instances, states, scenarios);
                }
                catch (Exception e)
                {
                    Log.Error("failed to prepare Cave Update ", e);
                }
            }
        }

        public void BroadcastAppConfigurations(int instanceId)
        {
            lock (Cave.ServerLock)
            {
                try
                {
                    if (Cave.ContainsInstance(instanceId))
                    {
                        List<string> configList = Cave.Apps[Cave.GetAppName(instanceId)].GetConfigurationList();
                        Clients.All.receiveAppConfigList(instanceId, JsonConvert.SerializeObject(configList));
                    }
                }
                catch (Exception e)
                {

                }
            }
        }

        public void UseAppConfiguration(int instanceId, string configName)
        {
            lock (Cave.ServerLock)
            {
                try
                {
                    if (Cave.ContainsInstance(instanceId))
                    {
                        if (Cave.Apps[Cave.GetAppName(instanceId)].Configurations.ContainsKey(configName))
                        {
                            Cave.Apps[Cave.GetAppName(instanceId)].Instances[instanceId].Configuration = Cave.Apps[Cave.GetAppName(instanceId)].Configurations[configName];
                            List<string> configList = Cave.LoadAppConfiguration(Cave.GetAppName(instanceId), configName);
                            string serializedInstance = GetInstanceUpdate(instanceId);
                            BroadcastAppUpdate(true, instanceId, serializedInstance);
                            Clients.All.receiveAppConfigList(instanceId, JsonConvert.SerializeObject(configList));
                            Clients.Group(""+((IBaseAppInstance)Cave.Instances[instanceId]).Section.Id).reloadNodeIFrame();
                        }
                    }
                }
                catch (Exception e)
                {

                }
            }
        }

        public void LoadAppConfiguration(int instanceId, string configName)
        {
            lock (Cave.ServerLock)
            {
                try
                {
                    if (Cave.ContainsInstance(instanceId))
                    {
                        List<string> configList = Cave.LoadAppConfiguration(Cave.GetAppName(instanceId), configName);
                        Clients.All.receiveAppConfigList(instanceId, JsonConvert.SerializeObject(configList));
                    }
                }
                catch (Exception e)
                {

                }
            }
        }

        public void UnloadAppConfiguration(int instanceId, string configName)
        {
            lock (Cave.ServerLock)
            {
                try
                {
                    if (Cave.ContainsInstance(instanceId))
                    {
                        List<string> configList = Cave.UnloadAppConfiguration(Cave.GetAppName(instanceId), configName);
                        Clients.All.receiveAppConfigList(instanceId, JsonConvert.SerializeObject(configList));
                    }
                }
                catch (Exception e)
                {

                }
            }
        }

        public void RequestAppConfiguration(int instanceId)
        {
            lock (Cave.ServerLock)
            {
                try
                {
                    if (Cave.ContainsInstance(instanceId))
                    {
                        Clients.Caller.receiveAppConfig(instanceId, Cave.GetAppName(instanceId), Cave.Apps[Cave.GetAppName(instanceId)].Instances[instanceId].Configuration.Name,
                            JsonConvert.SerializeObject(Cave.Apps[Cave.GetAppName(instanceId)].Instances[instanceId].Configuration.Json.ToString()), true);
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
            if (Cave.ContainsNode(nodeId))
            {
                try
                {
                    Node node;
                    Cave.Nodes.TryGetValue(nodeId, out node);
                    node.AggregateConnectionHealth();
                    return node.SerializeJSON();
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
            try
            {
                if (Cave.ContainsSection(sectionId))
                {
                    Section section;
                    Cave.Sections.TryGetValue(sectionId, out section);
                    return section.SerializeJSON();
                }
                else
                {
                    return null;
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                Log.Error("failed to GetNodeUpdate", e);
                return null;
            }
        }
        private string GetModuleUpdate(string moduleName)
        {
            try
            {
                if (Cave.ContainsModule(moduleName))
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
                if (Cave.ContainsApp(appName))
                {
                    App app;
                    Cave.Apps.TryGetValue(appName, out app);
                    return app.SerializeJSON();
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

        private string GetInstanceUpdate(int instanceId)
        {
            try
            {
                if (Cave.ContainsInstance(instanceId))
                {
                    IAppInstance instance;
                    Cave.Instances.TryGetValue(instanceId, out instance);
                    return JsonConvert.SerializeObject(instance);
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

        private string GetStateUpdate(int stateId)
        {
            try
            {
                if (Cave.ContainsState(stateId))
                {
                    State state;
                    Cave.States.TryGetValue(stateId, out state);
                    return JsonConvert.SerializeObject(state);
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
            if (Cave.ContainsNode(nodeId))
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
                if (Cave.ContainsSection(sectionId) && serializedSection != null)
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
                Clients.Client(Cave.Nodes[receiverId].ConnectionId).receiveData(senderId, data);
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
                Cave.SyncTimer = new System.Timers.Timer(70);
                Cave.SyncTimer.Elapsed += new ElapsedEventHandler(BroadcastHeartbeat);
                Cave.SyncTimer.Start();
            }
        }


        private void BroadcastHeartbeat(object source, ElapsedEventArgs e)
        {
            DateTime now = DateTime.Now;
            Clients.All.receiveHeartbeat((long)(now - new DateTime(1970, 1, 1)).TotalMilliseconds);
        }

        public void SaveCaveState(string name)
        {
            lock (Cave.ServerLock)
            {
                int id = Cave.SaveCaveState(name);
                BroadcastCaveState(id);
            }
        }
        public void RemoveCaveState(int id)
        {
            lock (Cave.ServerLock)
            {
                Cave.RemoveCaveState(id);
                BroadcastCaveState(id);
            }
        }

        public void ClearCave()
        {
            lock (Cave.ServerLock)
            {
                foreach (KeyValuePair<int, IAppInstance> instanceKeyValuePair in Cave.Instances)
                {
                    CloseApp(instanceKeyValuePair.Value.Id);
                }
                foreach (KeyValuePair<int, Section> sectionKeyValuePair in Cave.Sections)
                {
                    if (sectionKeyValuePair.Key != 0)
                    {
                        CloseSection(sectionKeyValuePair.Value.Id);
                    }
                }
            }
        }

        public void RestoreCaveState(int id)
        {
            lock (Cave.ServerLock)
            {
                State caveState = Cave.States[id];
                ClearCave();
                
                //TODO Advanced apps
                foreach (AppState appState in caveState.States)
                {
                    CreateSection(appState.Col, appState.Row, (appState.Col + appState.Cols -1),
                        (appState.Row + appState.Rows -1));
                    Cave.GetSectionId(appState.Col, appState.Row);
                    DeployBaseApp(Cave.GetSectionId(appState.Col, appState.Row), appState.AppName, appState.ConfigName);
                }
            }

        }

        public void RequestStates()
        {
            foreach (KeyValuePair<int, State> caveState in Cave.States)
            {
                Clients.Caller.receiveCaveState(JsonConvert.SerializeObject(Cave.States[caveState.Value.Id]));
            }
        }

        public void BroadcastStates()
        {
            foreach (KeyValuePair<int, State> caveState in Cave.States)
            {
                BroadcastCaveState(caveState.Value.Id);
            }
        }

        public void BroadcastCaveState(int id)
        {
            if (Cave.States.ContainsKey(id))
            {
                Clients.All.receiveCaveState(JsonConvert.SerializeObject(Cave.States[id]), id, true);
            }
            else
            {
                Clients.All.receiveCaveState("", id, false);
            }
        }

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

        public void UpdateConsoleInstance(int instanceId)
        {
            lock (Cave.ServerLock)
            {
                Cave.ConsoleInstanceId = instanceId;
                Clients.All.receiveConsoleInstanceId(instanceId);
            }
        }

        public void RequestConsoleInstance()
        {
            Clients.Caller.receiveConsoleInstanceId(Cave.ConsoleInstanceId);
        }
    }
}