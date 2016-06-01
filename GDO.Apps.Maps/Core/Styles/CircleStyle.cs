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
        public LinkParameter FillStyle { get; set; }
        public IntegerParameter Radius { get; set; }
        public BooleanParameter SnapToPixel { get; set; }
        public LinkParameter StrokeStyle { get; set; }

        public CircleStyle()
        {
            ClassName.Value = this.GetType().Name;
            ObjectType.Value = "ol.style.Circle";

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

            Radius = new IntegerParameter
            {
                Name = "Radius",
                PropertyName = "radius",
                Description = "Radius of the circle",
                Priority = (int)GDO.Utility.Priorities.Required,
                IsEditable = false,
                IsVisible = true
            };

            SnapToPixel = new BooleanParameter
            {
                Name = "SnapToPixel",
                PropertyName = "snapToPixel",
                Description = "If true integral numbers of pixels are used as the X and Y pixel coordinate when drawing the circle in the output canvas. If false fractional numbers may be used. Using true allows for sharp rendering (no blur), while using false allows for accurate rendering. Note that accuracy is important if the circle's position is animated. Without it, the circle may jitter noticeably. ",
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