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

        public Position()
        {
            //TODO
        }
    }
}