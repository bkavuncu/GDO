using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core.Sources.Images
{
    public class VectorImage : CanvasImage
    {
        public Sources.VectorSource VectorSource { get; set; }
        public Style Style { get; set; }
        public double Ratio { get; set; }
        new public void Modify(Sources.VectorSource vectorSource, Style style, double ratio)
        {
            VectorSource = vectorSource;
            Style = style;
            Ratio = ratio;
        }
    }
}