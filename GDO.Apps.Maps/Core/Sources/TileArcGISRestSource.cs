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
        public StringParameter Params { get; set; }

        public TileArcGISRestSource()
        {
            ClassName.Value = this.GetType().Name;
            Type.Value = (int)SourceTypes.TileArcGISRest;

            Params = new StringParameter
            {
                Name = "Parameters",
                Description = "ArcGIS Rest parameters. This field is optional. Service defaults will be used for any fields not specified. FORMAT is PNG32 by default. F is IMAGE by default. TRANSPARENT is true by default. BBOX,SIZE,BBOXSR, andIMAGESRwill be set dynamically. SetLAYERS` to override the default service layer visibility",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.JSON,
                IsEditable = false,
                IsVisible = true,
            };
        }
    }
}