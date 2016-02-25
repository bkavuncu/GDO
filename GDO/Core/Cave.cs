using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Configuration;
using System.Diagnostics;
using System.IO;
using System.Linq;
using GDO.Core.Apps;
using GDO.Core.Modules;
using GDO.Core.Scenarios;
using GDO.Core.States;
using GDO.Utility;
using log4net;
using Newtonsoft.Json.Linq;

namespace GDO.Core
{
    // TODO also check how static controls are recycled during the asp.net lifecycle 
    /// <summary>
    /// Cave Object Class
    /// </summary>
    public sealed class Cave
    {
        private static readonly ILog Log = LogManager.GetLogger(typeof(Cave));

        private static Cave Self = null;
        public static readonly object ServerLock = new object();
        public static readonly List<object> AppLocks = new List<object>();
        public static readonly Dictionary<string,object> ModuleLocks = new Dictionary<string,object>();

        public static bool MaintenanceMode { get; set; }
        public static bool BlankMode { get; set; }
        public static int Cols { get; set; }
        public static int Rows { get; set; }
        public static int NodeWidth { get; set; }
        public static int NodeHeight { get; set; }
        public static int DefaultP2PMode { get; set; }
        public static bool InitializedSync { get; set; }
        public static System.Timers.Timer SyncTimer { get; set; }
        public static ConcurrentDictionary<string, App> Apps { get; set; }
        public static ConcurrentDictionary<string, IModule> Modules { get; set; }
        public static ConcurrentDictionary<int, IAppInstance> Instances { get; set; }
        public static ConcurrentDictionary<int, Node> Nodes { get; set; }
        public static ConcurrentDictionary<int, Section> Sections { get; set; }
        public static ConcurrentDictionary<int, State> States { get; set; }
        public static ConcurrentDictionary<string, Scenario> Scenarios { get; set; }

        public enum P2PModes
        {
            None = -1,
            Cave = 1,
            Section = 2,
            Neighbours = 3
        };
        public enum AppTypes
        {
            None = -1,
            Base = 1,
            Advanced = 2
        };
        /// <summary>
        /// Initializes a new instance of the <see cref="Cave"/> class.
        /// </summary>
        public Cave()
        {
            //CurrentHeartbeat = 0;
            //MaximumHeartbeat = 1000000;
            MaintenanceMode = true;
            BlankMode = false;
            Apps = new ConcurrentDictionary<string, App>();
            Modules = new ConcurrentDictionary<string, IModule>();
            Instances = new ConcurrentDictionary<int, IAppInstance>();
            Nodes = new ConcurrentDictionary<int, Node>();
            Sections = new ConcurrentDictionary<int, Section>();
            States = new ConcurrentDictionary<int, State>();
            Scenarios = new ConcurrentDictionary<string, Scenario>();
            Cols = int.Parse(ConfigurationManager.AppSettings["numCols"]);
            Rows = int.Parse(ConfigurationManager.AppSettings["numRows"]);
            NodeWidth = int.Parse(ConfigurationManager.AppSettings["nodeWidth"]);
            NodeHeight = int.Parse(ConfigurationManager.AppSettings["nodeheight"]);
            DefaultP2PMode = int.Parse(ConfigurationManager.AppSettings["p2pmode"]);
            InitializedSync = false;

            /*Assembly asm = Assembly.GetExecutingAssembly();

            foreach (Type type in asm.GetTypes())
            {
                if (Regex.IsMatch(type.FullName, "GDO.Core.Modules.*Module") && !Regex.IsMatch(type.FullName, "GDO.Core.Modules.*ModuleHub"))
                {
                    IModule module = (IModule)Activator.CreateInstance(type, new object[0]);
                    module.Init();
                    Modules.TryAdd(module.Name, module);
                }
            }*/

            for (int id = 1; id <= Cols * Rows; id++)
            {
                string[] s = ConfigurationManager.AppSettings["node" + id].Split(',');
                int col = int.Parse(s[0]);
                int row = int.Parse(s[1]);
                CreateNode(id, col, row);
                AppLocks.Add(new object());
            }
            CreateSection(0, 0, Cols - 1, Rows - 1); //Free Nodes Pool , id=0
            LoadScenarios();
            Log.Info("Created new CAVE object");
        }

