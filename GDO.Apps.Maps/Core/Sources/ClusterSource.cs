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
        public Format Format { get; set; }
        public VectorSource VectorSource { get; set; }
        new public void Modify(int distance, Extent extent, Format format, VectorSource vectorSource)
        {
            Distance = distance;
            Extent = extent;
            Format = format;
            VectorSource = vectorSource;
        }
    }
}