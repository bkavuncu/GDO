using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices.ComTypes;
using System.Web;
using GDO.Apps.Maps.Core.Layers;

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
        public Source Source { get; set; }
        public float? Brightness { get; set; }
        public float? Contrast { get; set; }
        public float? Saturation { get; set; }
        public float? Hue { get; set; }
        public float? Opacity { get; set; }
        public int ZIndex { get; set; }
        public bool? Visible { get; set; }
        public double?[] Extent { get; set; }
        public int? MinResolution { get; set; }
        public int? MaxResolution { get; set; }
        public bool CanAnimate { get; set; }
        public bool IsAnimating { get; set; }

        public Layer()
        {
            
        }
        public void Init(int id, string name, int type, Source source, float brightness, float contrast, float saturation, float hue,
            float opacity, bool visible, int minResolution, int maxResolution, int zIndex, bool canAnimate, bool isAnimating)
        {
            Id = id;
            Name = name;
            Type = type;
            Source = source;
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

            AddtoEditables(() => Id);
            AddtoEditables(() => Name);
            AddtoEditables(() => Type);
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