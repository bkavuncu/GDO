using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core.Sources.Images
{
    public class Vector : Canvas
    {
        public Sources.Vector Source { get; set; }
        public Style Style { get; set; }
        public double Ratio { get; set; }
    }
}