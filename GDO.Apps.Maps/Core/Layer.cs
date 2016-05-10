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
    public enum LayerTypes
    {
        Base = 0,
        Heatmap = 1,
        Image = 2,
        Tile = 3,
        Vector = 4
    };

    public class Layer : Base
    {
        [JsonProperty(Order = -1)]
        public LinkParameter SourceId { get; set; }

        [JsonProperty(Order = -1)]
        public FloatRangeParameter Opacity { get; set; }

        [JsonProperty(Order = -1)]
        public IntegerParameter ZIndex { get; set; }

        [JsonProperty(Order = -1)]
        public BooleanParameter Visible { get; set; }

        [JsonProperty(Order = -1)]
        public DoubleArrayParameter Extent { get; set; }

        [JsonProperty(Order = -1)]
        public NullableIntegerParameter MinResolution { get; set; }

        [JsonProperty(Order = -1)]
        public NullableIntegerParameter MaxResolution { get; set; }

        public Layer()
        {
            //TODO in here
        }
        public void Init(int id, string name, int type, int sourceId, float opacity, bool visible, int minResolution, int maxResolution, int zIndex)
        {
            Prepare();
            Id.Value = id;
            Name.Value = name;
            Type.Value = type;
            SourceId.Value = sourceId;
            Opacity.Value = opacity;
            Visible.Value = visible;
            MinResolution.Value = minResolution;
            MaxResolution.Value = maxResolution;
            ZIndex.Value = zIndex;
        }
    
        new public void Prepare()
        {
            base.Prepare();
            ClassName.Value = this.GetType().Name;

            SourceId = new LinkParameter
            {
                Name = "Source Id",
                Description = "Id of the Source",
                Priority = (int)GDO.Utility.Priorities.High,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Datalist,
                IsEditable = false,
                IsVisible = true,
                LinkedParameter = "Source"
            };

            Opacity = new FloatRangeParameter
            {
                Name = "Opacity",
                Description = "Transparency of the Layer",
                Priority = (int)GDO.Utility.Priorities.Low,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Slider,
                IsEditable = true,
                IsVisible = true,
                MinValue = 0,
                MaxValue = 1
            };

            ZIndex = new IntegerParameter
            {
                Name = "ZIndex",
                Description = "ZIndex",
                Priority = (int)GDO.Utility.Priorities.Low,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Number,
                IsEditable = true,
                IsVisible = false,
            };

            Visible = new BooleanParameter
            {
                Name = "Visible",
                Description = "Visible",
                Priority = (int)GDO.Utility.Priorities.Low,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Boolean,
                IsEditable = true,
                IsVisible = false,
            };

            Extent = new DoubleArrayParameter
            {
                Name = "Extent",
                Description = "Boundaries of the layer: [MinX, MinY, MaxX, MaxY]",
                Priority = (int)GDO.Utility.Priorities.Low,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Array,
                IsEditable = false,
                IsVisible = true,
            };

            MinResolution = new NullableIntegerParameter
            {
                Name = "MinResolution",
                Description = "Minimum resolution the layer will be rendered",
                Priority = (int)GDO.Utility.Priorities.Low,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Number,
                IsEditable = true,
                IsVisible = true,
            };

            MaxResolution = new NullableIntegerParameter
            {
                Name = "MaxResolution",
                Description = "Maximum resolution the layer will be rendered",
                Priority = (int)GDO.Utility.Priorities.Low,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Number,
                IsEditable = true,
                IsVisible = true,
            };
        }

        public void Modify(int id, string name, int type, float opacity, bool visible, int minResolution, int maxResolution)
        {
            Id.Value = id;
            Name.Value = name;
            Type.Value = type;
            Opacity.Value = opacity;
            Visible.Value = visible;
            MinResolution.Value = minResolution;
            MaxResolution.Value = maxResolution;
        }
    }
}