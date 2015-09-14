using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core.Layers
{
    public class Heatmap : Layer
    {
        public string[] Gradient { get; set; }
        public int Radius { get; set; }
        public int Shadow { get; set; }
        public int Weight { get; set; }

        new public void Init(string[] gradient, int radius, int shadow, int weight)
        {
            Gradient = gradient;
            Radius = radius;
            Shadow = shadow;
            Weight = weight;
        }
    }
}