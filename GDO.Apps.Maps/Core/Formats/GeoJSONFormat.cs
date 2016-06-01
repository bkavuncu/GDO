using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Apps.Maps.Core;
using GDO.Utility;

namespace GDO.Apps.Maps.Core.Formats
{
    public class GeoJSONFormat : Format
    {
        public StringParameter GeometryName { get; set; }
        public StringParameter DefaultDataProjection { get; set; }

        public GeoJSONFormat()
        {
            ClassName.Value = this.GetType().Name;
            ObjectType.Value = "ol.format.GeoJSON";

            GeometryName = new StringParameter
            {
                Name = "Geometry Name",
                PropertyName = "geometryName",
                Description = "Geometry name to use when creating features.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true
            };

            DefaultDataProjection = new StringParameter
            {
                Name = "Default Data Projection",
                PropertyName = "defaultDataProjection",
                Description = "Default data projection",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true,
                DefaultValue = "EPSG:4326"
            };
        }
    }
}