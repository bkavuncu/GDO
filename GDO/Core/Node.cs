using System.Collections.Generic;
using System.Linq;
using GDO.Core.Apps;
using Newtonsoft.Json;

namespace GDO.Core
{

    /// <summary>
    /// Node Object Class
    /// </summary>
    public class Node
    {
        public int Id { get; set; }
        public int Col { get; set; }
        public int Row { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
        public int SectionCol { get; set; }
        public int SectionRow { get; set; }
        public int SectionId { get; set; }
        public int AppInstanceId { get; set; }
        public string PeerId { get; set; }
        public string ConnectionId { get; set; }
        public int P2PMode { get; set; }
        public bool IsConnectedToCaveServer { get; set; }
        public bool IsConnectedToPeerServer { get; set; }
        public int AggregatedConnectionHealth { get; set; }
        public bool IsDeployed { get; set; }
        //[JsonIgnore]
        public List<int> ConnectedNodeList;
        [JsonIgnore]
        public Section Section;
        [JsonIgnore]
        public IAppInstance App;

        /// <summary>
        /// Initializes a new instance of the <see cref="Node"/> class.
        /// </summary>
        /// <param name="id">The identifier.</param>
        /// <param name="col">The col.</param>
        /// <param name="row">The row.</param>
        /// <param name="width">The width.</param>
        /// <param name="height">The height.</param>
        /// <param name="numNodes">The number nodes.</param>TODO this is never used?
        public Node(int id, int col, int row, int width, int height, int numNodes)
        {
            this.IsConnectedToCaveServer = false;
            this.IsConnectedToPeerServer = false;
            this.IsDeployed = false;
            this.Id = id;
            this.Col = col;
            this.Row = row;
            this.SectionCol = col;
            this.SectionRow = row;
            this.Width = width;
            this.Height = height;
            this.SectionId = 0;
            this.AppInstanceId = -1;
            this.AggregatedConnectionHealth = 0;
            this.P2PMode = Cave.DefaultP2PMode;
            this.ConnectedNodeList = new List<int>();
            Cave.Deployment.Sections.TryGetValue(0, out this.Section); //When a node is created it deploys it to section 0 (pool of free nodes)
        }

        /// <summary>
        /// Deploys node to specified section
        /// </summary>
        /// <param name="section">The section.</param>
        /// <param name="col">The col.</param>
        /// <param name="row">The row.</param>
        public void Deploy(Section section, int col, int row)
        {
            this.SectionCol = col;
            this.SectionRow = row;
            this.Section = section;
            this.SectionId = section.Id;
            if (SectionId > 0)
            {
                this.IsDeployed = true;
            }
        }

        /// <summary>
        /// Frees the node.
        /// </summary>
        public void Free()
        {
            this.IsDeployed = false;
            this.SectionId = 0;
            this.AppInstanceId = -1;
            this.P2PMode = Cave.DefaultP2PMode;
            Cave.Deployment.Sections.TryGetValue(0,out this.Section);
        }

        /// <summary>
        /// Serializes this as a JSON
        /// </summary>
        /// <returns></returns>
        public string SerializeJSON()
        {
            return JsonConvert.SerializeObject(this);
        }

        /// <summary>
        /// Aggregates the connection health.
        /// </summary>
        public void AggregateConnectionHealth()
        {
            if (!IsConnectedToCaveServer)
            {
                AggregatedConnectionHealth = 1; return;

            }
            if (!IsConnectedToPeerServer)
            {
                AggregatedConnectionHealth = 2; return;
            }
            switch (P2PMode) {
                case (int) Cave.P2PModes.Cave:
                    if (Cave.Layout.Nodes.Any(nodeEntry => !ConnectedNodeList.Contains(nodeEntry.Value.Id) && nodeEntry.Value.Id != Id)) {
                        AggregatedConnectionHealth = 3;
                        return;
                    }
                    break;
                case (int)Cave.P2PModes.Section:
                    if (Section.Nodes.Cast<Node>().Any(node => !ConnectedNodeList.Contains(node.Id) && node.Id != Id)) {
                        AggregatedConnectionHealth = 3;
                        return;
                    }
                    break;
                case (int)Cave.P2PModes.Neighbours:
                    int[,] neighbours = Cave.GetNeighbourMap(Id);
                    foreach (int neighbourId in neighbours)
                    {
                        if (!ConnectedNodeList.Contains(neighbourId) && neighbourId != Id && neighbourId > 0)
                        {
                            if (Cave.Layout.Nodes[neighbourId].SectionId == SectionId)
                            {
                                AggregatedConnectionHealth = 3;
                                return;
                            }
                        }
                    }
                    break;
            }
            AggregatedConnectionHealth = 4;

        }

        public bool IsRunningApp() {
            return AppInstanceId >= 0;
        }
    }

}