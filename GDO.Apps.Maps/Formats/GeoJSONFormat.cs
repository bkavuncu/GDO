﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Apps.Maps.Core;

namespace GDO.Apps.Maps.Formats
{
    public class GeoJSONFormat : Format
    {
        public string GeometryName { get; set; }

        new public void Init(string geometryName)
        {
            GeometryName = geometryName;
            Prepare();
        }
        new public void Prepare()
        {
            ClassName = this.GetType().Name;
        }

        new public void Modify()
        {
        }
    }
}