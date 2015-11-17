﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.SmartCity.Core.Geometries
{
    public class MultiPolygon : Geometry
    {
        public double [][][][] Coordinates { get; set; }
        public Layout Layout { get; set; }
    }
}