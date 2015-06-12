using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Core
{
    public class Section
    {
        public int id { get; set; }
        public Node[,] nodes;
        public int numNodes { get; set; }
        public App app;
        public int width { get; set; }
        public int height { get; set; }
        public int cols { get; set; }
        public int rows { get; set; }

        public Section(int id, int cols, int rows)
        {
            this.id = id;
            this.cols = cols;
            this.rows = rows;
            this.numNodes = cols * rows;
            this.nodes = new Node[cols,rows];
        }

        public bool isConnected()
        {
            bool check = true;
            foreach(Node node in nodes)
            {
                if (node.isConnected == false)
                {
                    check = false;
                }
            }
            return check;
        }

        public int[,] getNodeMap()
        {
            int[,] map = new int[cols,rows];

            for (int i = 0; i < cols; i++)
            {
                for (int j = 0; j < rows; j++)
                {
                    map[i,j] = nodes[i, j].id;
                }
            }
            return map;
        }

        public void calculateDimensions()
        {
            width = 0;
            height = 0;
            foreach (Node node in nodes)
            {
                width += node.width;
                height += node.height;
            }
            width = width/rows;
            height = height/cols;
        }
        //Nodes connected
        //Control node connected, and info
    }
}