using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.SmartCity.Core
{
    public class Position
    {
        public double [] TopLeft { get; set; }
        public double [] Center { get; set; }
        public double [] BottomRight { get; set; }
        public double Resolution { get; set; }
        public int Zoom { get; set; }

        public Position(double[] topLeft, double[] center, double[] bottomRight, double resolution, int zoom)
        {
            TopLeft = topLeft;
            Center = center;
            BottomRight = bottomRight;
            Resolution = resolution;
            Zoom = zoom;
        }
    }
}