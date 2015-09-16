using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core
{
    public class Coordinate
    {
        public double X { get; set; }
        public double Y { get; set; }
        public double Z { get; set; }
        public double M { get; set; }
        public Coordinate(double x, double y, double z, double m)
        {
            X = x;
            Y = y;
            Z = Z;
            M = m;
        }
    }
}