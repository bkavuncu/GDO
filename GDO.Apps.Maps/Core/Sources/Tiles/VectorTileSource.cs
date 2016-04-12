using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core.Sources.Tiles
{
    public class VectorTileSource : TileSource
    {
        public TileGrid TileGrid { get; set; }
        public int FormatId { get; set; }
        public string Projection { get; set; }
        public string Url { get; set; }

        new public void Init(TileGrid tileGrid, int formatId, string projection, string url)
        {
            TileGrid = tileGrid;
            FormatId = formatId;
            Projection = projection;
            Url = url;

            Prepare();
        }
        new public void Prepare()
        {
            base.Prepare();
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