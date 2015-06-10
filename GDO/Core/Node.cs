using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Newtonsoft.Json;

namespace GDO.Core
{
    public class Node
    {
        public int id { get; set; }
        public int col { get; set; }
        public int row { get; set; }
        public int sectionCol { get; set; }
        public int sectionRow { get; set; }
        public int sectionID { get; set; }
        public int appID { get; set; }
        public bool isConnected { get; set; }
        public bool isDeployed { get; set; }
        [JsonIgnore]
        public int width { get; set; }
        [JsonIgnore]
        public int height { get; set; }
        [JsonIgnore]
        public string connectionID { get; set; }
        [JsonIgnore]
        public Dictionary<int, bool> connected;
        [JsonIgnore]
        public Section section;
        [JsonIgnore]
        public App app;

        public Node(int id, int col, int row, int width, int height, int numNodes)
        {
            this.isConnected = false;
            this.isDeployed = false;
            this.id = id;
            this.col = col;
            this.row = row;
            this.sectionCol = -1;
            this.sectionRow = -1;
            this.width = width;
            this.height = height;
            this.sectionID = -1;
            this.appID = -1;
            this.connected= new Dictionary<int,bool>();
            for (int i = 0; i < numNodes; i++)
            {
                 connected.Add(i,false);
            }
        }

        public void deploy(Section section, int col, int row)
        {
            this.sectionCol = col;
            this.sectionRow = row;
            this.section = section;
            this.sectionID = section.id;
            this.isDeployed = true;
            this.section.nodes[col, row] = this;
        }

        public void free()
        {
            this.isDeployed = false;
            this.sectionID = -1;
            this.appID = -1;
        }

        public string serialize()
        {
            return Newtonsoft.Json.JsonConvert.SerializeObject(this);
        }
    }

}