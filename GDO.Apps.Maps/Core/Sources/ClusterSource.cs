using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core.Sources
{
    public class ClusterSource : Source
    {
        public int? Distance { get; set; }
        public double?[] Extent { get; set; }
        public int FormatId { get; set; }
        public int VectorSourceId { get; set; }
        new public void Init(int distance, double?[] extent, int formatId, int vectorSourceId)
        {
            Distance = distance;
            Extent = extent;
            FormatId = formatId;
            VectorSourceId = vectorSourceId;

            Prepare();
        }
        new public void Prepare()
        {
            base.Prepare();
            ClassName = this.GetType().Name;
        }

        new public void Modify()
        {
        }
        //TODO add feature functions
    }
}