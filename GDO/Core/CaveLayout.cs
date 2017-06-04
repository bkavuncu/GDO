// This code was written by Senaka Fernando
//

using GDO.Core.Modules;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Core
{
    public sealed class CaveLayout
    {
        public ConcurrentDictionary<string, IModule> Modules { get; set; }
        public ConcurrentDictionary<int, Node> Nodes { get; set; }

        public CaveLayout()
        {
            Modules = new ConcurrentDictionary<string, IModule>();

        }

        /// <summary>
        /// Creates the node.
        /// </summary>
        /// <param name="nodeId">The node identifier.</param>
        /// <param name="col">The col.</param>
        /// <param name="row">The row.</param>
        /// <param name="width">The width of node.</param>
        /// <param name="height">The height of node.</param>
        /// <param name="numNodes">The total number of nodes.</param>
        public void CreateNode(int nodeId, int col, int row, int width, int height, int numNodes)
        {
            Node node = new Node(nodeId, col, row, width, height, numNodes);
            Nodes.TryAdd(nodeId, node);
        }

        /// <summary>
        /// Gets the node with connectionId.
        /// </summary>
        /// <param name="connectionId">The connection identifier.</param>
        /// <returns></returns>
        public Node GetNode(string connectionId)
        {
            return
                (from nodeEntry in Nodes
                 where connectionId == nodeEntry.Value.ConnectionId
                 select nodeEntry.Value)
                    .FirstOrDefault();
        }


        /// <summary>
        /// Deploys the node to a section.
        /// </summary>
        /// <param name="sectionId">The section identifier.</param>
        /// <param name="nodeId">The node identifier.</param>
        /// <param name="col">The col.</param>
        /// <param name="row">The row.</param>
        /// <returns></returns>
        public Node DeployNode(int sectionId, int nodeId, int col, int row)
        {
            // TODO: Find a better way of linking between Nodes and Sections
            if (Cave.Sections.ContainsKey(sectionId) && Nodes.ContainsKey(nodeId))
            {
                if (!Nodes[nodeId].IsDeployed)
                {
                    Nodes[nodeId].Deploy(Cave.Sections[sectionId], col, row);
                    Cave.Sections[sectionId].Nodes[col, row] = Nodes[nodeId];
                    return Nodes[nodeId];
                }
            }
            return null;
        }

        /// <summary>
        /// Frees the node.
        /// </summary>
        /// <param name="nodeId">The node identifier.</param>
        /// <returns></returns>
        public Node FreeNode(int nodeId)
        {
            if (Nodes.ContainsKey(nodeId))
            {
                Nodes[nodeId].Free();
                return Nodes[nodeId];
            }
            return null;
        }

        /// <summary>
        /// Sets the node P2P mode.
        /// </summary>
        /// <param name="nodeId">The node identifier.</param>
        /// <param name="p2pmode">The p2pmode.</param>
        /// <returns></returns>
        public Node SetNodeP2PMode(int nodeId, int p2pmode)
        {
            Nodes[nodeId].P2PMode = p2pmode;
            return Nodes[nodeId];
        }

        /// <summary>
        /// Determines whether the specified node identifier contains node.
        /// </summary>
        /// <param name="nodeId">The node identifier.</param>
        /// <returns></returns>
        public bool ContainsNode(int nodeId)
        {
            return Nodes.ContainsKey(nodeId);
        }

        public bool ContainsModule(string moduleName)
        {
            return Modules.ContainsKey(moduleName);
        }

        public bool RegisterModule(string name, Type moduleClassType)
        {
            if (!Modules.ContainsKey(name))
            {
                IModule module = (IModule)Activator.CreateInstance(moduleClassType, new object[0]);
                module.Init();
                Modules.TryAdd(module.Name, module);
                // TODO: There needs to be a better way to manage locks.
                Cave.ModuleLocks.Add(module.Name, new object());
                return true;
            }
            return false;
        }

        public List<string> GetModuleList()
        {
            List<string> moduleList = Modules.Select(moduleEntry => moduleEntry.Value.Name).ToList();
            moduleList.Sort();
            return moduleList;
        }
    }
}