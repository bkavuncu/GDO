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
        public Format Format { get; set; }
        public VectorSource Source { get; set; }
        new public void Init(int distance, double?[] extent, Format format, VectorSource source)
        {
            Distance = distance;
            Extent = extent;
            Format = format;
            Source = source;

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