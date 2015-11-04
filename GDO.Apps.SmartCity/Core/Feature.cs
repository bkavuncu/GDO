﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Apps.SmartCity.Core.Geometries;

namespace GDO.Apps.SmartCity.Core
{
    public class Feature
    {
        public Geometry Geometry { get; set; }
        public Point LabelPoint { get; set; }
        public Style Style { get; set; } //Features can be styled individually; otherwise they use the style of their vector layer.
    }
}