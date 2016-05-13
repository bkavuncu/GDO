using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Core;
using GDO.Utility;

namespace GDO.Apps.Maps.Core.Styles
{
    public class CircleStyle : Styles.ImageStyle
    {
        public LinkParameter FillStyleId { get; set; }
        public IntegerParameter Radius { get; set; }
        public BooleanParameter SnapToPixel { get; set; }
        public LinkParameter StrokeStyleId { get; set; }

        new public void Init(int fillStyleId, float opacity, float rotation, float scale, int radius, bool snapToPixel, int strokeStyleId)
        {
            Prepare();
            base.Init(opacity, rotation, scale);
            FillStyleId.Value = fillStyleId;
            Radius.Value = radius;
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
                IsVisible = true
            };

            Radius = new IntegerParameter
            {
                Name = "Radius",
                Description = "Radius of the circle",
                Priority = (int)GDO.Utility.Priorities.High,
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
                IsVisible = true
            };
        }


        new public void Modify( float opacity, float rotation, float scale)
        {
            base.Modify(opacity, rotation, scale);
        }
    }
}