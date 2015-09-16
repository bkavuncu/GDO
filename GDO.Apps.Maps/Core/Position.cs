using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core
{
    public class Position
    {
        public Coordinate TopLeft { get; set; }
        public Coordinate Center { get; set; }
        public Coordinate BottomRight { get; set; }
        public double Resolution { get; set; }
        public int Zoom { get; set; }

        public Position(double[] topLeft, double[] center, double[] bottomRight, double resolution, int zoom)
        {
            TopLeft = new Coordinate(topLeft[0],topLeft[1], topLeft[2], topLeft[3]);
            Center = new Coordinate(center[0], center[1], center[2], center[3]);
            BottomRight = new Coordinate(bottomRight[0], bottomRight[1], bottomRight[2], bottomRight[3]);
            Resolution = resolution;
            Zoom = zoom;
        }
    }
}