using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core.Sources.Tiles
{
    public class VectorTileSource : TileSource
    {
        public TileGrid TileGrid { get; set; }
        public Format Format { get; set; }
        public string Projection { get; set; }
        public string Url { get; set; }

        new public void Init(TileGrid tileGrid, Format format, string projection, string url)
        {
            TileGrid = tileGrid;
            Format = format;
            Projection = projection;
            Url = url;

            Prepare();
        }
        new public void Prepare()
        {
            ClassName = this.GetType().Name;
        }

        new public void Modify()
        {
        }

        public void AddFeature()
        {
            
        }

        public void ClearFeatures()
        {
            
        }
    }
}