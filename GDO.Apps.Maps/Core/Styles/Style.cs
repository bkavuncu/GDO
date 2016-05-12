using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mime;
using System.Web;

namespace GDO.Apps.Maps.Core.Styles
{
    public class Style : Core.Style
    {
        public int FillStyleId { get; set; }
        public int ImageStyleId { get; set; }
        public int StrokeStyleId { get; set; }
        public int TextStyleId { get; set; }
        public int? ZIndex { get; set; }

        new public void Modify(int fillStyleId, int imageStyleId, int strokeStyleId, int textStyleId, int zIndex)
        {
            FillStyleId = fillStyleId;
            ImageStyleId = imageStyleId;
            StrokeStyleId = strokeStyleId;
            TextStyleId = textStyleId;
            ZIndex = zIndex;
        }
    }
}