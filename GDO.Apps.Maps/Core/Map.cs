using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Utility;

namespace GDO.Apps.Maps.Core
{
    public class Map
    {
        public string Label { get; set; }
        public string SubLabel { get; set; }
        public bool ShowLabel { get; set; }
        public Position Position { get; set; }
        public View[] Views { get; set; }
        public Format[] Formats { get; set; }
        public Style[] Styles { get; set; }
        public Source[] Sources { get; set; }
        public Layer[] Layers { get; set; }

        public Map(string label, string subLabel, bool showLabel, Position position, View[] views, Format[] formats, Style[] styles, Source[] sources, Layer[] layers)
        {
            Label = label;
            SubLabel = subLabel;
            ShowLabel = showLabel;
            Position = position;
            Views = views;
            Formats = formats;
            Styles = styles;
            Sources = sources;
            Layers = layers;
        }
    }
}