using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core.Sources
{
    public class BingMaps : Source
    {
        public string Culture { get; set; }
        public string Key { get; set; }
        public string ImagerySet { get; set; }
    }
}