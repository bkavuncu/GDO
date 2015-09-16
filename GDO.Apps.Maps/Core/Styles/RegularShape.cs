using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core.Styles
{
    public class RegularShape : Styles.Image
    {
        public Fill Fill { get; set; }
        public int Points { get; set; }
        public int Radius { get; set; }
        public int Radius1 { get; set; }
        public int Radius2 { get; set; }
        public int Angle { get; set; }
        public bool SnapToPixel { get; set; }
        public Stroke Stroke { get; set; }
    }
}