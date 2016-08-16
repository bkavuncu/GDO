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
            ObjectType.Value = "ol.source.XYZ";
            Description.Value = "Layer source for tile data with URLs in a set XYZ format that are defined in a URL template. By default, this follows the widely-used Google grid where x 0 and y 0 are in the top left. Grids like TMS where x 0 and y 0 are in the bottom left can be used by using the {-y} placeholder in the URL template, so long as the source does not have a custom tile grid. ";
        }
    }
}