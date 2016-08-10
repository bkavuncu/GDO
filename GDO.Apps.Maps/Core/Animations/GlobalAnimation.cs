using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Utility;

namespace GDO.Apps.Maps.Core.Animations
{
    public class GlobalAnimation : Animation
    {
        public GlobalAnimation()
        {
            ClassName.Value = this.GetType().Name;
            Description.Value = "Global Animation that plays animation of all layers.";
        }
    }
}