using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Utility;

namespace GDO.Apps.Maps.Core.Styles
{
    public class RegularShapeStyle : Styles.ImageStyle
    {
        public LinkParameter FillStyleId { get; set; }
        public IntegerParameter Points { get; set; }
        public IntegerParameter Radius { get; set; }
        public NullableIntegerParameter Radius1 { get; set; }
        public NullableIntegerParameter Radius2 { get; set; }
        public IntegerParameter Angle { get; set; }
        public BooleanParameter SnapToPixel { get; set; }
        public LinkParameter StrokeStyleId { get; set; }

        new public void Init(int fillStyleId, float opacity, float rotation, float scale, int points, int radius, int radius1, int radius2, int angle, bool snapToPixel, int strokeStyleId)
        {
            base.Init(opacity, rotation, scale);
            Prepare();
            FillStyleId.Value = fillStyleId;
            Points.Value = points;
            Radius.Value = radius;
            Radius1.Value = radius1;
            Radius2.Value = radius2;
            Angle.Value = angle;
            SnapToPixel.Value = snapToPixel;
            StrokeStyleId.Value = strokeStyleId;
        }
        new public void Prepare()
        {
            base.Prepare();
            ClassName.Value = this.GetType().Name;

            FillStyleId = new LinkParameter
            {
                Name = "Fill Style",
                Description = "Select Fill Style",
                Priority = (int)GDO.Utility.Priorities.Normal,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Datalist,
                IsEditable = false,
                IsVisible = true,
                LinkedParameter = "FillStyle"
            };
            Points = new IntegerParameter
            {
                Name = "Number of Points",
                Description = "Number of Points",
                Priority = (int)GDO.Utility.Priorities.Normal,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Number,
                IsEditable = false,
                IsVisible = true
            };
            Radius = new IntegerParameter
            {
                Name = "Radius",
                Description = "Radius",
                Priority = (int)GDO.Utility.Priorities.Normal,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Number,
                IsEditable = false,
                IsVisible = true
            };
            Radius1 = new NullableIntegerParameter
            {
                Name = "Inner Radius",
                Description = "Inner Radius",
                Priority = (int)GDO.Utility.Priorities.Low,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Number,
                IsEditable = false,
                IsVisible = true
            };
            Radius2 = new NullableIntegerParameter
            {
                Name = "Outer Radius",
                Description = "Outer Radius",
                Priority = (int)GDO.Utility.Priorities.Low,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Number,
                IsEditable = false,
                IsVisible = true
            };
            Angle = new IntegerParameter
            {
                Name = "Angle",
                Description = "Angle in radians",
                Priority = (int)GDO.Utility.Priorities.Low,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Number,
                IsEditable = false,
                IsVisible = true
            };
            SnapToPixel = new BooleanParameter
            {
                Name = "SnapToPixel",
                Description = "Rendering Style",
                Priority = (int)GDO.Utility.Priorities.Low,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Boolean,
                Value = true,
                IsEditable = false,
                IsVisible = true
            };
            StrokeStyleId = new LinkParameter
            {
                Name = "Stroke Style",
                Description = "Select Stroke Style",
                Priority = (int)GDO.Utility.Priorities.Normal,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Datalist,
                IsEditable = false,
                IsVisible = true,
                LinkedParameter = "StrokeStyle"
            };

        }

        new public void Modify(float opacity, float rotation, float scale)
        {
            base.Modify(opacity, rotation, scale);
        }
    }
}