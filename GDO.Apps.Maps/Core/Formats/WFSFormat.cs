using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Apps.Maps.Core;
using GDO.Utility;

namespace GDO.Apps.Maps.Core.Formats
{
    public class WFSFormat : Format
    {
        public IntegerArrayParameter GMLVersion { get; set; }
        public StringParameter SchemaLocation { get; set; }

        public WFSFormat()
        {
            ClassName.Value = this.GetType().Name;

            GMLVersion = new IntegerArrayParameter
            {
                Name = "GML Version",
                Description = "GML Version",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Datalist,
                DefaultValues = new int[3] { 1, 2, 3 },
                IsEditable = false,
                IsVisible = true
            };
            SchemaLocation = new StringParameter
            {
                Name = "Schema Location",
                Description = "Optional schemaLocation to use for serialization, this will override the default.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Boolean,
                IsEditable = false,
                IsVisible = true
            };
        }
    }
}