using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.SmartCity.Core.Styles
{
    public class Style : Core.Style
    {
        public Geometry Geometry { get; set; }
        public FillStyle Fill { get; set; }
        public Styles.ImageStyle Image { get; set; }
        public StrokeStyle Stroke { get; set; }
        public TextStyle Text { get; set; }
        public int? ZIndex { get; set; }

        new public void Modify(Geometry geometry, FillStyle fill, Styles.ImageStyle image, StrokeStyle stroke, TextStyle text, int zIndex)
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