using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Configuration;
using System.Diagnostics;
using System.IO;
using System.Net.NetworkInformation;
using System.Reflection;
using System.Threading.Tasks;
using System.Timers;
using GDO.Utility;
using Newtonsoft.Json;

namespace GDO.Core
{
    // TODO also check how static controls are recycled during the asp.net lifecycle 
    /// <summary>
    /// Cave Object Class
    /// </summary>
    public sealed class Cave
    {
        static Cave Self = null;
        public static readonly object ServerLock = new object();
        public static readonly List<object> AppLocks = new List<object>();

        public static bool MaintenanceMode { get; set; }
        public static int Cols { get; set; }
        public static int Rows { get; set; }
        public static int NodeWidth { get; set; }
        public static int NodeHeight { get; set; }
        public static int DefaultP2PMode { get; set; }
        public static ConcurrentDictionary<string, App> Apps { get; set; }
        public static ConcurrentDictionary<int, Node> Nodes { get; set; }
        public static ConcurrentDictionary<int, Section> Sections { get; set; }

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
            MaintenanceMode = false;
            Apps = new ConcurrentDictionary<string, App>();
            Nodes = new ConcurrentDictionary<int, Node>();
            Sections = new ConcurrentDictionary<int, Section>();
            Cols = int.Parse(ConfigurationManager.AppSettings["numCols"]);
            Rows = int.Parse(ConfigurationManager.AppSettings["numRows"]);
            NodeWidth = int.Parse(ConfigurationManager.AppSettings["nodeWidth"]);
            NodeHeight = int.Parse(ConfigurationManager.AppSettings["nodeheight"]);
            DefaultP2PMode = int.Parse(ConfigurationManager.AppSettings["p2pmode"]);
            for (int id = 1; id <= Cols * Rows; id++)
            {
                string[] s = ConfigurationManager.AppSettings["node" + id].Split(',');
                int col = int.Parse(s[0]);
                int row = int.Parse(s[1]);
                CreateNode(id, col, row);
                AppLocks.Add(new object());
            }
            CreateSection(0, 0, Cols - 1, Rows - 1); //Free Nodes Pool , id=0
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
                    if (Self == null)
                    {
                        Self = new Cave();
                    }
                    return Self;
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
        public static Node GetNode(string connectionId)
        {
            foreach (KeyValuePair<int, Node> nodeEntry in Nodes)
            {
                if (connectionId == nodeEntry.Value.ConnectionId)
                {
                    return nodeEntry.Value;
                }
            }
            return null;
        }


        /// <summary>
        /// Deploys the node to a section.
        /// </summary>
        /// <param name="sectionId">The section identifier.</param>
        /// <param name="nodeId">The node identifier.</param>
        /// <param name="col">The col.</param>
        /// <param name="row">The row.</param>
        /// <returns></returns>
        public static Node DeployNode(int sectionId, int nodeId, int col, int row)
        {
            if (Cave.Sections.ContainsKey(sectionId) && Cave.Nodes.ContainsKey(nodeId))
            {
                if (!Nodes[nodeId].IsDeployed)
                {
                    Nodes[nodeId].Deploy(Sections[sectionId], col, row);
                    Sections[sectionId].Nodes[col, row] = Nodes[nodeId];
                    return Nodes[nodeId];
                }
                else
                {
                    return null;
                }
            }
            else
            {
                return null;
            }
        }

