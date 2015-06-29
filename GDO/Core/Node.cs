﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Newtonsoft.Json;

namespace GDO.Core
{
    enum P2P_MODE  {
        NONE = -1,
        CAVE = 1,
        SECTION = 2,
        NEIGHBOURS= 3
    };
    public class Node
    {
        public int id { get; set; }
        public int col { get; set; }
        public int row { get; set; }
        public int sectionCol { get; set; }
        public int sectionRow { get; set; }
        public int sectionID { get; set; }
        public int appID { get; set; }
        public string peerID { get; set; }
        public string connectionID { get; set; }
        public int p2pMode { get; set; }
        public bool isConnected { get; set; }
        public bool isDeployed { get; set; }
        [JsonIgnore]
        public int width { get; set; }
        [JsonIgnore]
        public int height { get; set; }
        [JsonIgnore]
        public Dictionary<int, bool> connected;
        [JsonIgnore]
        public Section section;
        [JsonIgnore]
        public IApp app;

        public Node(int id, int col, int row, int width, int height, int numNodes)
        {
            this.isConnected = false;
            this.isDeployed = false;
            this.id = id;
            this.col = col;
            this.row = row;
            this.sectionCol = col;
            this.sectionRow = row;
            this.width = width;
            this.height = height;
            this.sectionID = 0;
            this.appID = -1;
            this.p2pMode = (int)P2P_MODE.NONE;
            this.connected= new Dictionary<int,bool>();
            for (int i = 0; i < numNodes; i++)
            {
                 connected.Add(i,false);
            }
            Cave.sections.TryGetValue(0, out this.section);
        }

        public void deploy(Section section, int col, int row)
        {
            this.sectionCol = col;
            this.sectionRow = row;
            this.section = section;
            this.sectionID = section.id;
            if (sectionID > 0)
            {
                this.isDeployed = true;
            }
        }

        public void free()
        {
            this.isDeployed = false;
            this.sectionID = 0;
            this.appID = -1;
            Cave.sections.TryGetValue(0,out this.section);
        }

        public string serialize()
        {
            return Newtonsoft.Json.JsonConvert.SerializeObject(this);
        }
    }

}