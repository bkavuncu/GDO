﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core.Geometries
{
    public class MultiPoint : Geometry
    {
        public double [][] Coordinates { get; set; }
        public Layout Layout { get; set; }
    }
}