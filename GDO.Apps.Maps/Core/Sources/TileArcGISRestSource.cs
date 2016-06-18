using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Apps.Maps.Core.Sources;
using GDO.Utility;

namespace GDO.Apps.Maps.Core.Sources
{
    public class TileArcGISRestSource : ImageTileSource
    {
        public JSONParameter Params { get; set; }

        public TileArcGISRestSource()
        {
            ClassName.Value = this.GetType().Name;
            ObjectType.Value = "ol.source.TileArcGISRest";
            Description.Value = "Layer source for tile data from ArcGIS Rest services. Map and Image Services are supported.For cached ArcGIS services, better performance is available using the XYZSource.";

            Params = new JSONParameter
            {
                Name = "Parameters",
                PropertyName = "params",
                Description = "ArcGIS Rest parameters. This field is optional. Service defaults will be used for any fields not specified. FORMAT is PNG32 by default. F is IMAGE by default. TRANSPARENT is true by default. BBOX,SIZE,BBOXSR, andIMAGESRwill be set dynamically. SetLAYERS` to override the default service layer visibility",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true,
            };
        }
    }
}