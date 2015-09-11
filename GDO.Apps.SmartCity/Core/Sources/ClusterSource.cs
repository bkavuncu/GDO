using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Web;

namespace GDO.Apps.SmartCity.Core.Sources
{
    public class ClusterSource : Source
    {
        public int? Distance { get; set; }
        public double?[] Extent { get; set; }
        public Format Format { get; set; }
        public VectorSource VectorSource { get; set; }
        new public void Init(int distance, double?[] extent, Format format, VectorSource vectorSource)
        {
            Distance = distance;
            Extent = extent;
            Format = format;
            VectorSource = vectorSource;

            Prepare();
        }
        new public void Prepare()
        {
            ClassName = this.GetType().Name;
        }

        new public void Modify()
        {
        }
        //TODO add feature functions
    }
}