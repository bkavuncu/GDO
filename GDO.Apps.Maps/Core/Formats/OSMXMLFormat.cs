﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Apps.Maps.Core;

namespace GDO.Apps.Maps.Core.Formats
{
    public class OSMXMLFormat : Format
    {
        public OSMXMLFormat(int id, string name, int type) : base(id, name, type)
        {
            ClassName.Value = this.GetType().Name;
        }
    }
}