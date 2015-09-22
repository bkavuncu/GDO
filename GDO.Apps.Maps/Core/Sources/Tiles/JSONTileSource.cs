using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core.Sources.Tiles
{
    public class JSONTileSource : TileSource
    {
        public string Url { get; set; }
        public string CrossOrigin { get; set; }

        new public void Modify(string url, string crossOrigin)
        {
            Url = url;
            CrossOrigin = crossOrigin;
        }
    }
}