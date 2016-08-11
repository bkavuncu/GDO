using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices.ComTypes;
using System.Web;
using GDO.Apps.Maps.Core.Layers;
using GDO.Utility;
using Newtonsoft.Json;

namespace GDO.Apps.Maps.Core
{
    public class Layer : Base
    {

        [JsonProperty(Order = -1)]
        public SliderParameter Opacity { get; set; }

        [JsonProperty(Order = -1)]
        public IntegerParameter ZIndex { get; set; }

        [JsonProperty(Order = -1)]
        public BooleanParameter Visible { get; set; }

        [JsonProperty(Order = -1)]
        public FloatArrayParameter Extent { get; set; }

        [JsonProperty(Order = -1)]
        public IntegerParameter MinResolution { get; set; }

        [JsonProperty(Order = -1)]
        public IntegerParameter MaxResolution { get; set; }

        public Layer() : base ()
        {
            ClassName.Value = this.GetType().Name;

            Opacity = new SliderParameter
            {
                Name = "Opacity",
                PropertyName = "opacity",
                Description = "Opacity (0, 1)",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = true,
                MinValue = 0,
                MaxValue = 1,
                DefaultValue = 1,
                Increment = (float?)0.05,
            };

            ZIndex = new IntegerParameter
            {
                Name = "ZIndex",
                PropertyName = "zIndex",
                Description = "The z-index for layer rendering. At rendering time, the layers will be ordered, first by Z-index and then by position.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true,
                DefaultValue = -1,
            };

            Visible = new BooleanParameter
            {
                Name = "Visible",
                PropertyName = "visible",
                Description = "Visibility",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = false,
                IsNull = false,
                DefaultValue = true,
                Value = true,
            };

            Extent = new FloatArrayParameter
            {
                Name = "Extent",
                PropertyName = "extent",
                Description = "The bounding extent for layer rendering. The layer will not be rendered outside of this extent: [MinX, MinY, MaxX, MaxY]",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true,
                Length = 2,
                DefaultValues = new float?[4],
                Values = new float?[4],
            };

            MinResolution = new IntegerParameter
            {
                Name = "Minimum Resolution",
                PropertyName = "minResolution",
                Description = "The minimum resolution (inclusive) at which this layer will be visible.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = true,
            };

            MaxResolution = new IntegerParameter
            {
                Name = "Maximum Resolution",
                PropertyName = "maxResolution",
                Description = "The maximum resolution (exclusive) below which this layer will be visible.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = true,
            };
        }
    }
}