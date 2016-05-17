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
        public IntegerArrayParameter DefaultStyleIds { get; set; }

        public KMLFormat()
        {
            ClassName.Value = this.GetType().Name;

            ExtractStyles = new BooleanParameter
            {
                Name = "Extract Styles",
                Description = "Extract styles from the KML",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Boolean,
                DefaultValue = true,
                IsEditable = false,
                IsVisible = true
            };

            ShowPointNames = new BooleanParameter
            {
                Name = "Show Point Names",
                Description = "Show names as labels for placemarks which contain points.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Boolean,
                DefaultValue = true,
                IsEditable = false,
                IsVisible = true
            };

            DefaultStyleIds = new IntegerArrayParameter
            {
                Name = "Default Styles",
                Description = "Default style. The default default style is the same as Google Earth.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Array,
                IsEditable = false,
                IsVisible = true
            };
        }
    }
}