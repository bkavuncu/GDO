using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core.Sources
{
    public class Vector : Source
    {
        public Dictionary<int,Feature> Features { get; set; }
    }
}