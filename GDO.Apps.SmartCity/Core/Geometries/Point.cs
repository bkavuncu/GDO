using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.SmartCity.Core.Geometries
{
    public class Point : Geometry
    {
        public double [] Coordinate { get; set; }
        public Layout Layout { get; set; }
    }
}