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
            Node node = Cave.GetNode(Context.ConnectionId);
            if (node != null)
            {
                node.IsConnected = false;
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

            return base.OnDisconnected(stopCalled);

        }
        public void DeployNode(int sectionId, int nodeId, int col, int row)
        {
            Cave.DeployNode(sectionId,nodeId,col,row);
            BroadcastNodeUpdate(nodeId);
        }

        public void FreeNode(int nodeId)
        {
            Cave.FreeNode(nodeId);
            BroadcastNodeUpdate(nodeId);
        }

        public void CreateSection(int colStart, int rowStart, int colEnd, int rowEnd)
        {
            List<Node> deployedNodes = Cave.CreateSection(colStart, rowStart, colEnd, rowEnd);
            foreach (Node node in deployedNodes)
            {
                BroadcastNodeUpdate(node.Id);
            }
        }

        public void DisposeSection(int sectionId)
        {
            List<Node> freedNodes = Cave.DisposeSection(sectionId);
            foreach (Node node in freedNodes)
            {
                BroadcastNodeUpdate(node.Id);
            }
        }

        public void DeployApp()
        {
            //create a app instance
            //tell browser what part to use
        }

        public void DisposeApp()
        {
            //close app instance
            //send info to browsers, 
            //they start clean up
            //they deploy base app
        }

        public void UploadNodeInfo(int nodeId, string connectionId, string connectedNodes, string peerId)
        {
            Node node;
            Cave.Nodes.TryGetValue(nodeId, out node);
            node.IsConnected = true;
            node.ConnectionId = connectionId;
            node.PeerId = peerId;
            int[] deserializedConnectedNodes = Newtonsoft.Json.JsonConvert.DeserializeObject<int[]>(connectedNodes);
            foreach (int connectedNode in deserializedConnectedNodes)
            {
                node.Connected[connectedNode] = true;
            }

            BroadcastNodeUpdate(nodeId);
            //concurrency problem?
        }

        public void RequestCaveMap()
        {
            try
            { 
                Clients.Caller.receiveCaveMap(Cave.Cols, Cave.Rows, Newtonsoft.Json.JsonConvert.SerializeObject(Cave.GetCaveMap()));
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        public void RequestSectionMap(int sectionId)
        {
            try
            { 
                Clients.Caller.receiveSectionMap(Newtonsoft.Json.JsonConvert.SerializeObject(Cave.GetSectionMap(sectionId)));
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        public void RequestNeighbourMap(int nodeId)
        {
            try
            {
                Clients.Caller.receiveNeighbourMap(Newtonsoft.Json.JsonConvert.SerializeObject(Cave.GetNeighbourMap(nodeId)));
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        public void RequestAppList()
        {
            try
            { 
                Clients.Caller.receiveAppList(Newtonsoft.Json.JsonConvert.SerializeObject(Cave.GetAppList()));
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        public void BroadcastNodeUpdate(int nodeId)
        {
            try
            {
                Node node;
                Cave.Nodes.TryGetValue(nodeId, out node);
                Clients.All.receiveNodeUpdate(node.SerializeJSON());
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

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
    }
}