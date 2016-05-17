using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Apps.Maps.Core.Sources;

namespace GDO.Apps.Maps.Core.Sources
{
    public class XYZSource : ImageTileSource
    {
        public XYZSource()
        {
            ClassName.Value = this.GetType().Name;
        }
    }
}