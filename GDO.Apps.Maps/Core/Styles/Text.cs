using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core.Styles
{
    public class Text : Core.Style
    {
        public string Font { get; set; }
        public int OffsetX { get; set; }
        public int OffsetY { get; set; }
        public float Scale { get; set; }
        public float Rotation { get; set; }
        public string Content { get; set; }
        public string TextAlign { get; set; }
        public string TextBaseLine { get; set; }
        public Fill Fill { get; set; }
        public Stroke Stroke { get; set; }
    }
}