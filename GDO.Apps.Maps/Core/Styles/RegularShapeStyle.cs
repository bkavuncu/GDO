using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Utility;

namespace GDO.Apps.Maps.Core.Styles
{
    public class RegularShapeStyle : Styles.ImageStyle
    {
        public LinkParameter FillStyle { get; set; }
        public IntegerParameter Points { get; set; }
        public IntegerParameter Radius { get; set; }
        public IntegerParameter Radius1 { get; set; }
        public IntegerParameter Radius2 { get; set; }
        public IntegerParameter Angle { get; set; }
        public BooleanParameter SnapToPixel { get; set; }
        public LinkParameter StrokeStyle { get; set; }

        public RegularShapeStyle()
        {
            ClassName.Value = this.GetType().Name;
            ObjectType.Value = "ol.style.RegularShape";

            FillStyle = new LinkParameter
            {
                Name = "Fill Style",
                PropertyName = "fill",
                Description = "Select Fill Style",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true,
                LinkedParameter = "styles",
                ObjectType = "ol.style.Fill",
            };
            Points = new IntegerParameter
            {
                Name = "Number of Points",
                PropertyName = "points",
                Description = "Number of points for stars and regular polygons. In case of a polygon, the number of points is the number of sides.",
                Priority = (int)GDO.Utility.Priorities.Required,
                IsEditable = false,
                IsVisible = true,
                Increment = 1,
            };
            Radius = new IntegerParameter
            {
                Name = "Radius",
                PropertyName = "radius",
                Description = "Radius of a regular polygon.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true,
                Increment = 1,
            };
            Radius1 = new IntegerParameter
            {
                Name = "Inner Radius",
                PropertyName = "radius1",
                Description = "Inner radius of a star.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true,
                Increment = 1,
            };
            Radius2 = new IntegerParameter
            {
                Name = "Outer Radius",
                PropertyName = "radius2",
                Description = "Outer Radius of a star",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true,
                Increment = 1,
            };
            Angle = new IntegerParameter
            {
                Name = "Angle",
                PropertyName = "angle",
                Description = "Shape's angle in radians. A value of 0 will have one of the shape's point facing up.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true,
                DefaultValue = 0,
                Increment = 1,
            };
            SnapToPixel = new BooleanParameter
            {
                Name = "SnapToPixel",
                PropertyName = "snapToPixel",
                Description = "If true integral numbers of pixels are used as the X and Y pixel coordinate when drawing the shape in the output canvas. If false fractional numbers may be used. Using true allows for sharp rendering (no blur), while using false allows for accurate rendering. Note that accuracy is important if the shape's position is animated. Without it, the shape may jitter noticeably. ",
                Priority = (int)GDO.Utility.Priorities.Optional,
                DefaultValue = true,
                IsEditable = false,
                IsVisible = true
            };
            StrokeStyle = new LinkParameter
            {
                Name = "Stroke Style",
                PropertyName = "stroke",
                Description = "Select Stroke Style",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true,
                LinkedParameter = "styles",
                ObjectType = "ol.style.Stroke",
            };
        }
    }
}