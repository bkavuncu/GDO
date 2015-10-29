using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Utility;

namespace GDO.Apps.SmartCity.Core
{
    public class Map
    {
        public View View { get; set; }
        public Format[] Formats { get; set; }
        public Style[] Styles { get; set; }
        public Source[] Sources { get; set; }
        public Layer[] Layers { get; set; }


        public Map(View view, Format[] formats, Style[] styles, Source[] sources, Layer[] layers)
        {
            View = view;
            Formats = formats;
            Styles = styles;
            Sources = sources;
            Layers = layers;
        }
    }
}