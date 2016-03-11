using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core.Geometries
{
    public class Point : Geometry
    {
        public double [] Coordinate { get; set; }
        public string GeometryLayout { get; set; }
    }
}