        /// <summary>
        /// Gets the instance.
        /// </summary>
        /// <value>
        /// The instance.
        /// </value>
        public static Cave Instance
        {
            get
            {
                lock (ServerLock)
                {
                    return Self ?? (Self = new Cave());
                }
            }
        }

        /// <summary>
        /// Initializes the cave.
        /// </summary>
        public static void Init()
        {
            lock (ServerLock)
            {
                if (Self == null)
                {
                    Self = new Cave();
                }
            }
        }

        /// <summary>
        /// Creates the node.
        /// </summary>
        /// <param name="nodeId">The node identifier.</param>
        /// <param name="col">The col.</param>
        /// <param name="row">The row.</param>
        public static void CreateNode(int nodeId, int col, int row)
        {
            Node node = new Node(nodeId, col, row, NodeWidth, NodeHeight, Rows * Cols);
            Nodes.TryAdd(nodeId, node);
        }

        /// <summary>
        /// Gets the node with connectionId.
        /// </summary>
        /// <param name="connectionId">The connection identifier.</param>
        /// <returns></returns>
        public static Node GetNode(string connectionId) {
            return
                (from nodeEntry in Nodes
                    where connectionId == nodeEntry.Value.ConnectionId
                    select nodeEntry.Value)
                    .FirstOrDefault();
        }


        /// <summary>
        /// Deploys the node to a section.
        /// </summary>
        /// <param name="sectionId">The section identifier.</param>
        /// <param name="nodeId">The node identifier.</param>
        /// <param name="col">The col.</param>
        /// <param name="row">The row.</param>
        /// <returns></returns>
        public static Node DeployNode(int sectionId, int nodeId, int col, int row) {
            if (Sections.ContainsKey(sectionId) && Nodes.ContainsKey(nodeId)) {
                if (!Nodes[nodeId].IsDeployed) {
                    Nodes[nodeId].Deploy(Sections[sectionId], col, row);
                    Sections[sectionId].Nodes[col, row] = Nodes[nodeId];
                    return Nodes[nodeId];
                }
            }
            return null;
        }

        /// <summary>
        /// Frees the node.
        /// </summary>
        /// <param name="nodeId">The node identifier.</param>
        /// <returns></returns>
        public static Node FreeNode(int nodeId) {
            if (Nodes.ContainsKey(nodeId)) {
                Nodes[nodeId].Free();
                return Nodes[nodeId];
            }
            return null;
        }

        /// <summary>
        /// Sets the node P2P mode.
        /// </summary>
        /// <param name="nodeId">The node identifier.</param>
        /// <param name="p2pmode">The p2pmode.</param>
        /// <returns></returns>
        public static Node SetNodeP2PMode(int nodeId, int p2pmode)
        {
            Nodes[nodeId].P2PMode = p2pmode;
            return Nodes[nodeId];
        }

