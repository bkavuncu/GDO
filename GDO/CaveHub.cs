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

        public override System.Threading.Tasks.Task OnDisconnected(bool stopCalled)
        {
            Node node = Cave.getNode(Context.ConnectionId);
            if (node != null)
            {
                node.isConnected = false;
                broadcastNodeUpdate(node.id);
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

            return base.OnDisconnected(stopCalled);

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

        public void uploadNodeInfo(int nodeID, string connectionID, string connectedNodes, string peerID)
        {
            Node node;
            Cave.nodes.TryGetValue(nodeID, out node);
            node.isConnected = true;
            node.connectionID = connectionID;
            node.peerID = peerID;
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
            try
            { 
                Clients.Caller.receiveCaveMap(Cave.cols, Cave.rows, Newtonsoft.Json.JsonConvert.SerializeObject(Cave.getCaveMap()));
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        public void requestSectionMap(int sectionID)
        {
            try
            { 
                Clients.Caller.receiveSectionMap(Newtonsoft.Json.JsonConvert.SerializeObject(Cave.getSectionMap(sectionID)));
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        public void requestNeighbourMap(int nodeID)
        {
            try
            {
                Clients.Caller.receiveNeighbourMap(Newtonsoft.Json.JsonConvert.SerializeObject(Cave.getNeighbourMap(nodeID)));
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        public void requestAppList()
        {
            try
            { 
                Clients.Caller.receiveAppList(Newtonsoft.Json.JsonConvert.SerializeObject(Cave.getAppList()));
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        public void broadcastNodeUpdate(int nodeID)
        {
            try
            {
                Node node;
                Cave.nodes.TryGetValue(nodeID, out node);
                Clients.Others.receiveNodeUpdate(node.serialize());
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        public void sendData(int senderID, int receiverID, string data)
        {
            try
            { 
                Clients.Client(Cave.nodes[receiverID].connectionID).receiveData(senderID, data);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        public void broadcastData(int senderID, string data)
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

        public void requestTest()
        {
            try
            {
                Clients.Caller.receiveTest("test");
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }
    }
}