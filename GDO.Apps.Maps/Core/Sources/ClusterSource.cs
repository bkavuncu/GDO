using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core.Sources
{
    public class ClusterSource : Source
    {
        public int Distance { get; set; }
        public Extent Extent { get; set; }
        public VectorSource VectorSource { get; set; }
        new public void Modify(int distance, Extent extent, VectorSource vectorSource)
        {
            Distance = distance;
            Extent = extent;
            VectorSource = vectorSource;
        }
    }
}