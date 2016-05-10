using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core.Layers
{
    public class TileLayer : Layer
    {
        public int? Preload { get; set; }

        new public void Init(int preload)
        {
            Preload = preload;
            Prepare();
        }
        new public void Prepare()
        {
            base.Prepare();
            
            ClassName = this.GetType().Name;
            AddtoEditables(() => Preload);
        }

        new public void Modify(int preload)
        {
            Preload = preload;
        }
    }
}