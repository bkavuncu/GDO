using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Utility;

namespace GDO.Apps.Maps.Core.Layers
{
    public class HeatmapLayer : Layer
    {
        public LinkParameter Source { get; set; }
        public StringArrayParameter Gradient { get; set; }
        public SliderParameter Radius { get; set; }
        public SliderParameter Shadow { get; set; }
        public SliderParameter Weight { get; set; }
        public SliderParameter Blur { get; set; }

        public HeatmapLayer()
        {
            ClassName.Value = this.GetType().Name;
            ObjectType.Value = "ol.layer.Heatmap";

            Source = new LinkParameter
            {
                Name = "Source",
                PropertyName = "source",
                Description = "The source for this layer",
                Priority = (int)GDO.Utility.Priorities.Required,
                IsEditable = false,
                IsVisible = true,
                LinkedParameter = "sources",
                ObjectType = "ol.source.Vector",
            };

            Gradient = new StringArrayParameter
            {
                Name = "Gradient",
                PropertyName = "gradient",
                Description = "The color gradient of the heatmap, specified as an array of CSS color strings.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = true,
                DefaultValues = new string[5] { "#00f", "#0ff", "#0f0", "#ff0", "#f00"},
                Length = 5
            };

            Radius = new SliderParameter
            {
                Name = "Radius",
                PropertyName = "radius",
                Description = "Radius size in pixels.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = true,
                MinValue = 0,
                MaxValue = 100,
                DefaultValue = 8
            };

            Shadow = new SliderParameter
            {
                Name = "Shadow",
                PropertyName = "shadow",
                Description = "Shadow size in pixels.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true,
                MinValue = 0,
                MaxValue = 1000,
                DefaultValue = 250
            };

            Weight = new SliderParameter
            {
                Name = "Weight",
                PropertyName = "weight",
                Description = "Weight of features",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true,
                MinValue = 0,
                MaxValue = 1,
                DefaultValue = (float?)0.5
            };

            Blur = new SliderParameter
            {
                Name = "Blur",
                PropertyName = "blur",
                Description = "Blur size of features",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = true,
                MinValue = 0,
                MaxValue = 100,
                DefaultValue = 15
            };
        }
    }
}