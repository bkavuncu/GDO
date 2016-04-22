using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mime;
using System.Web;

namespace GDO.Apps.Maps.Core.Styles
{
    public class Style : Core.Style
    {
        public Geometry Geometry { get; set; }
        public int FillStyleId { get; set; }
        public int ImageStyleId { get; set; }
        public int StrokeStyleId { get; set; }
        public int TextStyleId { get; set; }
        public int? ZIndex { get; set; }

        new public void Modify(Geometry geometry, int fillStyleId, int imageStyleId, int strokeStyleId, int textStyleId, int zIndex)
        {
            Geometry = geometry;
            FillStyleId = fillStyleId;
            ImageStyleId = imageStyleId;
            StrokeStyleId = strokeStyleId;
            TextStyleId = textStyleId;
            ZIndex = zIndex;
        }
    }
}