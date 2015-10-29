using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.SmartCity.Core.Sources.Tiles
{
    public class JSONTileSource : TileSource
    {
        public string Url { get; set; }
        public string CrossOrigin { get; set; }

        new public void Init(string url, string crossOrigin)
        {
            Url = url;
            CrossOrigin = crossOrigin;

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