        /// <summary>
        /// Creates a section.
        /// </summary>
        /// <param name="colStart">The col start.</param>
        /// <param name="rowStart">The row start.</param>
        /// <param name="colEnd">The col end.</param>
        /// <param name="rowEnd">The row end.</param>
        /// <returns></returns>
        public static List<Node> CreateSection(int colStart, int rowStart, int colEnd, int rowEnd)
        {
            List<Node> deployedNodes = new List<Node>();
            if (IsSectionFree(colStart, rowStart, colEnd, rowEnd))
            {
                int sectionId = Utilities.GetAvailableSlot<Section>(Sections);
                Section section = new Section(sectionId, colStart, rowStart, colEnd - colStart + 1, rowEnd - rowStart + 1);
                Sections.TryAdd(sectionId, section);
                    
                foreach (KeyValuePair<int, Node> nodeEntry in Nodes)
                {
                    Node node = nodeEntry.Value;
                    if (node.Col <= colEnd && node.Col >= colStart && node.Row <= rowEnd && node.Row >= rowStart)
                    {
                        deployedNodes.Add(DeployNode(section.Id, node.Id, node.Col - colStart, node.Row - rowStart));
                    }
                }
                section.CalculateDimensions();
            }
            return deployedNodes;
        }
        /// <summary>
        /// Closes the section.
        /// </summary>
        /// <param name="sectionId">The section identifier.</param>
        /// <returns></returns>
        public static List<Node> CloseSection(int sectionId)
        {
            List<Node> freedNodes = new List<Node>();
            if (ContainsSection(sectionId))
            {
                if (!Sections[sectionId].IsDeployed())
                {
                    foreach (Node node in Sections[sectionId].Nodes)
                    {
                        freedNodes.Add(FreeNode(node.Id));
                    }
                    Sections[sectionId].Nodes = null;
                    Section section;
                    Sections.TryRemove(sectionId, out section);
                }
            }
            return freedNodes;
        }

        /// <summary>
        /// Determines whether [is section free] [the specified col start].
        /// </summary>
        /// <param name="colStart">The col start.</param>
        /// <param name="rowStart">The row start.</param>
        /// <param name="colEnd">The col end.</param>
        /// <param name="rowEnd">The row end.</param>
        /// <returns></returns>
        public static bool IsSectionFree(int colStart, int rowStart, int colEnd, int rowEnd) {
            foreach (KeyValuePair<int, Node> nodeEntry in Nodes) {
                Node node = nodeEntry.Value;
                if (colStart > colEnd || rowStart > rowEnd) {
                    return false;
                }
                if (node.Col <= colEnd && node.Col >= colStart && node.Row <= rowEnd && node.Row >= rowStart) {
                    if (node.IsDeployed) {
                        return false;
                    }
                }
            }
            return true;
        }

        /// <summary>
        /// Determines whether the specified node identifier contains node.
        /// </summary>
        /// <param name="nodeId">The node identifier.</param>
        /// <returns></returns>
        public static bool ContainsNode(int nodeId) {
            return Nodes.ContainsKey(nodeId);
        }

        /// <summary>
        /// Determines whether the specified section identifier contains section.
        /// </summary>
        /// <param name="sectionId">The section identifier.</param>
        /// <returns></returns>
        public static bool ContainsSection(int sectionId) {
            return Sections.ContainsKey(sectionId);
        }

        public static bool ContainsModule(string moduleName)
        {
            return Modules.ContainsKey(moduleName);
        }

        public static bool ContainsApp(string appName) {
            return Apps.ContainsKey(appName);
        }

        /// <summary>
        /// Determines whether the specified instance identifier contains instance.
        /// </summary>
        /// <param name="instanceId">The instance identifier.</param>
        /// <returns></returns>
        public static bool ContainsInstance(int instanceId) {
            return Apps.Any(appEntry => appEntry.Value.Instances.ContainsKey(instanceId));
        }

        public static bool ContainsState(int stateId)
        {
            return States.ContainsKey(stateId);
        }

        public static bool ContainsScenario(string scenarioName)
        {
            return Scenarios.ContainsKey(scenarioName);
        }

        /// <summary>
        /// Gets the section identifier.
        /// </summary>
        /// <param name="col">The col.</param>
        /// <param name="row">The row.</param>
        /// <returns></returns>
        public static int GetSectionId(int col, int row) {
            return Nodes[GetNodeId(col, row)].SectionId;
        }
        /// <summary>
        /// Gets the node identifier.
        /// </summary>
        /// <param name="col">The col.</param>
        /// <param name="row">The row.</param>
        /// <returns></returns>
        public static int GetNodeId(int col, int row)
        {
            foreach (KeyValuePair<int, Node> nodeEntry in Nodes)
            {
                if (nodeEntry.Value.Col == col && nodeEntry.Value.Row == row)
                {
                    return nodeEntry.Value.Id;
                }
            }
            return -1;
        }

