using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core.Sources.Tiles
{
    public class TileJSON : TileSource
    {
        public string Url { get; set; }

        new public void Modify(string url)
        {
            Url = url;
        }
    }
}