using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Web;
using System.Configuration;
using System.ComponentModel.Composition;
using System.ComponentModel.Composition.Hosting;
using System.ComponentModel.Composition.Registration;
using Microsoft.AspNet.SignalR;
using GDO.Core;

namespace GDO
{
    public class Cave
    {
        public static int cols { get; set; }
        public static int rows { get; set; }
        public static int nodeWidth { get; set; }
        public static int nodeHeight { get; set; }
        public static ConcurrentDictionary<int, IApp> apps;
        public static ConcurrentDictionary<int, Node> nodes;
        public static ConcurrentDictionary<int, Section> sections;

        public static void initCave()
        {
            apps = new ConcurrentDictionary<int, IApp>();
            nodes = new ConcurrentDictionary<int, Node>();
            sections = new ConcurrentDictionary<int, Section>();
            cols = int.Parse(System.Configuration.ConfigurationManager.AppSettings["numCols"]);
            rows = int.Parse(System.Configuration.ConfigurationManager.AppSettings["numRows"]);
            nodeWidth = int.Parse(System.Configuration.ConfigurationManager.AppSettings["nodeWidth"]);
            nodeHeight = int.Parse(System.Configuration.ConfigurationManager.AppSettings["nodeheight"]);

            for (int id = 1; id <= cols * rows; id++)
            {
                string[] s = System.Configuration.ConfigurationManager.AppSettings["node" + id].Split(',');
                int col = int.Parse(s[0]);
                int row = int.Parse(s[1]);
                createNode(id, col, row);
            }
            createSection(0, 0, cols-1, rows-1); //Free Nodes Section , id=0
        }

        public static void createNode(int nodeID, int col, int row)
        {
            Node node = new Node(nodeID, col, row, nodeWidth, nodeHeight, rows*cols);
            nodes.TryAdd(nodeID, node);
        }

        public static Node getNode(string connectionID)
        {
            foreach (KeyValuePair<int, Node> nodeEntry in nodes)
            {
               if (connectionID == nodeEntry.Value.connectionID){
                   return nodeEntry.Value;
                }
            }
            return null;
        }

        public static Node deployNode(int sectionID, int nodeID, int col, int row)
        {
            Node node;
            Cave.nodes.TryGetValue(nodeID, out node);
            if (!node.isDeployed)
            {
                Section section;
                Cave.sections.TryGetValue(sectionID, out section);
                node.deploy(section, col, row);
                section.nodes[col, row] = node;
            }
            return node;
        }

        public static Node freeNode(int nodeID)
        {
            Node node;
            Cave.nodes.TryGetValue(nodeID, out node);
            node.free();
            return node;
        }

        public static List<Node> createSection(int colStart, int rowStart, int colEnd, int rowEnd)
        {
            int sectionID = Cave.sections.Count;
            Section section = new Section(sectionID, colEnd - colStart + 1, rowEnd - rowStart + 1);
            Cave.sections.TryAdd(sectionID, section);
            List<Node> deployedNodes = new List<Node>();
            foreach (KeyValuePair<int, Node> nodeEntry in Cave.nodes)
            {
                Node node = nodeEntry.Value;
                if (node.col <= colEnd && node.col >= colStart && node.row <= rowEnd && node.row >= rowStart)
                {
                    deployedNodes.Add(deployNode(section.id, node.id, node.col - colStart, node.row - rowStart));
                }
            }
            section.calculateDimensions();
            return deployedNodes;
        }
        public static List<Node> disposeSection(int sectionID)
        {
            //close app
            Section section;
            List<Node> freedNodes = new List<Node>();
            Cave.sections.TryGetValue(sectionID, out section);
            foreach (Node node in section.nodes)
            {
                freedNodes.Add(freeNode(node.id));
            }
            Cave.sections.TryRemove(sectionID, out section);
            return freedNodes;
        }

        public static int[,] getCaveMap()
        {
            int[,] caveMap = new int[cols, rows];
            foreach (KeyValuePair<int,Node> nodeEntry in nodes)
            {
                caveMap[nodeEntry.Value.col, nodeEntry.Value.row] = nodeEntry.Value.id;
            }
            return caveMap;
        }

        public static int[,] getSectionMap(int sectionID)
        {
            Section section;
            sections.TryGetValue(sectionID, out section);
            int[,] sectionMap = new int[section.cols, section.rows];
            foreach (KeyValuePair<int, Node> nodeEntry in nodes)
            {
                if (nodeEntry.Value.sectionID == sectionID)
                {
                    sectionMap[nodeEntry.Value.sectionCol, nodeEntry.Value.sectionRow] = nodeEntry.Value.id;
                }
            }
            return sectionMap;
        }

        public static int[,] getNeighbourMap(int nodeID)
        {
            Node node;
            nodes.TryGetValue(nodeID, out node);
            int[,] caveMap = getCaveMap();
            int[,] neighbours = new int[3, 3];
            for (int i = -1; i<2; i++){
                for (int j = -1; j<2; j++){
                    int col = node.col + i ;
                    int row = node.row + j;
                    if(col >=0 && row>=0 && col <cols && row<rows){
                        neighbours[i+1,j+1] = caveMap[col,row];
                    }else{
                        neighbours[i+1,j+1] = -1;
                    }
                }
            }
            return neighbours;
        }

        public static void addApp(int id, IApp app)
        {
            apps.TryAdd(id, app);
        }

        public static List<string> getAppList()
        {
            List<string> appList = new List<string>();
            foreach (KeyValuePair<int, IApp> appEntry in apps)
            {
                appList.Add(appEntry.Value.name);
            }
            return appList;
        }

        public static void assignApp(int appID, int sectionID)
        {
            //TODO
        }
    }
}