        /// <summary>
        /// Sets the section p2p mode.
        /// </summary>
        /// <param name="sectionId">The section identifier.</param>
        /// <param name="p2pmode">The p2pmode.</param>
        /// <returns></returns>
        public static List<Node> SetSectionP2PMode(int sectionId, int p2pmode)
        {
            List<Node> affectedNodes = new List<Node>();
            if (ContainsSection(sectionId))
            {
                //close app
                foreach (Node node in Sections[sectionId].Nodes)
                {
                    affectedNodes.Add(SetNodeP2PMode(node.Id, p2pmode));
                }
            }
            return affectedNodes;
        }

        /// <summary>
        /// Gets the node map (Matrix of NodeIds in the Cave).
        /// </summary>
        /// <returns></returns>
        public static int[,] GetNodeMap()
        {
            int[,] nodeMap = new int[Cols, Rows];
            foreach (KeyValuePair<int, Node> nodeEntry in Nodes)
            {
                nodeMap[nodeEntry.Value.Col, nodeEntry.Value.Row] = nodeEntry.Value.Id;
            }
            return nodeMap;
        }

        /// <summary>
        /// Gets the section map (Matrix of NodeIds in the Section).
        /// </summary>
        /// <param name="sectionId">The section identifier.</param>
        /// <returns></returns>
        public static int[,] GetSectionMap(int sectionId)
        {
            int[,] sectionMap = null;
            if (ContainsSection(sectionId))
            {
                sectionMap = new int[Sections[sectionId].Cols, Sections[sectionId].Rows];
                foreach (var nodeEntry in Nodes)
                {
                    if (nodeEntry.Value.SectionId == sectionId)
                    {
                        sectionMap[nodeEntry.Value.SectionCol, nodeEntry.Value.SectionRow] = nodeEntry.Value.Id;
                    }
                }
            }
            return sectionMap;
        }

        /// <summary>
        /// Gets the neighbour map (Matrix 3x3 of NodeIds in the Neighbourhood of the Node).
        /// </summary>
        /// <param name="nodeId">The node identifier.</param>
        /// <returns></returns>
        public static int[,] GetNeighbourMap(int nodeId)
        {
            int[,] neighbours = null;
            if (ContainsNode(nodeId))
            {
                int[,] nodeMap = GetNodeMap();
                neighbours = new int[3, 3];
                for (int i = -1; i < 2; i++)
                {
                    for (int j = -1; j < 2; j++)
                    {
                        int col = Nodes[nodeId].Col + i;
                        int row = Nodes[nodeId].Row + j;
                        if (col >= 0 && row >= 0 && col < Cols && row < Rows)
                        {
                            neighbours[i + 1, j + 1] = nodeMap[col, row];
                        }
                        else
                        {
                            neighbours[i + 1, j + 1] = -1;
                        }
                    }
                }
            }
            return neighbours;
        }


        public static bool RegisterApp(string name, int p2pmode, Type appClassType, bool isAdvanced, List<string> supportedApps ) {
            if (!Apps.ContainsKey(name))
            {
                App app;
                if (isAdvanced)
                {
                    app = new AdvancedApp(name, appClassType, (int)Cave.AppTypes.Advanced, supportedApps);
                }
                else
                {
                    app = new App(name, p2pmode, appClassType, (int)Cave.AppTypes.Base);
                }
                Apps.TryAdd(name, app);
                List<AppConfiguration> configurations = LoadAppConfigurations(name);
                foreach (var configuration in configurations)
                {
                    Log.Info("registering an app configuration for app " + name + " called " + configuration.Name);
                    Apps[name].Configurations.TryAdd(configuration.Name, configuration);
                }
                return true;
            }
            return false;
        }

