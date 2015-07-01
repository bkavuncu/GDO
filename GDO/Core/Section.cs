using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Core
{
    public class Section
    {
        public int Id { get; set; }
        public Node[,] Nodes;
        public int NumNodes { get; set; }
        public IApp App;
        public int Width { get; set; }
        public int Height { get; set; }
        public int Cols { get; set; }
        public int Rows { get; set; }

        public Section(int id, int cols, int rows)
        {
            this.Id = id;
            this.Cols = cols;
            this.Rows = rows;
            this.NumNodes = cols * rows;
            this.Nodes = new Node[cols,rows];
        }

        public bool IsConnected()
        {
            bool check = true;
            foreach(Node node in Nodes)
            {
                if (node.IsConnected == false)
                {
                    check = false;
                }
            }
                        

            return check;
        }
        //TODO doc with whats in return type
        public int[,] GetNodeMap()
        {
            int[,] map = new int[Cols,Rows];

            for (int i = 0; i < Cols; i++)
            {
                for (int j = 0; j < Rows; j++)
                {
                    map[i,j] = Nodes[i, j].Id;
                }
            }
            return map;
        }

        public void CalculateDimensions()
        {
            Width = 0;
            Height = 0;
            foreach (Node node in Nodes)
            {
                Width += node.Width;
                Height += node.Height;
            }
            Width = Width/Rows;
            Height = Height/Cols;
        }
        //Nodes connected
        //Control node connected, and info
    }
}