using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Apps.Maps.Core;

namespace GDO.Apps.Maps.Core.Formats
{
    public class OSMXMLFormat : Format
    {
        public OSMXMLFormat()
        {
            ClassName.Value = this.GetType().Name;
            ObjectType.Value = "ol.format.OSMXML";
        }
    }
}