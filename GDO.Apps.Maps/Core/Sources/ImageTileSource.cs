using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core.Sources.Tiles
{
    public class ImageTileSource : Source
    {
        public string CrossOrigin { get; set; }
        public bool? Opaque { get; set; }
        public string Projection { get; set; }

        new public void Init(string crossOrigin, bool opaque, string projection)
        {
            CrossOrigin = crossOrigin;
            Opaque = opaque;
            Projection = projection;

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
    }
}