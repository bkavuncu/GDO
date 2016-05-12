using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Apps.Maps.Core;
using GDO.Utility;

namespace GDO.Apps.Maps.Core.Formats
{
    public class GMLFormat : Format
    {
        public IntegerArrayParameter GMLVersion { get; set; }
        public StringParameter SrsName { get; set; }
        public BooleanParameter Surface { get; set; }
        public BooleanParameter Curve { get; set; }
        public BooleanParameter MultiCurve { get; set; }
        public BooleanParameter MultiSurface { get; set; }
        public StringParameter SchemaLocation { get; set; }

        new public void Init(int gmlVersion, string srsName, bool surface,
            bool curve, bool multiCurve, bool multiSurface, string schemaLocation)
        {
            Prepare();
            GMLVersion.Value = gmlVersion;
            SrsName.Value = srsName;
            Surface.Value = surface;
            Curve.Value = curve;
            MultiCurve.Value = multiCurve;
            MultiSurface.Value = multiSurface;
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
                Values = new int[3] {1,2,3},
                IsEditable = false,
                IsVisible = true
            };
            SrsName = new StringParameter
            {
                Name = "SrsName",
                Description = "SrsName",
                Priority = (int) GDO.Utility.Priorities.Low,
                VisualisationType = (int) GDO.Utility.VisualisationTypes.String,
                IsEditable = false,
                IsVisible = true
            };
            Surface = new BooleanParameter
            {
                Name = "Surface",
                Description = "gml.Surface instead of gml.Polygon",
                Priority = (int)GDO.Utility.Priorities.Low,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Boolean,
                Value = false,
                IsEditable = false,
                IsVisible = true
            };
            Curve = new BooleanParameter
            {
                Name = "Curve",
                Description = "gml.Curve instead of gml.LineString",
                Priority = (int)GDO.Utility.Priorities.Low,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Boolean,
                Value = false,
                IsEditable = false,
                IsVisible = true
            };
            MultiCurve = new BooleanParameter
            {
                Name = "MultiCurve",
                Description = "gml.MultiCurve instead of gml.MultiLineString",
                Priority = (int)GDO.Utility.Priorities.Low,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Boolean,
                Value = false,
                IsEditable = false,
                IsVisible = true
            };
            MultiSurface = new BooleanParameter
            {
                Name = "MultiSurface",
                Description = "gml.MultiSurface instead of gml.Polygon",
                Priority = (int)GDO.Utility.Priorities.Low,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Boolean,
                Value = false,
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