using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core
{
    public class Source : Base
    {
        public Source()
        {
            ClassName.Value = this.GetType().Name;
        }
    }
}