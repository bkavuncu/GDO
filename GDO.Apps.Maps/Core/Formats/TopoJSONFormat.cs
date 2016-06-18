using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Apps.Maps.Core;
using GDO.Utility;

namespace GDO.Apps.Maps.Core.Formats
{
    public class TopoJSONFormat : Format
    {
        public StringParameter DefaultDataProjection { get; set; }

        public TopoJSONFormat()
        {
            ClassName.Value = this.GetType().Name;
            ObjectType.Value = "ol.format.TopoJSON";
            Description.Value = "Feature format for reading data in the TopoJSON format.";

            DefaultDataProjection = new StringParameter
            {
                Name = "Default Data Projection",
                PropertyName = "defaultDataProjection",
                Description = "Default data projection. ",
                Priority = (int)GDO.Utility.Priorities.Required,
                IsEditable = false,
                IsVisible = true,
                DefaultValue = "EPSG:4326",
            };
        }
    }
}