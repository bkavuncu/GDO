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
    public abstract class Layer : Base
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
        public NullableIntegerParameter MinResolution { get; set; }

        [JsonProperty(Order = -1)]
        public NullableIntegerParameter MaxResolution { get; set; }

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
                DefaultValue = 1
            };

            ZIndex = new IntegerParameter
            {
                Name = "ZIndex",
                PropertyName = "zIndex",
                Description = "The z-index for layer rendering. At rendering time, the layers will be ordered, first by Z-index and then by position.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = false,
                DefaultValue = 0
            };

            Visible = new BooleanParameter
            {
                Name = "Visible",
                PropertyName = "visible",
                Description = "Visibility",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = false,
                DefaultValue = true
            };

            Extent = new FloatArrayParameter
            {
                Name = "Extent",
                PropertyName = "extent",
                Description = "The bounding extent for layer rendering. The layer will not be rendered outside of this extent: [MinX, MinY, MaxX, MaxY]",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true,
            };

            MinResolution = new NullableIntegerParameter
            {
                Name = "Minimum Resolution",
                PropertyName = "minResolution",
                Description = "The minimum resolution (inclusive) at which this layer will be visible.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = true,
            };

            MaxResolution = new NullableIntegerParameter
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