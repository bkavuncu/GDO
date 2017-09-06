using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Configuration;
using System.Diagnostics;
using System.IO;
using System.Linq;
using GDO.Core.Apps;
using GDO.Core.Scenarios;
using GDO.Core.States;
using GDO.Utility;
using log4net;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace GDO.Core
{
    // TODO also check how static controls are recycled during the asp.net lifecycle 
    /// <summary>
    /// Cave Object Class this stores all of the information about the deployment
    /// </summary>
    public sealed class Cave
    {
        private static readonly ILog Log = LogManager.GetLogger(typeof(Cave));

        private static Cave Self;
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
        public static string ConsoleId { get; set; }
        public static System.Timers.Timer SyncTimer { get; set; }
        public static bool InitializedSync { get; set; }
        public static CaveLayout Layout { get; set; }
        public static CaveDeployment Deployment { get; set; }
        public static ConcurrentDictionary<string, State> States { get; set; }
        public static ConcurrentDictionary<string, Scenario> Scenarios { get; set; }

        public enum P2PModes
        {
            None = -1,
            Cave = 1,
            Section = 2,
            Neighbours = 3
        };
        /// <summary>
        /// Initializes a new instance of the <see cref="Cave"/> class.
        /// </summary>
        public Cave()
        {
            //CurrentHeartbeat = 0;
            //MaximumHeartbeat = 1000000;
            MaintenanceMode = false;//todo note that you can define default maintainence mode here 
            BlankMode = false;
            
            Layout = new CaveLayout();
            Deployment = new CaveDeployment();
            States = new ConcurrentDictionary<string, State>();
            Scenarios = new ConcurrentDictionary<string, Scenario>();
            Cols = int.Parse(ConfigurationManager.AppSettings["numCols"]);
            Rows = int.Parse(ConfigurationManager.AppSettings["numRows"]);
            NodeWidth = int.Parse(ConfigurationManager.AppSettings["nodeWidth"]);
            NodeHeight = int.Parse(ConfigurationManager.AppSettings["nodeheight"]);
            DefaultP2PMode = int.Parse(ConfigurationManager.AppSettings["p2pmode"]);
            ConsoleId = "-1";
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
                Layout.CreateNode(id, col, row, NodeWidth, NodeHeight, Rows * Cols);
                AppLocks.Add(new object());
            }
            Deployment.CreateSection(0, 0, Cols - 1, Rows - 1); //Free Nodes Pool , id=0
            LoadScenarios();
            LoadStates();
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

        public static bool ContainsState(string stateId)
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
            return Layout.Nodes[GetNodeId(col, row)].SectionId;
        }
        /// <summary>
        /// Gets the node identifier.
        /// </summary>
        /// <param name="col">The col.</param>
        /// <param name="row">The row.</param>
        /// <returns></returns>
        public static int GetNodeId(int col, int row)
        {
            foreach (KeyValuePair<int, Node> nodeEntry in Layout.Nodes)
            {
                if (nodeEntry.Value.Col == col && nodeEntry.Value.Row == row)
                {
                    return nodeEntry.Value.Id;
                }
            }
            return -1;
        }

        /// <summary>
        /// Gets the node map (Matrix of NodeIds in the Cave).
        /// </summary>
        /// <returns></returns>
        public static int[,] GetNodeMap()
        {
            int[,] nodeMap = new int[Cols, Rows];
            foreach (KeyValuePair<int, Node> nodeEntry in Layout.Nodes)
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
            if (Deployment.ContainsSection(sectionId))
            {
                sectionMap = new int[Deployment.Sections[sectionId].Cols, Deployment.Sections[sectionId].Rows];
                foreach (var nodeEntry in Layout.Nodes)
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
            if (Layout.ContainsNode(nodeId))
            {
                int[,] nodeMap = GetNodeMap();
                neighbours = new int[3, 3];
                for (int i = -1; i < 2; i++)
                {
                    for (int j = -1; j < 2; j++)
                    {
                        Node node = Layout.Nodes[nodeId];
                        int col = node.Col + i;
                        int row = node.Row + j;
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

        public static bool LoadStates() {
            try {
                Directory.SetCurrentDirectory(AppDomain.CurrentDomain.BaseDirectory);
                String path = Directory.GetCurrentDirectory() + @"\States\";  // TODO using server.map path
                if (Directory.Exists(path)) {
                    string[] filePaths = Directory.GetFiles(path, "*.json", SearchOption.AllDirectories);
                    
                    foreach (string filePath in filePaths) {
                        State state = Utilities.LoadJsonFile<State>(filePath);
                        if (state != null) {
                            Log.Info("Found scenario called " + state.Name + " about to load");
                            States.TryAdd(state.Name, state);
                        }
                    }
                    return true;
                }
                return false;
            } catch (Exception e) {
                Log.Debug("failed to load scenarios ", e);
                return false;
            }
        }

        public static bool LoadScenarios()
        {
            try
            {
                Directory.SetCurrentDirectory(AppDomain.CurrentDomain.BaseDirectory);
                String path = Directory.GetCurrentDirectory() + @"\Scenarios\";  // TODO using server.map path
                if (Directory.Exists(path))
                {
                    string[] filePaths = Directory.GetFiles(path, "*.json", SearchOption.AllDirectories);
                    
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
                Log.Debug("failed to load scenarios ",e);
                return false;
            }
        }

        public static Scenario SaveScenario(string json)
        {
            try
            {
                Scenario scenario = JsonConvert.DeserializeObject<Scenario>(json);
                if (Scenarios.ContainsKey(scenario.Name))
                {
                    Scenario dump;
                    Scenarios.TryRemove(scenario.Name, out dump);
                }
                Scenarios.TryAdd(scenario.Name, scenario);
                Utilities.SaveJsonFile<Scenario>(scenario.Name, "Scenarios", scenario);
                return scenario;
            }
            catch (Exception e)
            {
                Log.Debug("failed to save scenario",e);
                return null;
            }
        }

        public static bool RemoveScenario(string name)
        {
            try
            {
                if (ContainsScenario(name))
                {
                    Scenario s;
                    Scenarios.TryRemove(name, out s);
                    Utilities.RemoveJsonFile(name, "Scenarios");
                    return true;
                }
                return false;
            }
            catch (Exception e)
            {
                Log.Error("failed to delete scenario ",e);
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
                string[] filePaths = Directory.GetFiles(path, "*.json", SearchOption.AllDirectories);//todo comment why the@ is needed
                foreach (string filePath in filePaths)
                {
                    JObject json = Utilities.LoadJsonFile(filePath);
                    if (json != null)
                    {
                        string configurationName = Utilities.RemoveString(filePath, path + "\\");
                        configurationName = Utilities.RemoveString(configurationName, ".json");
                        Log.Info("Found config called "+configurationName+" for app "+appName+" about to load");
                        Deployment.Apps[appName].Configurations.TryAdd(configurationName, new AppConfiguration(configurationName, json));
                    }
                }
            }
            return configurations;
        }

        public static List<string> LoadAppConfiguration(string appName, string fileName)
        {
            Directory.SetCurrentDirectory(AppDomain.CurrentDomain.BaseDirectory);
            String path = Directory.GetCurrentDirectory() + @"\Configurations\" + appName;  // TODO using server.map path
            if (Directory.Exists(path))
            {
                string[] filePaths = Directory.GetFiles(@path, fileName+".json", SearchOption.AllDirectories);//todo comment why the@ is needed
                foreach (string filePath in filePaths)
                {
                    JObject json = Utilities.LoadJsonFile(filePath);
                    if (json != null)
                    {
                        string configurationName = Utilities.RemoveString(filePath, path + "\\");
                        configurationName = Utilities.RemoveString(configurationName, ".json");
                        Log.Info("Found config called " + configurationName + " for app " + appName + " about to load");
                        if (Deployment.Apps[appName].Configurations.ContainsKey(configurationName))
                        {
                            Deployment.Apps[appName].Configurations[configurationName] = new AppConfiguration(configurationName,json);
                        }
                        else
                        {
                            Deployment.Apps[appName].Configurations.TryAdd(configurationName, new AppConfiguration(configurationName, json));
                        }

                    }
                }
            }
            var configurationList = Deployment.Apps[appName].GetConfigurationList();
            return configurationList;
        }

        public static List<string> UnloadAppConfiguration(string appName, string configName)
        {
            if (Deployment.Apps[appName].Configurations.ContainsKey(configName))
            {
                AppConfiguration config;
                Deployment.Apps[appName].Configurations.TryRemove(configName, out config);
                Utilities.RemoveJsonFile(configName, "Configurations\\" + appName);
            }
            var configurationList = Deployment.Apps[appName].GetConfigurationList();
            return configurationList;
        }

        public static List<string> GetModuleList()
        {
            return Layout.GetModuleList();
        }

        public static List<string> GetAppList()
        {
            return Deployment.GetAppList();
        }

        public static bool RegisterModule(string name, Type moduleClassType)
        {
            return Layout.RegisterModule(name, moduleClassType);
        }

        public static bool RegisterApp(string name, IAppHub appHub, Type appClassType, bool isComposite, List<string> supportedApps, int p2pmode)
        {
            return Deployment.RegisterApp(name, appHub, appClassType, isComposite, supportedApps, p2pmode);
        }

        /// <summary>
        /// Gets the name of the application.
        /// </summary>
        /// <param name="instanceId">The instance identifier.</param>
        /// <returns></returns>
        public static string GetAppName(int instanceId) {
            return Deployment.GetAppName(instanceId);
        }

        #region CaveState

        public static bool SaveCaveState(string name)
        {
            Log.Info("Saving CAVE STATE " + name);

            //create the CaveState
            State caveState = new State(name);
            foreach (KeyValuePair<int, IAppInstance> instaKeyValuePair in Deployment.Instances) {
                IBaseAppInstance instance = (IBaseAppInstance)instaKeyValuePair.Value;
                Section section = instance.Section;
                AppState appState = new AppState(section.Col, section.Row, section.Cols, section.Rows, instance.App.Name, instance.Configuration.Name);
                caveState.States.Add(appState);
            }

            // store it
            Cave.States[name] = caveState;

            // then save it 

            try {
                if (ContainsState(name)) {
                    Utilities.RemoveJsonFile(name, "states");
                }
                Utilities.SaveJsonFile<State>(name,"states",caveState);
                return true;

            } catch (Exception e) {
                Log.Error("failed to delete scenario ", e);
                return false; 
            }

        }

        public static bool RemoveCaveState(string name)
        {
            State caveState;
            if (States.TryRemove(name, out caveState)) {
                Utilities.RemoveJsonFile(name, "states");
                return true;
            }
            return false;
        }

        #endregion

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