        public static bool RegisterModule(string name, Type moduleClassType)
        {
            if (!Modules.ContainsKey(name))
            {
                IModule module = (IModule)Activator.CreateInstance(moduleClassType, new object[0]);
                module.Init();
                Modules.TryAdd(module.Name, module);
                ModuleLocks.Add(module.Name, new object());
                return true;
            }
            return false;
        }

        public static bool LoadScenarios()
        {
            try
            {
                Directory.SetCurrentDirectory(AppDomain.CurrentDomain.BaseDirectory);
                String path = Directory.GetCurrentDirectory() + @"\Scenarios\";  // TODO using server.map path
                if (Directory.Exists(path))
                {
                    string[] filePaths = Directory.GetFiles(@path, "*.json", SearchOption.AllDirectories);
                    //todo comment why the@ is needed
                    foreach (string filePath in filePaths)
                    {
                        Scenario scenario = Utilities.LoadJsonFile<Scenario>(filePath);
                        if (scenario != null)
                        {
                            Log.Info("Found scenario called " + scenario.Name + " about to load");
                            Scenarios.TryAdd(scenario.Name, scenario);
                        }
                    }
                    return true;
                }
                else
                {
                    return false;
                }

            }
            catch (Exception e)
            {
                return false;
            }
        }

        public static bool SaveScenario(Scenario scenario)
        {
            try
            {
                Utilities.SaveJsonFile<Scenario>(scenario.Name, "Scenarios", scenario);
                return true;
            }
            catch (Exception e)
            {
                return false;
            }
        }

        /// <summary>
        /// Loads the application configurations.
        /// </summary>
        /// <param name="appName">Name of the application.</param>
        /// <returns></returns>
        public static List<AppConfiguration> LoadAppConfigurations(string appName)
        {
            Log.Info("loading configurations fro App "+appName);
            List <AppConfiguration> configurations = new List<AppConfiguration>();
            //TODO Load app configurations from /Configurations/AppName directory
            Directory.SetCurrentDirectory(AppDomain.CurrentDomain.BaseDirectory);
            String path = Directory.GetCurrentDirectory() + @"\Configurations\" + appName;  // TODO using server.map path
            if (Directory.Exists(path))
            {
                string[] filePaths = Directory.GetFiles(@path, "*.json", SearchOption.AllDirectories);//todo comment why the@ is needed
                foreach (string filePath in filePaths)
                {
                    JObject json = Utilities.LoadJsonFile(filePath);
                    if (json != null)
                    {
                        string configurationName = Utilities.RemoveString(filePath, path + "\\");
                        configurationName = Utilities.RemoveString(configurationName, ".json");
                        Log.Info("Found config called "+configurationName+" for app "+appName+" about to load");
                        Apps[appName].Configurations.TryAdd(configurationName, new AppConfiguration(configurationName, json));
                    }
                }
            }
            return configurations;
        }



        public static List<string> GetModuleList()
        {
            List<string> moduleList = Modules.Select(moduleEntry => moduleEntry.Value.Name).ToList();
            moduleList.Sort();
            return moduleList;
        }

        /// <summary>
        /// Gets the application list.
        /// </summary>
        /// <returns></returns>
        public static List<string> GetAppList()
        {
            List<string> appList = Apps.Select(appEntry => appEntry.Value.Name).ToList();
            appList.Sort();
            return appList;
        }

