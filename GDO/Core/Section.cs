using System.Linq;
using Newtonsoft.Json;

namespace GDO.Core
{
    /// <summary>
    /// Section Object Class
    /// </summary>
    public class Section
    {
        public int Id { get; set; }
        [JsonIgnore]
        public Node[,] Nodes;
        public int[,] NodeMap { get; set; }
        public int NumNodes { get; set; }
        [JsonIgnore]
        public IAppInstance App;
        public int Width { get; set; }
        public int Height { get; set; }
        public int Pixels { get; set; }
        public int Col { get; set; }
        public int Row { get; set; }
        public int Cols { get; set; }
        public int Rows { get; set; }
        public int P2PMode { get; set; }
        public int AppInstanceId { get; set; }
        public int AggregatedConnectionHealth { get; set; }

        /// <summary>
        /// Initializes a new instance of the <see cref="Section"/> class.
        /// </summary>
        /// <param name="id">The identifier.</param>
        /// <param name="cols">The cols.</param>
        /// <param name="rows">The rows.</param>
        public Section(int id, int col, int row, int cols, int rows)
        {
            this.Id = id;
            this.Col = col;
            this.Row = row;
            this.Cols = cols;
            this.Rows = rows;
            this.NumNodes = cols * rows;
            this.Nodes = new Node[cols, rows];
            this.AppInstanceId = -1;
        }

        /// <summary>
        /// Determines whether this instance is connected.
        /// </summary>
        /// <returns></returns>
        public bool IsConnected()
        {
            bool check = true;
            foreach (Node node in Nodes)
            {
                if (node.IsConnectedToCaveServer == false)
                {
                    check = false;
                }
            }
            return check;
        }

        public bool IsDeployed()
        {
            if (AppInstanceId > -1)
            {
                return true;
            }
            else
            {
                return false;
            }
        }

        /// <summary>
        /// Gets the node map (Matrix of NodeIds within the section).
        /// </summary>
        /// <returns></returns>
        public int[,] GetNodeMap()
        {
            int[,] map = new int[Cols, Rows];

            for (int i = 0; i < Cols; i++)
            {
                for (int j = 0; j < Rows; j++)
                {
                    map[i, j] = Nodes[i, j].Id;
                }
            }
            return map;
        }

        /// <summary>
        /// Calculates the dimensions.
        /// </summary>
        public void CalculateDimensions()
        {
            Width = 0;
            Height = 0;
            foreach (Node node in Nodes)
            {
                Width += node.Width;
                Height += node.Height;
            }
            Width = Width / Rows;
            Height = Height / Cols;
            Pixels = Width * Height;
        }
        /// <summary>
        /// Aggregates the connection health.
        /// </summary>
        public void aggregateConnectionHealth() {
            int agg =
                (from Node node in Nodes
                    where node.IsConnectedToCaveServer == false
                    select node.AggregatedConnectionHealth).Sum();
            AggregatedConnectionHealth = agg / NumNodes;

        }

        public void DeploySection(int instanceId)
        {
            this.AppInstanceId = instanceId;
            foreach (int nodeId in this.GetNodeMap())
            {
                Cave.Nodes[nodeId].AppInstanceId = instanceId;
            }
        }
        public void FreeSection()
        {
            this.AppInstanceId = -1;
            foreach (int nodeId in this.GetNodeMap())
            {
                Cave.Nodes[nodeId].AppInstanceId = -1;
            }
        }

        /// <summary>
        /// Serializes this as a JSON
        /// </summary>
        /// <returns></returns>
        public string SerializeJSON()
        {
            this.NodeMap = GetNodeMap();
            return Newtonsoft.Json.JsonConvert.SerializeObject(this);
        }
    }
}