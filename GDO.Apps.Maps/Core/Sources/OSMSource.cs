using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core.Sources
{
    public class OSMSource : XYZSource
    {
        public OSMSource()
        {
            ClassName.Value = this.GetType().Name;
            ObjectType.Value = "ol.source.OSM";
        }
    }
}