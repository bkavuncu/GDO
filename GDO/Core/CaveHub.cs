using System;
using System.Collections.Generic;
using Microsoft.AspNet.SignalR;

namespace GDO.Core
{
    public class CaveHub : Hub
    {
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
        public void DeployNode(int sectionId, int nodeId, int col, int row)
        {
            lock (Cave.ServerLock)
            {
                Cave.DeployNode(sectionId, nodeId, col, row);
                BroadcastNodeUpdate(nodeId);
            }
        }

        /// <summary>
        /// Frees the node.
        /// </summary>
        /// <param name="nodeId">The node identifier.</param>
        public void FreeNode(int nodeId)
        {
            lock (Cave.ServerLock)
            {
                Cave.FreeNode(nodeId);
                BroadcastNodeUpdate(nodeId);
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
                    BroadcastSectionUpdate(Cave.GetSectionId(colStart, rowStart), true);
                    /*foreach (Node node in deployedNodes)
                    {
                        BroadcastNodeUpdate(node.Id);
                    }*/
                    return true;
                }
                else
                {
                    return false;
                }
            }
        }

        /// <summary>
        /// Disposes a section.
        /// </summary>
        /// <param name="sectionId">The section identifier.</param>
        /// <returns></returns>
        public bool DisposeSection(int sectionId)
        {
            lock (Cave.ServerLock)
            {
                List<Node> freedNodes = Cave.DisposeSection(sectionId);
                if (freedNodes.Capacity > 0)
                {
                    BroadcastSectionUpdate(sectionId, false);
                    /*foreach (Node node in freedNodes)
                    {
                        BroadcastNodeUpdate(node.Id);
                    }*/
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
                    BroadcastSectionUpdate(sectionId, true);
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
        public void DeployApp()
        {
            lock (Cave.ServerLock)
            {
                //create a app instance
                //tell browser what part to use
            }
        }
        /// <summary>
        /// Disposes the application.
        /// </summary>
        public void DisposeApp()
        {
            lock (Cave.ServerLock)
            {
                //close app instance
                //send info to browsers, 
                //they start clean up
                //they deploy base app
            }
        }
        /// <summary>
        /// Uploads the node information.
        /// </summary>
        /// <param name="nodeId">The node identifier.</param>
        /// <param name="connectionId">The connection identifier.</param>
        /// <param name="connectedNodes">The connected nodes.</param>
        /// <param name="peerId">The peer identifier.</param>
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
                int[] deserializedConnectedNodes = Newtonsoft.Json.JsonConvert.DeserializeObject<int[]>(connectedNodes);
                node.ConnectedNodeList.Clear();
                foreach (int connectedNode in deserializedConnectedNodes)
                {
                    node.ConnectedNodeList.Add(connectedNode);
                }
                node.aggregateConnectionHealth();
                BroadcastNodeUpdate(nodeId);
            }
        }
        /// <summary>
        /// Requests all updates.
        /// </summary>
        public void RequestAllUpdates()
        {
            lock (Cave.ServerLock)
            {
                foreach (KeyValuePair<int, Node> nodeEntry in Cave.Nodes)
                {
                    Clients.Caller.receiveNodeUpdate(nodeEntry.Value.SerializeJSON());
                }
                foreach (KeyValuePair<int, Section> sectionEntry in Cave.Sections)
                {
                    Section section = sectionEntry.Value;
                    if (section.Id > 0)
                    {
                        Clients.Caller.receiveSectionUpdate(true, section.Id, section.Col, section.Row, section.Cols, section.Rows, section.P2PMode, section.GetNodeMap());
                    }
                }
            }
        }
        /// <summary>
        /// Requests the cave map.
        /// </summary>
        public void RequestCaveMap()
        {
            lock (Cave.ServerLock)
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
        }

        /// <summary>
        /// Requests the section map.
        /// </summary>
        /// <param name="sectionId">The section identifier.</param>
        public bool RequestSectionMap(int sectionId) {
            lock (Cave.ServerLock)
            {
                if (Cave.ContainsSection(sectionId))
                {
                    try
                    {
                        Clients.Caller.receiveSectionMap(Newtonsoft.Json.JsonConvert.SerializeObject(Cave.GetSectionMap(sectionId)));
                        return true;
                    }
                    catch (Exception e)
                    {
                        Console.WriteLine(e);
                        return false;
                    }
                }
                else
                {
                    return false;
                }
            }
        }

        /// <summary>
        /// Requests the neighbour map.
        /// </summary>
        /// <param name="nodeId">The node identifier.</param>
        public bool RequestNeighbourMap(int nodeId)
        {
            lock (Cave.ServerLock)
            {
                if (Cave.ContainsNode(nodeId))
                {
                    try
                    {
                        Clients.Caller.receiveNeighbourMap(Newtonsoft.Json.JsonConvert.SerializeObject(Cave.GetNeighbourMap(nodeId)));
                    }
                    catch (Exception e)
                    {
                        Console.WriteLine(e);
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
        /// Requests the application list.
        /// </summary>
        public void RequestAppList()
        {
            lock (Cave.ServerLock)
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
                    Node node;
                    Cave.Nodes.TryGetValue(nodeId, out node);
                    node.aggregateConnectionHealth();
                    Clients.All.receiveNodeUpdate(node.SerializeJSON());
                    return true;
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    return false;
                } 
            }
            else
            {
                return false;
            }
        }
        /// <summary>
        /// Broadcasts the section update.
        /// </summary>
        /// <param name="sectionId">The section identifier.</param>
        /// <param name="exists">if set to <c>true</c> [exists].</param>
        /// <returns></returns>
        private bool BroadcastSectionUpdate(int sectionId, bool exists)
        {
            try
            {
                if (exists)
                {
                    if (Cave.ContainsSection(sectionId))
                    {
                        Section section;
                        Cave.Sections.TryGetValue(sectionId, out section);
                        Clients.All.receiveSectionUpdate(true, sectionId, section.Col, section.Row, section.Cols, section.Rows, section.P2PMode, section.GetNodeMap());
                        return true;
                    }
                    else
                    {
                        return false;
                    }
                }
                else
                {
                    Clients.All.receiveSectionUpdate(false, sectionId, -1, -1, -1, -1, -1, -1);
                    return true;
                }
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
    }
}