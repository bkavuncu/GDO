﻿using System;
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

        public KMLFormat()
        {
            ClassName.Value = this.GetType().Name;
            Type.Value = (int)FormatTypes.KML;

            ExtractStyles = new BooleanParameter
            {
                Name = "Extract Styles",
                Description = "Extract styles from the KML",
                DefaultValue = true,
                IsEditable = false,
                IsVisible = true
            };

            ShowPointNames = new BooleanParameter
            {
                Name = "Show Point Names",
                Description = "Show names as labels for placemarks which contain points.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                DefaultValue = true,
                IsEditable = false,
                IsVisible = true
            };

            DefaultStyle = new LinkParameter
            {
                Name = "Default Style",
                Description = "Default style. The default default style is the same as Google Earth.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                LinkedParameter = "style",
                IsEditable = false,
                IsVisible = true
            };
        }
    }
}