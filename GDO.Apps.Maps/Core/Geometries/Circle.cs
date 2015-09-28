using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core.Geometries
{
    public class Circle : Geometry
    {
        public double [] Center { get; set; }
        public int Radius { get; set; }
        public  Layout Layout { get; set; }
    }
}