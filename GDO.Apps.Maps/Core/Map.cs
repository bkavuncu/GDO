using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Utility;

namespace GDO.Apps.Maps.Core
{
    public class Map
    {
        public GenericDictionary<Layer> Layers { get; set; }
        public GenericDictionary<View> Views { get; set; }
        public GenericDictionary<Interaction> Interactions { get; set; }
        public GenericDictionary<Source> Sources { get; set; }
        public GenericDictionary<Control> Controls { get; set; }
        public GenericDictionary<Style> Styles { get; set; }
        public View View { get; set; }
        public int width { get; set; }
        public int height { get; set; }

    }
}