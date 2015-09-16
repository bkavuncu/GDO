using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core.Styles
{
    public class Circle : Styles.Image
    {
        public Fill Fill { get; set; }
        public int Radius { get; set; }
        public bool SnapToPixel { get; set; }
        public Stroke Stroke { get; set; }
    }
}