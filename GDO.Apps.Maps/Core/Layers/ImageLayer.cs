using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core.Layers
{
    public class ImageLayer : Layer
    {
        public ImageLayer(int id, string name, int type, int sourceId) : base(id, name, type, sourceId)
        {
            ClassName.Value = this.GetType().Name;
        }
    }
}