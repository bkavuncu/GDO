using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core.Layers
{
    public class ImageLayer : Layer
    {
        new public void Init()
        {
            Prepare();
        }
        new public void Prepare()
        {
            base.Prepare();
            ClassName.Value = this.GetType().Name;
        }
        new public void Modify()
        { 

        }
    }
}