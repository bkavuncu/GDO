using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core.Geometries
{
    public class MultiPolygon : Geometry
    {
        public Coordinate[][][] Coordinates { get; set; }
        public Layout Layout { get; set; }
    }
}