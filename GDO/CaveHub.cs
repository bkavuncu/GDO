using System;
using System.Collections.Generic;
using Microsoft.AspNet.SignalR;
using GDO.Core;

namespace GDO
{
    public class CaveHub : Hub
    {
        public override System.Threading.Tasks.Task OnConnected()
        {
            return base.OnConnected();
        }

        public override System.Threading.Tasks.Task OnDisconnected()
        {
            Node node = Cave.getNode(Context.ConnectionId);
            if (node != null)
            {
                node.isConnected = false;
                broadcastNodeUpdate(node.id);
            }
            return base.OnDisconnected();
        }
        public void deployNode(int sectionID, int nodeID, int col, int row)
        {
            Cave.deployNode(sectionID,nodeID,col,row);
            broadcastNodeUpdate(nodeID);
        }

        public void freeNode(int nodeID)
        {
            Cave.freeNode(nodeID);
            broadcastNodeUpdate(nodeID);
        }

        public void createSection(int colStart, int rowStart, int colEnd, int rowEnd)
        {
            List<Node> deployedNodes = Cave.createSection(colStart, rowStart, colEnd, rowEnd);
            foreach (Node node in deployedNodes)
            {
                broadcastNodeUpdate(node.id);
            }
        }

        public void disposeSection(int sectionID)
        {
            List<Node> freedNodes = Cave.disposeSection(sectionID);
            foreach (Node node in freedNodes)
            {
                broadcastNodeUpdate(node.id);
            }
        }

        public void deployApp()
        {
            //create a app instance
            //tell browser what part to use
        }

        public void disposeApp()
        {
            //close app instance
            //send info to browsers, 
            //they start clean up
            //they deploy base app
        }

        public void uploadNodeInfo(int nodeID, string connectionID, string connectedNodes)
        {
            Node node;
            Cave.nodes.TryGetValue(nodeID, out node);
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

        public void requestCaveMap()
        {
            Clients.Caller.receiveCaveMap(Cave.cols, Cave.rows, Newtonsoft.Json.JsonConvert.SerializeObject(Cave.getCaveMap()));
        }

        public void requestSectionMap(int sectionID)
        {
            Clients.Caller.receiveSectionMap(Newtonsoft.Json.JsonConvert.SerializeObject(Cave.getSectionMap(sectionID)));
        }

        public void requestNeighbourMap(int nodeID)
        {
            Clients.Caller.receiveSectionMap(Newtonsoft.Json.JsonConvert.SerializeObject(Cave.getNeighbourMap(nodeID)));
        }

        public void requestAppList()
        {
            Clients.Caller.receiveAppList(Newtonsoft.Json.JsonConvert.SerializeObject(Cave.getAppList()));
        }

        public void broadcastNodeUpdate(int nodeID)
        {
            Node node;
            Cave.nodes.TryGetValue(nodeID, out node);
            Clients.All.receiveNodeUpdate(node.serialize());
        }

        public void sendData(int senderID, int receiverID, string data)
        {
            Clients.Client(Cave.nodes[receiverID].connectionID).receiveData(senderID, data);
        }

        public void broadcastData(int senderID, string data)
        {
            Clients.Others.receiveBroadcast(senderID, data);
        }
    }
}