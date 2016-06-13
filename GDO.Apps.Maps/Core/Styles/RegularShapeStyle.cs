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
        public NullableIntegerParameter Radius { get; set; }
        public NullableIntegerParameter Radius1 { get; set; }
        public NullableIntegerParameter Radius2 { get; set; }
        public IntegerParameter Angle { get; set; }
        public BooleanParameter SnapToPixel { get; set; }
        public LinkParameter StrokeStyle { get; set; }

        public RegularShapeStyle()
        {
            ClassName.Value = this.GetType().Name;
            Type.Value = (int)StyleTypes.RegularShape;

            FillStyle = new LinkParameter
            {
                Name = "Fill Style",
                Description = "Select Fill Style",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Datalist,
                IsEditable = false,
                IsVisible = true,
                LinkedParameter = "FillStyle"
            };
            Points = new IntegerParameter
            {
                Name = "Number of Points",
                Description = "Number of points for stars and regular polygons. In case of a polygon, the number of points is the number of sides.",
                Priority = (int)GDO.Utility.Priorities.Required,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Integer,
                IsEditable = false,
                IsVisible = true
            };
            Radius = new NullableIntegerParameter
            {
                Name = "Radius",
                Description = "Radius of a regular polygon.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Integer,
                IsEditable = false,
                IsVisible = true
            };
            Radius1 = new NullableIntegerParameter
            {
                Name = "Inner Radius",
                Description = "Inner radius of a star.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Integer,
                IsEditable = false,
                IsVisible = true
            };
            Radius2 = new NullableIntegerParameter
            {
                Name = "Outer Radius",
                Description = "Outer Radius of a star",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Integer,
                IsEditable = false,
                IsVisible = true
            };
            Angle = new IntegerParameter
            {
                Name = "Angle",
                Description = "Shape's angle in radians. A value of 0 will have one of the shape's point facing up.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Integer,
                IsEditable = false,
                IsVisible = true,
                DefaultValue = 0
            };
            SnapToPixel = new BooleanParameter
            {
                Name = "SnapToPixel",
                Description = "If true integral numbers of pixels are used as the X and Y pixel coordinate when drawing the shape in the output canvas. If false fractional numbers may be used. Using true allows for sharp rendering (no blur), while using false allows for accurate rendering. Note that accuracy is important if the shape's position is animated. Without it, the shape may jitter noticeably. ",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Boolean,
                DefaultValue = true,
                IsEditable = false,
                IsVisible = true
            };
            StrokeStyle = new LinkParameter
            {
                Name = "Stroke Style",
                Description = "Select Stroke Style",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Datalist,
                IsEditable = false,
                IsVisible = true,
                LinkedParameter = "StrokeStyle"
            };
        }
    }
}