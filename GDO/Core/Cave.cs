using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using GDO.Core;

namespace GDO
{
    public class Cave : Hub
    {
        public int cols { get; set; } = int.Parse(System.Configuration.ConfigurationManager.AppSettings["numCols"]);
        public int rows { get; set; } = int.Parse(System.Configuration.ConfigurationManager.AppSettings["numRows"]);
        public int nodeWidth { get; set; } = int.Parse(System.Configuration.ConfigurationManager.AppSettings["nodeWidth"]);
        public int nodeHeight { get; set; } = int.Parse(System.Configuration.ConfigurationManager.AppSettings["nodeheight"]);
        private static ConcurrentDictionary<int, Node> nodes;
        private static ConcurrentDictionary<int, Section> sections;

        public Cave()
        {
            for (int id = 0; id < cols*rows; id++)
            {
                string[] s = System.Configuration.ConfigurationManager.AppSettings["node"+id].Split(',');
                int col = int.Parse(s[0]);
                int row = int.Parse(s[1]);
                createNode(id,col,row);
            }
        }

        public override System.Threading.Tasks.Task OnConnected()
        {
            return base.OnConnected();
        }

        public override System.Threading.Tasks.Task OnDisconnected()
        {
            Node node = getNode(Context.ConnectionId);
            if (node != null)
            {
                node.isConnected = false;
                broadcastNodeUpdate(node.id);
            }
            return base.OnDisconnected();
        }

        public void createNode(int nodeID, int col, int row)
        {
            Node node = new Node(nodeID, col, row, nodeWidth, nodeHeight, rows*cols);
            nodes.TryAdd(nodeID, node);
        }

        public Node getNode(string connectionID)
        {
            foreach (KeyValuePair<int, Node> nodeEntry in nodes)
            {
               if (connectionID == nodeEntry.Value.connectionID){
                   return nodeEntry.Value;
                }
            }
            return null;
        }

        public void deployNode(int sectionID, int nodeID, int col, int row)
        {
            Node node;
            nodes.TryGetValue(nodeID, out node);
            if(node.isConnected && !node.isDeployed)
            {
                Section section;
                sections.TryGetValue(sectionID, out section);
                node.deploy(section, col, row);
            }
            broadcastNodeUpdate(nodeID);
        }

        public void freeNode(int nodeID)
        {
            Node node;
            nodes.TryGetValue(nodeID, out node);
            node.free();
            broadcastNodeUpdate(nodeID);
        }

        public void createSection(int colStart, int rowStart, int colEnd, int rowEnd)
        {
            Section section = new Section(colEnd - colStart + 1, rowEnd - rowStart + 1);
            sections.TryAdd(sections.Count, section);
            foreach (KeyValuePair<int, Node> nodeEntry in nodes)
            {
                Node node =  nodeEntry.Value;
                if (node.col <= colEnd && node.col >= colStart && node.row <= rowEnd && node.row >= rowStart)
                {
                    node.deploy(section, node.col - colStart, node.row - rowStart);
                    broadcastNodeUpdate(node.id);
                }
            }
        }

        public void closeSection(int sectionID)
        {
            //close app
            Section section;
            sections.TryGetValue(sectionID, out section);
            foreach (Node node in section.nodes)
            {
                node.free();
                broadcastNodeUpdate(node.id);
            }
            sections.TryRemove(sectionID, out section);
        }

        public void deployApp()
        {
            //create a app instance
            //tell browser what part to use
        }

        public void closeApp()
        {
            //close app instance
            //send info to browsers, 
            //they start clean up
            //they deploy base app
        }
        
        public void uploadNodeInfo(int nodeID, string connectionID, string connectedNodes)
        {
            Node node;
            nodes.TryGetValue(nodeID, out node);
            node.isConnected = true;
            node.connectionID = connectionID;
            int[] deserializedConnectedNodes = Newtonsoft.Json.JsonConvert.DeserializeObject<int[]>(connectedNodes);
            foreach (int connectedNode in deserializedConnectedNodes)
            {
                node.connected[connectedNode] = true;
            }

            broadcastNodeUpdate(nodeID);
            //concurrency problem?
        }

        public void sendData(int senderID, int receiverID, string data)
        {
            Clients.Client(nodes[receiverID].connectionID).receiveData(senderID,data);
        }

        public void broadcastData(int senderID, string data)
        {
            Clients.Others.receiveBroadcast(senderID, data);
        }

        public int[,] getCaveMap()
        {
            int[,] caveMap = new int[cols, rows];
            foreach (KeyValuePair<int,Node> nodeEntry in nodes)
            {
                caveMap[nodeEntry.Value.col, nodeEntry.Value.row] = nodeEntry.Value.id;
            }
            return caveMap;
        }

        public void requestCaveMap (){
            Clients.Caller.receiveCaveMap(cols, rows, Newtonsoft.Json.JsonConvert.SerializeObject(getCaveMap()));
        }

        public int[,] getSectionMap(int sectionID)
        {
            Section section;
            sections.TryGetValue(sectionID, out section);
            int[,] sectionMap = new int[section.cols, section.rows];
            foreach (KeyValuePair<int, Node> nodeEntry in nodes)
            {
                sectionMap[nodeEntry.Value.col, nodeEntry.Value.row] = nodeEntry.Value.id;
            }
            return sectionMap;
        }

        public void requestSectionMap(int sectionID)
        {
            Clients.Caller.receiveSectionMap(Newtonsoft.Json.JsonConvert.SerializeObject(getSectionMap(sectionID)));
        }

        public void getNeighbourMap(int nodeID)
        {
            Node node;
            nodes.TryGetValue(nodeID, out node);
            int[,] caveMap = getCaveMap();
            int[,] neighbours = new int[3, 3];
            for (int i = -1; i<2; i++){
                for (int j = -1; j<2; j++){
                    int col = node.col + i ;
                    int row = node.row + j;
                    if(col >0 && row>0 && col <cols && row<rows){
                        neighbours[i+1,j+1] = caveMap[col,row];
                    }else{
                        neighbours[i+1,j+1] = -1;
                    }
                }
            }
        }

        public void broadcastNodeUpdate(int nodeID)
        {
            Node node;
            nodes.TryGetValue(nodeID, out node);
            Clients.All.receiveNodeUpdate(node.serialize());
        }
    }
}