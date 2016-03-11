using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices.ComTypes;
using System.Web;
using GDO.Apps.Maps.Core.Layers;
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
        public int SourceId { get; set; }
        [JsonProperty(Order = -1)]
        public float? Brightness { get; set; }
        [JsonProperty(Order = -1)]
        public float? Contrast { get; set; }
        [JsonProperty(Order = -1)]
        public float? Saturation { get; set; }
        [JsonProperty(Order = -1)]
        public float? Hue { get; set; }
        [JsonProperty(Order = -1)]
        public float? Opacity { get; set; }
        [JsonProperty(Order = -1)]
        public int ZIndex { get; set; }
        [JsonProperty(Order = -1)]
        public bool? Visible { get; set; }
        [JsonProperty(Order = -1)]
        public double?[] Extent { get; set; }
        [JsonProperty(Order = -1)]
        public int? MinResolution { get; set; }
        [JsonProperty(Order = -1)]
        public int? MaxResolution { get; set; }
        [JsonProperty(Order = -1)]
        public bool CanAnimate { get; set; }
        [JsonProperty(Order = -1)]
        public bool IsAnimating { get; set; }

        public Layer()
        {
            
        }
        public void Init(int id, string name, int type, int sourceId, float brightness, float contrast, float saturation, float hue,
            float opacity, bool visible, int minResolution, int maxResolution, int zIndex, bool canAnimate, bool isAnimating)
        {
            Id = id;
            Name = name;
            Type = type;
            SourceId = sourceId;
            Brightness = brightness;
            Contrast = contrast;
            Saturation = saturation;
            Hue = hue;
            Opacity = opacity;
            Visible = visible;
            MinResolution = minResolution;
            MaxResolution = maxResolution;
            CanAnimate = canAnimate;
            IsAnimating = isAnimating;
            ZIndex = zIndex;
            Prepare();
        }
    
        new public void Prepare()
        {
            ClassName = this.GetType().Name;

            //AddtoEditables(() => Id);
            AddtoEditables(() => Name);
            //AddtoEditables(() => Type);
            AddtoEditables(() => Brightness);
            AddtoEditables(() => Contrast);
            AddtoEditables(() => Saturation);
            AddtoEditables(() => Hue);
            AddtoEditables(() => Opacity);
            AddtoEditables(() => Visible);
            AddtoEditables(() => MinResolution);
            AddtoEditables(() => MaxResolution);
        }

        public void Modify(int id, string name, int type, float brightness, float contrast, float saturation, float hue,
            float opacity, bool visible, int minResolution, int maxResolution, bool isAnimating)
        {
            Id = id;
            Name = name;
            Type = type;
            Brightness = brightness;
            Contrast = contrast;
            Saturation = saturation;
            Hue = hue;
            Opacity = opacity;
            IsAnimating = isAnimating;
            Visible = visible;
            MinResolution = minResolution;
            MaxResolution = maxResolution;
        }
    }
}