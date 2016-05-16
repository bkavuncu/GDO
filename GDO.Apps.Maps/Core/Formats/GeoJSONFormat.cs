﻿using System;
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

        public GeoJSONFormat(int id, string name, int type) : base(id, name, type)
        {
            ClassName.Value = this.GetType().Name;

            GeometryName = new StringParameter
            {
                Name = "Geometry Name",
                Description = "Geometry name to use when creating features.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.String,
                IsEditable = false,
                IsVisible = true
            };

            DefaultDataProjection = new StringParameter
            {
                Name = "Default Data Projection",
                Description = "Default data projection",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.String,
                IsEditable = false,
                IsVisible = true,
                Default = "EPSG:4326"
            };
        }
    }
}