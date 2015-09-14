using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core.Layers
{
    public class Tile : Layer
    {
        public int Preload { get; set; }

        new public void Init(int preload)
        {
            Preload = preload;
        }
    }
}