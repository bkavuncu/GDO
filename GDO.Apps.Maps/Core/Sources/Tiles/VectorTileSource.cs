using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core.Sources.Tiles
{
    public class VectorTileSource : TileSource
    {
        public TileGrid TileGrid { get; set; }
        public string Url { get; set; }
        public string[] Urls { get; set; }

        new public void Modify(TileGrid tileGrid, string url, string[] urls)
        {
            TileGrid = tileGrid;
            Url = url;
            Urls = urls;
        }
    }
}