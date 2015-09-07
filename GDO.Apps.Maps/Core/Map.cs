using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core
{
    public class Map
    {
        public Dictionary<int, Layer> Layers { get; set; }
        public Dictionary<int, Interaction> Interactions { get; set; }
        public Dictionary<int, Control> Controls { get; set; }
        public View View { get; set; }
    }
}