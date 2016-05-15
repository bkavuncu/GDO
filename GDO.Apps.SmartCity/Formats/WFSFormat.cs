﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Apps.SmartCity.Core;

namespace GDO.Apps.SmartCity.Formats
{
    public class WFSFormat : Format
    {
        public int GMLVersion { get; set; }
        public string[] FeatureNS { get; set; }
        public string[] FeatureType { get; set; }
        public string SchemaLocation { get; set; }
    }
}