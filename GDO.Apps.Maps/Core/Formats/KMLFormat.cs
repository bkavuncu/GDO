using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Apps.Maps.Core;
using GDO.Utility;

namespace GDO.Apps.Maps.Core.Formats
{
    public class KMLFormat : Format
    {
        public BooleanParameter ExtractStyles { get; set; }
        public BooleanParameter ShowPointNames { get; set; }
        public LinkParameter DefaultStyle { get; set; }
        public BooleanParameter WriteStyles { get; set; }

        public KMLFormat()
        {
            ClassName.Value = this.GetType().Name;
            ObjectType.Value = "ol.format.KML";
            Description.Value = "Feature format for reading and writing data in the KML format.";

            ExtractStyles = new BooleanParameter
            {
                Name = "Extract Styles",
                PropertyName = "extractStyles",
                Description = "Extract styles from the KML",
                DefaultValue = true,
                IsEditable = false,
                IsVisible = true
            };

            ShowPointNames = new BooleanParameter
            {
                Name = "Show Point Names",
                PropertyName = "showPointNames",
                Description = "Show names as labels for placemarks which contain points.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                DefaultValue = true,
                IsEditable = false,
                IsVisible = true
            };

            DefaultStyle = new LinkParameter
            {
                Name = "Default Style",
                PropertyName = "defaultStyle",
                Description = "Default style. The default default style is the same as Google Earth.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                LinkedParameter = "styles",
                IsEditable = false,
                IsVisible = true
            };

            WriteStyles = new BooleanParameter
            {
                Name = "Write Styles",
                PropertyName = "writeStyles",
                Description = "Write styles into KML.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                DefaultValue = true,
                IsEditable = false,
                IsVisible = true
            };
        }
    }
}