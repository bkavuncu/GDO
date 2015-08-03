﻿using System;
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
        public bool DeployNode(int sectionId, int nodeId, int col, int row)
        {
            lock (Cave.ServerLock)
            {
                Node node = Cave.DeployNode(sectionId, nodeId, col, row);
                if (node != null)
                {
                    BroadcastNodeUpdate(nodeId);
                    return true;
                }
                else
                {
                    return false;
                }
            }
        }

        /// <summary>
        /// Frees the node.
        /// </summary>
        /// <param name="nodeId">The node identifier.</param>
        public bool FreeNode(int nodeId)
        {
            lock (Cave.ServerLock)
            {
                Node node = Cave.FreeNode(nodeId);
                if (node != null)
                {
                    BroadcastNodeUpdate(nodeId);
                    return true;
                }
                else
                {
                    return false;
                }
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
                    foreach (Node node in deployedNodes)
                    {
                        if(node.ConnectionId != null)
                        {
                            Groups.Add(node.ConnectionId, node.SectionId.ToString());
                        }
                    }
                    BroadcastSectionUpdate(Cave.GetSectionId(colStart, rowStart));
                    return true;
                }
                else
                {
                    return false;
                }
            }
        }

        /// <summary>
        /// Closes a section.
        /// </summary>
        /// <param name="sectionId">The section identifier.</param>
        /// <returns></returns>
        public bool CloseSection(int sectionId)
        {
            lock (Cave.ServerLock)
            {
                List<Node> freedNodes = Cave.CloseSection(sectionId);
                if (freedNodes.Capacity > 0)
                {
                    foreach (Node node in freedNodes)
                    {
                        if (node.ConnectionId != null)
                        {
                            Groups.Remove(node.ConnectionId, node.SectionId.ToString());
                        }
                    }
                    BroadcastSectionUpdate(sectionId);
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
                    BroadcastSectionUpdate(sectionId);
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
        /// <param name="sectionId">The section identifier.</param>
        /// <param name="appName">Name of the application.</param>
        /// <param name="configName">Name of the configuration.</param>
        /// <returns></returns>
        public int DeployApp(int sectionId, string appName, string configName)
        {
            lock (Cave.ServerLock)
            {
                int instanceId = Cave.CreateAppInstance(sectionId, appName, configName);
                if (instanceId >= 0)
                {
                    BroadcastAppUpdate(sectionId, appName, configName, instanceId, Cave.Apps[appName].P2PMode, true);
                }
                return instanceId;
            }
        }

        /// <summary>
        /// Closes the application.
        /// </summary>
        /// <param name="instanceId">The instance identifier.</param>
        /// <returns></returns>
        public bool CloseApp(int instanceId)
        {
            lock (Cave.ServerLock)
            {
                if (Cave.ContainsInstance(instanceId))
                {
                    string appName = Cave.GetAppName(instanceId);
                    int sectionId = Cave.Apps[appName].Instances[instanceId].Section.Id;
                    if (Cave.DisposeAppInstance(appName, instanceId))
                    {
                        BroadcastAppUpdate(sectionId, appName, "", instanceId, (int) Cave.P2PModes.None, false);
                        return true;
                    }
                }
                return false;
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
                if (node.IsDeployed)
                {
                    Groups.Add(node.ConnectionId, node.SectionId.ToString());
                }
                else
                {
                    Groups.Remove(node.ConnectionId, node.SectionId.ToString());
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

                List<string> serializedNodes = new List<string>(Cave.Nodes.Count);
                foreach (KeyValuePair<int, Node> nodeEntry in Cave.Nodes)
                {
                    serializedNodes.Add(GetNodeUpdate(nodeEntry.Value.Id));
                }
                Clients.Caller.receiveNodesUpdate(serializedNodes);

                List<int> sectionIds = new List<int>(Cave.Sections.Count - 1);
                List<bool> sectionStatuses = new List<bool>(Cave.Sections.Count - 1);
                List<string> serializedSections = new List<string>(Cave.Sections.Count - 1);

                foreach (KeyValuePair<int, Section> sectionEntry in Cave.Sections)
                {
                    Section section = sectionEntry.Value;
                    if (section.Id > 0)
                    {
                        sectionIds.Add(section.Id);
                        sectionStatuses.Add(true);
                        serializedSections.Add(GetSectionUpdate(section.Id));
                    }
                }
                Clients.Caller.receiveSectionsUpdate(sectionStatuses, sectionIds, serializedSections);

                foreach (KeyValuePair<string, App> appEntry in Cave.Apps)
                {
                    App app = appEntry.Value;
                    foreach (KeyValuePair<int, IAppInstance> appInstanceEntry in app.Instances)
                    {
                        IAppInstance instance = appInstanceEntry.Value;
                        Clients.Caller.receiveAppUpdate(instance.Section.Id, app.Name, instance.Configuration.Name, instance.Id, instance.Section.P2PMode, true);
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

        public void RequestAppConfigurationList(string appName)
        {
            lock (Cave.ServerLock)
            {
                try
                {
                    Clients.Caller.receiveAppConfigurationList(appName, Newtonsoft.Json.JsonConvert.SerializeObject(Cave.Apps[appName].GetConfigurationList()));
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void RequestAppConfiguration(int instanceId)
        {
            lock (Cave.ServerLock)
            {
                try
                {
                    if (Cave.ContainsInstance(instanceId))
                    {
                        Clients.Caller.receiveAppConfig(instanceId, Cave.GetAppName(instanceId), Cave.Apps[Cave.GetAppName(instanceId)].Instances[instanceId].Configuration.Name,
                            Newtonsoft.Json.JsonConvert.SerializeObject(Cave.Apps[Cave.GetAppName(instanceId)].Instances[instanceId].Configuration.Json));
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        private string GetNodeUpdate(int nodeId)
        {
            if (Cave.ContainsNode(nodeId))
            {
                try
                {
                    Node node;
                    Cave.Nodes.TryGetValue(nodeId, out node);
                    node.aggregateConnectionHealth();
                    return node.SerializeJSON();
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    return null;
                }
            }
            return null;
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
                    string serializedNode = GetNodeUpdate(nodeId);
                    if (serializedNode != null)
                    {
                        Clients.All.receiveNodeUpdate(serializedNode);
                        return true;
                    }
                    else
                    {
                        return false;
                    }
                    
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    return false;
                } 
            }
            return false;
        }

        private string GetSectionUpdate(int sectionId)
        {
            try
            {
                if (Cave.ContainsSection(sectionId))
                {
                    Section section;
                    Cave.Sections.TryGetValue(sectionId, out section);
                    return section.SerializeJSON();
                }
                else
                {
                    return null;
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return null;
            }
        }

        /// <summary>
        /// Broadcasts the section update.
        /// </summary>
        /// <param name="sectionId">The section identifier.</param>
        /// <param name="exists">if set to <c>true</c> [exists].</param>
        /// <returns></returns>
        private bool BroadcastSectionUpdate(int sectionId)
        {
            try
            {
                string serializedSection = GetSectionUpdate(sectionId);
                if (Cave.ContainsSection(sectionId) && serializedSection != null)
                {
                    Clients.All.receiveSectionUpdate(true, sectionId, serializedSection);
                    return true;
                }
                else
                {
                    Clients.All.receiveSectionUpdate(false, sectionId, "");
                    return true;
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return false;
            }
        }

        private bool BroadcastAppUpdate(int sectionId, string appName, string configName, int instanceId, int p2pmode, bool exists)
        {
            try
            {
                if (exists)
                {
                    if (Cave.Apps.ContainsKey(appName))
                    {
                        if (Cave.ContainsInstance(instanceId) &&Cave.Apps[appName].Configurations.ContainsKey(configName))
                        {
                            //Clients.Group(sectionId.ToString()).receiveAppConfig(instanceId, appName, configName,Newtonsoft.Json.JsonConvert.SerializeObject(Cave.Apps[appName].Configurations[configName]));
                            Clients.All.receiveAppUpdate(sectionId, appName, configName, instanceId, p2pmode, exists);
                            return true;
                        }
                    }
                }
                else
                {
                    Clients.All.receiveAppUpdate(sectionId, -1, -1, instanceId, exists);
                    return true;
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return false;
            }
            return false;
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

        public void SetMaintenanceMode(bool mode)
        {
            lock (Cave.ServerLock)
            {
                Cave.MaintenanceMode = mode;
                Clients.All.setMaintenanceMode(mode);
            }
        }

        public void RequestMaintenanceMode()
        {
            lock (Cave.ServerLock)
            {
                Clients.All.setMaintenanceMode(Cave.MaintenanceMode);
            }
        }
        public void JoinGroup(int sectionId)
        {
            Groups.Add(Context.ConnectionId, "" + sectionId);
        }
        public void ExitGroup(int sectionId)
        {
            Groups.Remove(Context.ConnectionId, "" + sectionId);
        }

        public void Initialize()
        {
            //dummy
        }
    }
}