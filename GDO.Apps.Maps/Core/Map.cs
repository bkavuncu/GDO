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
        public Position Position { get; set; }
        public View[] Views { get; set; }
        public Data[] Datas { get; set; }
        public Format[] Formats { get; set; }
        public Style[] Styles { get; set; }
        public Source[] Sources { get; set; }
        public Layer[] Layers { get; set; }


        public Map(Position position, View[] views,  Data[] datas, Format[] formats, Style[] styles, Source[] sources, Layer[] layers)
        {
            Position = position;
            Views = views;
            Datas = datas;
            Formats = formats;
            Styles = styles;
            Sources = sources;
            Layers = layers;
        }
    }
}