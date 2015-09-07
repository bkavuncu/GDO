using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core
{
    public class Layer
    {
        public int Id { get; set; }
        public int Name { get; set; }
        public int Index { get; set; }
        public int Type { get; set; }
        public Source Source { get; set; }
        public double Brightness { get; set; }
        public double Contrast { get; set; }
        public double Hue { get; set; }
        public double Opacity { get; set; }
        public double Saturation { get; set; }
        public Boolean Visible { get; set; }
        public Extent Extent { get; set; }
        public string MinResolution { get; set; }
        public string MaxResolution { get; set; }
    }
}