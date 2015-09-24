using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Apps.Maps.Core.Sources.Tiles;

namespace GDO.Apps.Maps.Core.Sources
{
    public class XYZSource : ImageTileSource
    {
        public string Projection { get; set; }
        public string Url { get; set; }

        new public void Modify(string crossOrigin, TileGrid tileGrid, bool opaque, string projection, string url)
        {
            CrossOrigin = crossOrigin;
            TileGrid = tileGrid;
            Opaque = opaque;
            Projection = projection;
            Url = url;
        }
    }
}