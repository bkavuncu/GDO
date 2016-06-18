using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Apps.Maps.Core;

namespace GDO.Apps.Maps.Core.Formats
{
    public class XMLFormat : Format
    {
        public XMLFormat()
        {
            ClassName.Value = this.GetType().Name;
            ObjectType.Value = "ol.format.XML";
            Description.Value = "Generic format for reading non-feature XML data";
        }
    }
}