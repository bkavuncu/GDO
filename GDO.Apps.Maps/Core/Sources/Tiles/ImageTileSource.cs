using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core.Sources.Tiles
{
    public class ImageTileSource : TileSource
    {
        public string CrossOrigin { get; set; }
        public TileGrid TileGrid { get; set; }
        public bool Opaque { get; set; }

        new public void Modify(string crossOrigin, TileGrid tileGrid, bool opaque)
        {
            CrossOrigin = crossOrigin;
            TileGrid = tileGrid;
            Opaque = opaque;
        }
    }
}