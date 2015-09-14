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
        None = -1,
        Base = 0,
        Heatmap = 1,
        Image = 2,
        Vector = 3
    };

    public class Layer
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int Type { get; set; }
        public Source Source { get; set; }
        public float Brightness { get; set; }
        public float Contrast { get; set; }
        public float Saturation { get; set; }
        public float Hue { get; set; }
        public float Opacity { get; set; }
        public int ZIndex { get; set; }
        public bool Visible { get; set; }
        public Extent Extent { get; set; }
        public int MinResolution { get; set; }
        public int MaxResolution { get; set; }

        public Layer()
        {
            
        }
        public void Init(int id, string name, int type, Source source, float brightness, float contrast, float saturation, float hue, float opacity, int zIndex, bool visible, int minResolution, int maxResolution)
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
            ZIndex = zIndex;
            Visible = visible;
            MinResolution = minResolution;
            MaxResolution = maxResolution;
        }
    }
}