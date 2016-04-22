using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core.Sources.Tiles
{
    public class TileGrid
    {
        public double[] Extent { get; set; }
        public int? MinZoom { get; set; }
        public int? MaxZoom { get; set; }
        public int? TileWidth { get; set; }
        public int? TileHeight { get; set; }
        public float?[] Resolutions { get; set; }

        public TileGrid(double[] extent, int minZoom, int maxZoom, int tileWidth,  int tileHeight, float?[] resolutions)
        {
            Extent = extent;
            MinZoom = minZoom;
            MaxZoom = maxZoom;
            TileWidth = tileWidth;
            TileHeight = tileHeight;
            Resolutions = resolutions;
        }
    }
}