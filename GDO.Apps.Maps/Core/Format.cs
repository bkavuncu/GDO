using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core
{
    public abstract class Format : Base
    {
        public Format() : base ()
        {
            ClassName.Value = this.GetType().Name;
        }
    }
}