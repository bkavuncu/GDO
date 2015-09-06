using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.SmartCity.Core.Sources.Tiles
{
    public class ImageTileSource : TileSource
    {
        public string CrossOrigin { get; set; }
        public TileGrid TileGrid { get; set; }
        public bool? Opaque { get; set; }
        public string Projection { get; set; }

        new public void Init(string crossOrigin, TileGrid tileGrid, bool opaque, string projection)
        {
            CrossOrigin = crossOrigin;
            TileGrid = tileGrid;
            Opaque = opaque;
            Projection = projection;

            Prepare();
        }

        new public void Prepare()
        {
            ClassName = this.GetType().Name;
        }

        new public void Modify()
        {
        }
    }
}