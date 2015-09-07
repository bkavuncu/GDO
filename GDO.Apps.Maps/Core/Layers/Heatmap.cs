using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core.Layers
{
    public class Heatmap : Layer
    {
        public String[] Gradient { get; set; }
        public int Radius { get; set; }
        public int Shadow { get; set; }
        public int Weight { get; set; }
    }
}