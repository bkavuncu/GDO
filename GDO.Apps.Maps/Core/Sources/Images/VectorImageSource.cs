using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core.Sources.Images
{
    public class VectorImageSource : CanvasImageSource
    {
        public Sources.VectorSource Source { get; set; }
        public Style Style { get; set; }
        public double? Ratio { get; set; }
        new public void Init(Sources.VectorSource source, Style style, double ratio)
        {
            Source = source;
            Style = style;
            Ratio = ratio;

            Prepare();
        }
        new public void Prepare()
        {
            base.Prepare();
            ClassName = this.GetType().Name;
            AddtoEditables(() => Style);
        }

        new public void Modify(Style style)
        {
            Style = style;
        }
    }
}