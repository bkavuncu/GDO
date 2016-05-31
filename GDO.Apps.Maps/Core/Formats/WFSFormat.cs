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
            Type.Value = (int)FormatTypes.WFS;

            SchemaLocation = new StringParameter
            {
                Name = "Schema Location",
                Description = "Optional schemaLocation to use for serialization, this will override the default.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true
            };
        }
    }
}