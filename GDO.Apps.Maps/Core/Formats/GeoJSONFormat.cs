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
        new public void Init(string geometryName)
        {
            GeometryName.Value = geometryName;
            Prepare();
        }
        new public void Prepare()
        {
            base.Prepare();
            ClassName.Value = this.GetType().Name;

            GeometryName = new StringParameter
            {
                Name = "Geometry Name",
                Description = "Geometry Name to use for Feature",
                Priority = (int)GDO.Utility.Priorities.Low,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.String,
                IsEditable = false,
                IsVisible = true
            };
        }

        new public void Modify()
        {
        }
    }
}