        /// <summary>
        /// Frees the node.
        /// </summary>
        /// <param name="nodeId">The node identifier.</param>
        /// <returns></returns>
        public static Node FreeNode(int nodeId)
        {
            if (Cave.Nodes.ContainsKey(nodeId))
            {
                Nodes[nodeId].Free();
                return Nodes[nodeId];
            }
            else
            {
                return null;
            }
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
            if (Cave.IsSectionFree(colStart, rowStart, colEnd, rowEnd))
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
            if (Cave.ContainsSection(sectionId))
            {
                if (!Cave.Sections[sectionId].IsDeployed())
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
        public static bool IsSectionFree(int colStart, int rowStart, int colEnd, int rowEnd)
        {
            foreach (KeyValuePair<int, Node> nodeEntry in Nodes)
            {
                Node node = nodeEntry.Value;
                if (colStart > colEnd || rowStart > rowEnd)
                {
                    return false;
                }
                if (node.Col <= colEnd && node.Col >= colStart && node.Row <= rowEnd && node.Row >= rowStart)
                {
                    if (node.IsDeployed)
                    {
                        return false;
                    }
                }
            }
            return true;
        }

        /// <summary>
        /// Determines whether the specified section identifier contains section.
        /// </summary>
        /// <param name="sectionId">The section identifier.</param>
        /// <returns></returns>
        public static bool ContainsSection(int sectionId)
        {
            if (Sections.ContainsKey(sectionId))
            {
                return true;
            }
            else
            {
                return false;
            }
        }


        /// <summary>
        /// Determines whether the specified node identifier contains node.
        /// </summary>
        /// <param name="NodeId">The node identifier.</param>
        /// <returns></returns>
        public static bool ContainsNode(int NodeId)
        {
            if (Nodes.ContainsKey(NodeId))
            {
                return true;
            }
            else
            {
                return false;
            }
        }

        /// <summary>
        /// Gets the section identifier.
        /// </summary>
        /// <param name="col">The col.</param>
        /// <param name="row">The row.</param>
        /// <returns></returns>
        public static int GetSectionId(int col, int row)
        {
            return Cave.Nodes[GetNodeId(col, row)].SectionId;
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
                Node node = nodeEntry.Value;
                if (node.Col == col && node.Row == row)
                {
                    return node.Id;
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
            if (Cave.ContainsSection(sectionId))
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
        /// Gets the cave map (Matrix of NodeIds in the Cave).
        /// </summary>
        /// <returns></returns>
        public static int[,] GetCaveMap()
        {
            int[,] caveMap = new int[Cols, Rows];
            foreach (KeyValuePair<int, Node> nodeEntry in Nodes)
            {
                caveMap[nodeEntry.Value.Col, nodeEntry.Value.Row] = nodeEntry.Value.Id;
            }
            return caveMap;
        }

        /// <summary>
        /// Gets the section map (Matrix of NodeIds in the Section).
        /// </summary>
        /// <param name="sectionId">The section identifier.</param>
        /// <returns></returns>
        public static int[,] GetSectionMap(int sectionId)
        {
            int[,] sectionMap = null;
            if (Cave.ContainsSection(sectionId))
            {
                sectionMap = new int[Sections[sectionId].Cols, Sections[sectionId].Rows];
                foreach (KeyValuePair<int, Node> nodeEntry in Nodes)
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
            if (Cave.ContainsNode(nodeId))
            {
                int[,] caveMap = GetCaveMap();
                neighbours = new int[3, 3];
                for (int i = -1; i < 2; i++)
                {
                    for (int j = -1; j < 2; j++)
                    {
                        int col = Nodes[nodeId].Col + i;
                        int row = Nodes[nodeId].Row + j;
                        if (col >= 0 && row >= 0 && col < Cols && row < Rows)
                        {
                            neighbours[i + 1, j + 1] = caveMap[col, row];
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

        /// <summary>
        /// Registers an application
        /// </summary>
        /// <param name="id">The identifier.</param>
        /// <param name="app">The application.</param>
        public static bool RegisterApp(string name, int p2pmode, Type appType)
        {
            if (!Apps.ContainsKey(name))
            {
                App app = new App();
                app.Init(name, p2pmode,appType);
                Apps.TryAdd(name, app);
                Apps[name].Init(name,p2pmode,appType);
                List<AppConfiguration> configurations = LoadAppConfigurations(name);
                foreach (var configuration in configurations)
                {
                    Apps[name].Configurations.TryAdd(configuration.Name, configuration);
                }
                return true;
            }
            else
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
            List <AppConfiguration> configurations = new List<AppConfiguration>();
            //TODO Load app configurations from /Configurations/AppName directory
            Directory.SetCurrentDirectory(AppDomain.CurrentDomain.BaseDirectory);
            String path = Directory.GetCurrentDirectory() + @"\Configurations\" + appName;
            if (Directory.Exists(path))
            {
                string[] filePaths = Directory.GetFiles(@path, "*.json", SearchOption.AllDirectories);
                foreach (string filePath in filePaths)
                {
                    dynamic json = Utilities.LoadJsonFile(filePath);
                    if (json != null)
                    {
                        string configurationName = Utilities.RemoveString(filePath, path + "\\");
                        configurationName = Utilities.RemoveString(configurationName, ".json");
                        Cave.Apps[appName].Configurations.TryAdd(configurationName, new AppConfiguration(configurationName, json));
                    }
                }
            }
            return configurations;
        }

        /// <summary>
        /// Gets the application list.
        /// </summary>
        /// <returns></returns>
        public static List<string> GetAppList()
        {
            List<string> appList = new List<string>();
            foreach (KeyValuePair<string, App> appEntry in Apps)
            {
                appList.Add(appEntry.Value.Name);
            }
            return appList;
        }

        /// <summary>
        /// Creates an application instance.
        /// </summary>
        /// <param name="sectionId">The section identifier.</param>
        /// <param name="appName">Name of the application.</param>
        /// <param name="configName">Name of the configuration.</param>
        /// <returns></returns>
        public static int CreateAppInstance(int sectionId, string appName, string configName)
        {
            if (!Cave.Sections[sectionId].IsDeployed() && Cave.Apps.ContainsKey(appName))
            {
                if (Cave.Apps[appName].Configurations.ContainsKey(configName))
                {
                    int instanceId =  Apps[appName].CreateAppInstance(configName, sectionId);
                    if (instanceId >= 0)
                    {
                        Apps[appName].Instances[instanceId].Section.DeploySection(instanceId);
                    }
                    return instanceId;
                }
            }
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
            if (Cave.Apps.ContainsKey(appName))
            {
                if (Cave.Apps[appName].Instances.ContainsKey(instanceId))
                {
                    Section section = Apps[appName].Instances[instanceId].Section;
                    if (Apps[appName].DisposeAppInstance(instanceId))
                    {
                        section.FreeSection();
                        return true;
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
        public static string GetAppName(int instanceId)
        {
            string appName = null;
            foreach (KeyValuePair<string,App> appEntry in Cave.Apps)
            {
                if (appEntry.Value.Instances.ContainsKey(instanceId))
                {
                    appName = appEntry.Value.Name;
                }
            }
            return appName;
        }

        /// <summary>
        /// Determines whether the specified instance identifier contains instance.
        /// </summary>
        /// <param name="instanceId">The instance identifier.</param>
        /// <returns></returns>
        public static bool ContainsInstance(int instanceId)
        {
            foreach (KeyValuePair<string, App> appEntry in Cave.Apps)
            {
                if (appEntry.Value.Instances.ContainsKey(instanceId))
                {
                    return true;
                }
            }
            return false;
        }

        public static void WaitReady()
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