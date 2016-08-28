using Newtonsoft.Json;

namespace GDO.Core
{
    /// <summary>
    /// Section Object Class
    /// </summary>
    public class AppSection
    {
        public int Id { get; set; }
        [JsonIgnore]
        public Node[,] Nodes;
        public int[,] NodeMap { get; set; }
        public int NumNodes { get; set; }
        [JsonIgnore]
        public int Width { get; set; }
        public int Height { get; set; }
        public int Pixels { get; set; }
        public int Col { get; set; }
        public int Row { get; set; }
        public int Cols { get; set; }
        public int Rows { get; set; }
        public string Src { get; set; }
        public int AppInstanceId { get; set; }
        public string AppName { get; set; }
        public int RealSectionId { get; set; }
        public int RealInstanceId { get; set; }
        /// <summary>
        /// Initializes a new instance of the <see cref="Section"/> class.
        /// </summary>
        /// <param name="id">The identifier.</param>
        /// <param name="col">top left??</param>
        /// <param name="row">top left ??</param>
        /// <param name="cols">The cols.</param>
        /// <param name="rows">The rows.</param>
        public AppSection(int id, int col, int row, int cols, int rows)
        {
            this.Id = id;
            this.Col = col;
            this.Row = row;
            this.Cols = cols;
            this.Rows = rows;
            this.NumNodes = cols * rows;
            this.Nodes = new Node[cols, rows];
            this.Src = null;
            this.AppName = null;
            this.AppInstanceId = -1;
            this.RealSectionId = -1;
            this.RealInstanceId = -1;
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
            return Src != null;
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
        /// Serializes this as a JSON
        /// </summary>
        /// <returns></returns>
        public string SerializeJSON()
        {
            this.NodeMap = GetNodeMap();
            return JsonConvert.SerializeObject(this);
        }
    }
}