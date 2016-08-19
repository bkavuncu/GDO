using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mime;
using System.Web;
using GDO.Utility;

namespace GDO.Apps.Maps.Core.Styles
{
    public class GeoJSONStyle : Core.Style
    {
        public LinkParameter PointStyle { get; set; }
        public LinkParameter CircleStyle { get; set; }
        public LinkParameter MultiPointStyle { get; set; }
        public LinkParameter LineStringStyle { get; set; }
        public LinkParameter MultiLineStringStyle { get; set; }
        public LinkParameter PolygonStyle { get; set; }
        public LinkParameter MultiPolygonStyle { get; set; }

        public GeoJSONStyle()
        {
            ClassName.Value = this.GetType().Name;
            Description.Value = "Container for vector feature rendering styles for GeoJSON. ";

            PointStyle = new LinkParameter
            {
                Name = "Point Style",
                Description = "Select Point Style",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsProperty = false,
                IsEditable = false,
                IsVisible = true,
                LinkedParameter = "styles",
                ClassTypes = new string[1] { "Style" },
            };

            CircleStyle = new LinkParameter
            {
                Name = "Circle Style",
                Description = "Select Circle Style",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsProperty = false,
                IsEditable = false,
                IsVisible = true,
                LinkedParameter = "styles",
                ClassTypes = new string[1] { "Style" },
            };

            MultiPointStyle = new LinkParameter
            {
                Name = "Multi Point Style",
                Description = "Select MultiPoint Style",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsProperty = false,
                IsEditable = false,
                IsVisible = true,
                LinkedParameter = "styles",
                ClassTypes = new string[1] { "Style" },
            };

            LineStringStyle = new LinkParameter
            {
                Name = "LineString Style",
                Description = "Select LineString Style",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsProperty = false,
                IsEditable = false,
                IsVisible = true,
                LinkedParameter = "styles",
                ClassTypes = new string[1] { "Style" },
            };

            LineStringStyle = new LinkParameter
            {
                Name = "LineString Style",
                Description = "Select LineString Style",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsProperty = false,
                IsEditable = false,
                IsVisible = true,
                LinkedParameter = "styles",
                ClassTypes = new string[1] { "Style" },
            };

            MultiLineStringStyle = new LinkParameter
            {
                Name = "MultiLineString Style",
                Description = "Select MultiLineString Style",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsProperty = false,
                IsEditable = false,
                IsVisible = true,
                LinkedParameter = "styles",
                ClassTypes = new string[1] { "Style" },
            };

            PolygonStyle = new LinkParameter
            {
                Name = "Polygon Style",
                Description = "Select Polygon Style",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsProperty = false,
                IsEditable = false,
                IsVisible = true,
                LinkedParameter = "styles",
                ClassTypes = new string[1] { "Style" },
            };

            MultiPolygonStyle = new LinkParameter
            {
                Name = "MultiPolygon Style",
                Description = "Select MultiPolygon Style",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsProperty = false,
                IsEditable = false,
                IsVisible = true,
                LinkedParameter = "styles",
                ClassTypes = new string[1] { "Style" },
            };
        }
    }
}