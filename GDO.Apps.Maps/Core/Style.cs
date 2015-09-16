using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Apps.Maps.Core.Styles;

namespace GDO.Apps.Maps.Core
{
    public class Style
    {
        public Geometry Geometry { get; set; }
        public Fill Fill { get; set; }
        public Styles.Image Image { get; set; }
        public Stroke Stroke { get; set; }
        public Text Text { get; set; }
        public int ZIndex { get; set; }

        public Style(Geometry geometry, Fill fill, Styles.Image image, Stroke stroke, Text text, int zIndex)
        {
            Geometry = geometry;
            Fill = fill;
            Image = image;
            Stroke = stroke;
            Text = text;
            ZIndex = zIndex;
        }
    }
}