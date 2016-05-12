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

        new public void Init(int gmlVersion, string schemaLocation)
        {
            Prepare();
            GMLVersion.Value = gmlVersion;
            SchemaLocation.Value = schemaLocation;
        }
        new public void Prepare()
        {
            base.Prepare();
            ClassName.Value = this.GetType().Name;
            GMLVersion = new IntegerArrayParameter
            {
                Name = "GML Version",
                Description = "GML Version",
                Priority = (int)GDO.Utility.Priorities.Normal,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Datalist,
                Values = new int[3] { 1, 2, 3 },
                IsEditable = false,
                IsVisible = true
            };
            SchemaLocation = new StringParameter
            {
                Name = "Schema Location",
                Description = "Optional Schema Location",
                Priority = (int)GDO.Utility.Priorities.Low,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Boolean,
                IsEditable = false,
                IsVisible = true
            };

        }

        new public void Modify()
        {
        }
    }
}