using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Apps.Maps.Core.Styles;

namespace GDO.Apps.Maps.Core
{
    public abstract class Style : Base
    {
        public Style () : base ()
        {
            ClassName.Value = this.GetType().Name;
        }
    }
}