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
        public StringParameter SrsName { get; set; }
        public BooleanParameter Surface { get; set; }
        public BooleanParameter Curve { get; set; }
        public BooleanParameter MultiCurve { get; set; }
        public BooleanParameter MultiSurface { get; set; }
        public StringParameter SchemaLocation { get; set; }

        public GMLFormat()
        {
            ClassName.Value = this.GetType().Name;
            ObjectType.Value = "ol.format.GML";

            SrsName = new StringParameter
            {
                Name = "SrsName",
                PropertyName = "srsName",
                Description = "SrsName to use when writing geometries",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true
            };
            Surface = new BooleanParameter
            {
                Name = "Surface",
                PropertyName = "surface",
                Description = "Write gml:Surface instead of gml:Polygon elements. This also affects the elements in multi-part geometries.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                DefaultValue = false,
                IsEditable = false,
                IsVisible = true
            };
            Curve = new BooleanParameter
            {
                Name = "Curve",
                PropertyName = "curve",
                Description = "Write gml:Curve instead of gml:LineString elements. This also affects the elements in multi-part geometries.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                DefaultValue = false,
                IsEditable = false,
                IsVisible = true
            };
            MultiCurve = new BooleanParameter
            {
                Name = "MultiCurve",
                PropertyName = "multiCurve",
                Description = "Write gml:MultiCurve instead of gml:MultiLineString. Since the latter is deprecated in GML 3.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                DefaultValue = false,
                IsEditable = false,
                IsVisible = true
            };
            MultiSurface = new BooleanParameter
            {
                Name = "MultiSurface",
                PropertyName = "multiSurface",
                Description = "Write gml:multiSurface instead of gml:MultiPolygon. Since the latter is deprecated in GML 3.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                DefaultValue = false,
                IsEditable = false,
                IsVisible = true
            };
            SchemaLocation = new StringParameter
            {
                Name = "Schema Location",
                PropertyName = "schemaLocation",
                Description = "Optional schemaLocation to use when writing out the GML, this will override the default provided.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true
            };
        }
    }
}