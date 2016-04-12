using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Apps.Maps.Core.Sources.Tiles;

namespace GDO.Apps.Maps.Core.Sources
{
    public class StamenSource : XYZSource
    {
        public string Layer { get; set; }
        new public void Init(string crossOrigin, TileGrid tileGrid, bool opaque, string projection, string url, string layer)
        {
            Layer = layer;
            CrossOrigin = crossOrigin;
            Opaque = opaque;
            Projection = projection;
            TileGrid = tileGrid;
            Url = url;

            Prepare();
        }
        new public void Prepare()
        {
            base.Prepare();
            ClassName = this.GetType().Name;
            AddtoEditables(() => Url);
        }

        new public void Modify(string url)
        {
            Url = url;
        }
    }
}