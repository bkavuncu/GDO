using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core.Sources.Tiles
{
    public class TileImage : TileSource
    {
        public bool Opaque { get; set; }
        //TODO find representaion for functions in this class

        new public void Modify(bool opaque)
        {
            Opaque = opaque;
        }
    }
}