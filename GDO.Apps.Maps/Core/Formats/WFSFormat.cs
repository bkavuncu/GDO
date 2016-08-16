using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Apps.Maps.Core;
using GDO.Utility;

namespace GDO.Apps.Maps.Core.Formats
{
    public class WFSFormat : Format
    {
        public StringParameter SchemaLocation { get; set; }

        public WFSFormat()
        {
            ClassName.Value = this.GetType().Name;
            ObjectType.Value = "ol.format.WFS";
            Description.Value = "Feature format for reading and writing data in the WFS format. By default, supports WFS version 1.1.0. You can pass a GML format as option if you want to read a WFS that contains GML2 (WFS 1.0.0).";

            SchemaLocation = new StringParameter
            {
                Name = "Schema Location",
                PropertyName = "schemaLocation",
                Description = "Optional schemaLocation to use for serialization, this will override the default.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true
            };
        }
    }
}