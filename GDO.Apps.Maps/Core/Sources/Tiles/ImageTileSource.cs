using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core.Sources.Tiles
{
    public class ImageTileSource : TileSource
    {
        public TileGrid TileGrid { get; set; }
        public bool Opaque { get; set; }

        new public void Modify(TileGrid tileGrid, bool opaque)
        {
            TileGrid = tileGrid;
            Opaque = opaque;
        }
    }
}