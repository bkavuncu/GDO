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
            Type.Value = (int)FormatTypes.TopoJSON;

            DefaultDataProjection = new StringParameter
            {
                Name = "Default Data Projection",
                Description = "Default data projection. ",
                Priority = (int)GDO.Utility.Priorities.Required,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.String,
                IsEditable = false,
                IsVisible = true,
                DefaultValue = "EPSG:4326",
            };
        }
    }
}