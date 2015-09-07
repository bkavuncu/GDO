using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core
{
    public class View
    {
        public Position Position { get; set; }
        public string MinResolution { get; set; }
        public string MaxResolution { get; set; }
        public int MinZoom { get; set; }
        public int MaxZoom { get; set; }
        public string Projection { get; set; }
        public double Rotation { get; set; }
        public Boolean EnableRotation { get; set; }
        public Boolean ConstrainRotation { get; set; }
    }
}