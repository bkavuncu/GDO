using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core.Sources.Images
{
    public class VectorImageSource : CanvasImageSource
    {
        public int VectorSourceId { get; set; }
        public int StyleId { get; set; }
        public double? Ratio { get; set; }
        new public void Init(int vectorSourceId, int styleId, double ratio)
        {
            vectorSourceId = vectorSourceId;
            StyleId = styleId;
            Ratio = ratio;

            Prepare();
        }
        new public void Prepare()
        {
            base.Prepare();
            ClassName = this.GetType().Name;
            AddtoEditables(() => StyleId);
        }

        new public void Modify(int styleId)
        {
            StyleId = styleId;
        }
    }
}