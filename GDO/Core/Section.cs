using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Core
{
    /// <summary>
    /// Section Object Class
    /// </summary>
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

        /// <summary>
        /// Initializes a new instance of the <see cref="Section"/> class.
        /// </summary>
        /// <param name="id">The identifier.</param>
        /// <param name="cols">The cols.</param>
        /// <param name="rows">The rows.</param>
        public Section(int id, int cols, int rows)
        {
            this.Id = id;
            this.Cols = cols;
            this.Rows = rows;
            this.NumNodes = cols * rows;
            this.Nodes = new Node[cols,rows];
        }

        /// <summary>
        /// Determines whether this instance is connected.
        /// </summary>
        /// <returns></returns>
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
        /// <summary>
        /// Gets the node map (Matrix of NodeIds within the section).
        /// </summary>
        /// <returns></returns>
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
            Width = Width/Rows;
            Height = Height/Cols;
        }
        //Nodes connected
        //Control node connected, and info
    }
}