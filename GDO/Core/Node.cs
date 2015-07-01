using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Newtonsoft.Json;

namespace GDO.Core
{
    enum P2PModes  {
        None = -1,
        Cave = 1,
        Section = 2,
        Neighbours= 3
    };
    /// <summary>
    /// Node Object Class
    /// </summary>
    public class Node
    {
        public int Id { get; set; }
        public int Col { get; set; }
        public int Row { get; set; }
        public int SectionCol { get; set; }
        public int SectionRow { get; set; }
        public int SectionId { get; set; }
        public int AppId { get; set; }
        public string PeerId { get; set; }
        public string ConnectionId { get; set; }
        public int P2PMode { get; set; }
        public bool IsConnected { get; set; }
        public bool IsDeployed { get; set; }
        [JsonIgnore]
        public int Width { get; set; }
        [JsonIgnore]
        public int Height { get; set; }
        [JsonIgnore]
        public Dictionary<int, bool> Connected;
        [JsonIgnore]
        public Section Section;
        [JsonIgnore]
        public IApp App;

        /// <summary>
        /// Initializes a new instance of the <see cref="Node"/> class.
        /// </summary>
        /// <param name="id">The identifier.</param>
        /// <param name="col">The col.</param>
        /// <param name="row">The row.</param>
        /// <param name="width">The width.</param>
        /// <param name="height">The height.</param>
        /// <param name="numNodes">The number nodes.</param>
        public Node(int id, int col, int row, int width, int height, int numNodes)
        {
            this.IsConnected = false;
            this.IsDeployed = false;
            this.Id = id;
            this.Col = col;
            this.Row = row;
            this.SectionCol = col;
            this.SectionRow = row;
            this.Width = width;
            this.Height = height;
            this.SectionId = 0;
            this.AppId = -1;
            this.P2PMode = (int)P2PModes.None;
            this.Connected= new Dictionary<int,bool>();
            for (int i = 0; i < numNodes; i++)
            {
                 Connected.Add(i,false);
            }
            Cave.Sections.TryGetValue(0, out this.Section); //When a node is created it deploys it to section 0 (pool of free nodes)
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
            this.AppId = -1;
            Cave.Sections.TryGetValue(0,out this.Section);
        }

        /// <summary>
        /// Serializes this as a JSON
        /// </summary>
        /// <returns></returns>
        public string SerializeJSON()
        {
            return Newtonsoft.Json.JsonConvert.SerializeObject(this);
        }
    }

}