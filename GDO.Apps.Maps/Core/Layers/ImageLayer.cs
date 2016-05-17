using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core.Layers
{
    public class ImageLayer : Layer
    {
        public ImageLayer()
        {
            ClassName.Value = this.GetType().Name;
        }
    }
}