using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Configuration;
using GDO.Core;
using GDO.Utility;

namespace GDO
{
    // TODO also check how static controls are recycled during the asp.net lifecycle 
    /// <summary>
    /// Cave Object Class
    /// </summary>
    public sealed class Cave
    {
        static Cave Self = null;
        public static readonly object ServerLock = new object();

        public static int Cols { get; set; }
        public static int Rows { get; set; }
        public static int NodeWidth { get; set; }
        public static int NodeHeight { get; set; }
        public static int DefaultP2PMode { get; set; }
        public static ConcurrentDictionary<string, App> Apps { get; set; }
        public static ConcurrentDictionary<int, Node> Nodes { get; set; }
        public static ConcurrentDictionary<int, Section> Sections { get; set; }

        /// <summary>
        /// Initializes a new instance of the <see cref="Cave"/> class.
        /// </summary>
        public Cave()
        {
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
            Node node;
            Nodes.TryGetValue(nodeId, out node);
            if (!node.IsDeployed)
            {
                Section section;
                Sections.TryGetValue(sectionId, out section);
                node.Deploy(section, col, row);
                section.Nodes[col, row] = node;
            }
            return node;
        }

        /// <summary>
        /// Frees the node.
        /// </summary>
        /// <param name="nodeId">The node identifier.</param>
        /// <returns></returns>
        public static Node FreeNode(int nodeId)
        {
            Node node;
            Nodes.TryGetValue(nodeId, out node);
            node.Free();
            return node;
        }

        /// <summary>
        /// Sets the node P2P mode.
        /// </summary>
        /// <param name="nodeId">The node identifier.</param>
        /// <param name="p2pmode">The p2pmode.</param>
        /// <returns></returns>
        public static Node SetNodeP2PMode(int nodeId, int p2pmode)
        {
            Node node;
            Nodes.TryGetValue(nodeId, out node);
            node.P2PMode = p2pmode;
            return node;
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
                int sectionId = Utilities.getAvailableSlot<Section>(Sections);
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
        /// Disposes the section.
        /// </summary>
        /// <param name="sectionId">The section identifier.</param>
        /// <returns></returns>
        public static List<Node> DisposeSection(int sectionId)
        {
            List<Node> freedNodes = new List<Node>();
            if (Cave.ContainsSection(sectionId))
            {
                Section section;
                Sections.TryGetValue(sectionId, out section);
                foreach (Node node in section.Nodes)
                {
                    freedNodes.Add(FreeNode(node.Id));
                }
                section.Nodes = null;
                Sections.TryRemove(sectionId, out section);
                    
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

        public static List<Node> SetSectionP2PMode(int sectionId, int p2pmode)
        {
            List<Node> affectedNodes = new List<Node>();
            if (Cave.ContainsSection(sectionId))
            {
                //close app
                Section section;
                Sections.TryGetValue(sectionId, out section);
                foreach (Node node in section.Nodes)
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
                Section section;
                Sections.TryGetValue(sectionId, out section);
                sectionMap = new int[section.Cols, section.Rows];
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
                Node node;
                Nodes.TryGetValue(nodeId, out node);
                int[,] caveMap = GetCaveMap();
                neighbours = new int[3, 3];
                for (int i = -1; i < 2; i++)
                {
                    for (int j = -1; j < 2; j++)
                    {
                        int col = node.Col + i;
                        int row = node.Row + j;
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
        public static bool RegisterApp(string name)
        {
            if (!Apps.ContainsKey(name))
            {
                App app = new App();
                app.Init(name);
                Apps.TryAdd(name, app);
                return true;
            }
            else
            {
                return false;
            }
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
        /// Assigns the application.
        /// </summary>
        /// <param name="appId">The application identifier.</param>
        /// <param name="sectionId">The section identifier.</param>
        public static void AssignApp(int appId, int sectionId)
        {

        }

        public static int CreateAppInstance(string appName)
        {
            return -1;
        }
        public static int DisposeAppInstance(string appName, int instanceId)
        {
            return -1;
        }


    }
}