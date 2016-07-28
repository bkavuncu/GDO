using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Utility;

namespace GDO.Apps.Maps.Core.Styles
{
    public class TextStyle : Core.Style
    {
        public StringParameter Font { get; set; }
        public IntegerParameter OffsetX { get; set; }
        public IntegerParameter OffsetY { get; set; }
        public FloatParameter Scale { get; set; }
        public FloatParameter Rotation { get; set; }
        public StringParameter Content { get; set; }
        public DatalistParameter TextAlign { get; set; }
        public DatalistParameter TextBaseLine { get; set; }
        public LinkParameter FillStyle { get; set; }
        public LinkParameter StrokeStyle { get; set; }

        public TextStyle()
        {
            ClassName.Value = this.GetType().Name;
            ObjectType.Value = "ol.style.Text";
            Description.Value = "Set text style for vector features.";

            Font = new StringParameter
            {
                Name = "Font",
                PropertyName = "font",
                Description = "Font style as CSS 'font' value",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = true,
                DefaultValue = "10px sans-serif"
            };
            OffsetX = new IntegerParameter
            {
                Name = "Offset X",
                PropertyName = "offsetX",
                Description = "Horizontal text offset in pixels. A positive will shift the text right.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = true,
                DefaultValue = 0,
                Increment = 1,
            };
            OffsetY = new IntegerParameter
            {
                Name = "Offset Y",
                PropertyName = "offsetY",
                Description = "Vertical text offset in pixels. A positive will shift the text down.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = true,
                DefaultValue = 0,
                Increment = 1,
            };
            Scale = new FloatParameter
            {
                Name = "Scale",
                PropertyName = "scale",
                Description = "Scale",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = true,
                DefaultValue = 1,
                Increment = (float)0.1,
            };
            Rotation = new FloatParameter
            {
                Name = "Rotation",
                PropertyName = "rotation",
                Description = "Rotation in radians",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = true,
                DefaultValue = 0,
                Increment = (float)0.1,
            };
            Content = new StringParameter
            {
                Name = "Content",
                PropertyName = "text",
                Description = "Text Content",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = true,
                DefaultValue = ""
            };
            TextAlign = new DatalistParameter
            {
                Name = "Text Align",
                PropertyName = "textAlign",
                Description = "Text Alignment",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = true,
                DefaultValues = new string[5] { "left", "right", "center", "end", "start" },
                DefaultValue = "start"
            };
            TextBaseLine = new DatalistParameter
            {
                Name = "Text Baseline",
                PropertyName = "textBaseline",
                Description = "Text Baseline",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = true,
                DefaultValues = new string[6] { "bottom", "top", "middle", "alphabetic", "hanging", "ideographic" },
                DefaultValue = "alphabetic"
            };
            FillStyle = new LinkParameter
            {
                Name = "Fill Style",
                PropertyName = "fill",
                Description = "Select Fill Style",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = true,
                LinkedParameter = "styles",
                ClassTypes = new string[1] { "FillStyle" },
            };
            StrokeStyle = new LinkParameter
            {
                Name = "Stroke Style",
                PropertyName = "stroke",
                Description = "Select Stroke Style",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = true,
                LinkedParameter = "styles",
                ClassTypes = new string[1] { "StrokeStyle" },
            };
        }
    }
}