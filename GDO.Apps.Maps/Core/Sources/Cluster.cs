using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core.Sources
{
    public class Cluster : Source
    {
        public int Distance { get; set; }
        public Extent Extent { get; set; }
        public Source Source { get; set; }
    }
}