        /// <summary>
        /// Creates an base application instance.
        /// </summary>
        /// <param name="sectionId">The section identifier.</param>
        /// <param name="appName">Name of the application.</param>
        /// <param name="configName">Name of the configuration.</param>
        /// <returns></returns>
        public static int CreateBaseAppInstance(int sectionId, string appName, string configName)
        {
            Log.Info($"Creating App instance {appName} {configName} on section {sectionId}");
            if (!Sections[sectionId].IsDeployed() && Apps.ContainsKey(appName))
            {
                if (Apps[appName].Configurations.ContainsKey(configName))
                {
                    int instanceId =  Apps[appName].CreateAppInstance(configName, sectionId);
                    if (instanceId >= 0)
                    {
                        ((IBaseAppInstance)Apps[appName].Instances[instanceId]).Section.DeploySection(instanceId);
                    }
                    return instanceId;
                }
            }
            return -1;
        }

        /// <summary>
        /// Creates an advanced application instance.
        /// </summary>
        /// <returns></returns>
        public static int CreateAdvancedAppInstance(List<int> instanceIds, string appName, string configName)
        {
            //TODO
            /*if (!Cave.Sections[sectionId].IsDeployed() && Cave.Apps.ContainsKey(appName))
            {
                if (Cave.Apps[appName].Configurations.ContainsKey(configName))
                {
                    int instanceId = Apps[appName].CreateAppInstance(configName, sectionId);
                    if (instanceId >= 0)
                    {
                        Apps[appName].Instances[instanceId].Section.DeploySection(instanceId);
                    }
                    return instanceId;
                }
            }*/
            return -1;
        }

        /// <summary>
        /// Disposes an application instance.
        /// </summary>
        /// <param name="appName">Name of the application.</param>
        /// <param name="instanceId">The instance identifier.</param>
        /// <returns></returns>
        public static bool DisposeAppInstance(string appName, int instanceId)
        {
            if (Apps.ContainsKey(appName))
            {
                if (Apps[appName].Instances.ContainsKey(instanceId))
                {
                    if (Apps[appName].AppType == (int)Cave.AppTypes.Base)
                    {
                        Section section = ((IBaseAppInstance)Apps[appName].Instances[instanceId]).Section;
                        if (Apps[appName].DisposeAppInstance(instanceId))
                        {
                            section.FreeSection();
                            return true;
                        }
                    }
                    else if (Apps[appName].AppType == (int)Cave.AppTypes.Advanced)
                    {
                        if (Apps[appName].DisposeAppInstance(instanceId))
                        {
                            return true;
                        }
                    }
                    else
                    {
                        throw new Exception("Unknown App Type");
                    }
                }
            }
            return false;
        }
        /// <summary>
        /// Gets the name of the application.
        /// </summary>
        /// <param name="instanceId">The instance identifier.</param>
        /// <returns></returns>
        public static string GetAppName(int instanceId) {
            var app = Apps.Values.FirstOrDefault(a => a.Instances.ContainsKey(instanceId));
            if (app != null) {
                return app.Name;
            }
            Log.Error("unable to find app for instanceID "+instanceId);
            return "unknown";
        }

        public static int SaveCaveState(string name)
        {
            Log.Info("Saving CAVE STATE "+name);
            int slot = Utilities.GetAvailableSlot<State>(States);
            State caveState = new State(slot, name);
            States.TryAdd(slot, caveState);
            //TODO Add support advanced app
            foreach(KeyValuePair<int,IAppInstance> instaKeyValuePair in Instances)
            {
                IBaseAppInstance instance = (IBaseAppInstance)instaKeyValuePair.Value;
                Section section = instance.Section;
                AppState appState = new AppState(section.Col, section.Row, section.Cols, section.Rows, instance.AppName, instance.Configuration.Name);
                caveState.States.Add(appState);
            }
            return slot;
        }

        public static void RemoveCaveState(int id)
        {
            State caveState;
            States.TryRemove(id, out caveState);
        }

        public static void WaitReady()//TODO delete this???
        {
            Stopwatch timer = new Stopwatch();
            timer.Start();
            while (timer.Elapsed.TotalSeconds < 10)
            {
                // do something
            }
            timer.Stop();
        }
    }
}