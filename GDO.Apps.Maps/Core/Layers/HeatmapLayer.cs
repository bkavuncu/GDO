﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core.Layers
{
    public class HeatmapLayer : Layer
    {
        public string[] Gradient { get; set; }
        public float? Radius { get; set; }
        public float? Shadow { get; set; }
        public float? Weight { get; set; }
        public float? Blur { get; set; }

        new public void Init(string[] gradient, float radius, float shadow, float weight, float blur)
        {
            Gradient = gradient;
            Radius = radius;
            Shadow = shadow;
            Weight = weight;
            Blur = blur;

            Prepare();
        }
        new public void Prepare()
        {
            ClassName = this.GetType().Name;

            AddtoEditables(() => Gradient);
            AddtoEditables(() => Radius);
            AddtoEditables(() => Blur);
        }

        new public void Modify(string[] gradient, float radius,  float blur)
        {
            Gradient = gradient;
            Radius = radius;
            Blur = blur;
        }
    }
}