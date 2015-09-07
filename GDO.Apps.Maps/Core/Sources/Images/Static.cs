using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core.Sources.Images
{
    public class Static : Image
    {
        public int Width { get; set; }
        public int Height { get; set; }
        public string URL { get; set; }
        public Extent Extent { get; set; }
    }
}