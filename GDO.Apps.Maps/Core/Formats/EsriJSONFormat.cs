using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Apps.Maps.Core;
using GDO.Utility;

namespace GDO.Apps.Maps.Core.Formats
{
    public class EsriJSONFormat : Format
    {
        public StringParameter GeometryName { get; set; }

        public EsriJSONFormat()
        {
            ClassName.Value = this.GetType().Name;
            ObjectType.Value = "ol.format.EsriJSON";

            GeometryName = new StringParameter
            {
                Name = "Geometry Name",
                PropertyName = "geometryName",
                Description = "Geometry name to use when creating features.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true
            };
        }
    }
}