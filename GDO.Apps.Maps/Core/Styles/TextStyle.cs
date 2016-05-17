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
        public NullableIntegerParameter OffsetX { get; set; }
        public NullableIntegerParameter OffsetY { get; set; }
        public FloatParameter Scale { get; set; }
        public FloatParameter Rotation { get; set; }
        public StringParameter Content { get; set; }
        public StringArrayParameter TextAlign { get; set; }
        public StringArrayParameter TextBaseLine { get; set; }
        public LinkParameter FillStyle { get; set; }
        public LinkParameter StrokeStyle { get; set; }

        public TextStyle()
        {
            ClassName.Value = this.GetType().Name;
            Type.Value = (int)StyleTypes.Text;

            Font = new StringParameter
            {
                Name = "Font",
                Description = "Font style as CSS 'font' value",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.String,
                IsEditable = true,
                IsVisible = true,
                DefaultValue = "10px sans-serif"
            };
            OffsetX = new NullableIntegerParameter
            {
                Name = "Offset X",
                Description = "Horizontal text offset in pixels. A positive will shift the text right.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Integer,
                IsEditable = true,
                IsVisible = true,
                DefaultValue = 0,
            };
            OffsetY = new NullableIntegerParameter
            {
                Name = "Offset Y",
                Description = "Vertical text offset in pixels. A positive will shift the text down.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Integer,
                IsEditable = true,
                IsVisible = true,
                DefaultValue = 0,
            };
            Scale = new FloatParameter
            {
                Name = "Scale",
                Description = "Scale",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Float,
                IsEditable = true,
                IsVisible = true,
                DefaultValue = 1,
            };
            Rotation = new FloatParameter
            {
                Name = "Rotation",
                Description = "Rotation in radians",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Float,
                IsEditable = true,
                IsVisible = true,
                DefaultValue = 0,
            };
            Content = new StringParameter
            {
                Name = "Content",
                Description = "Text Content",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.String,
                IsEditable = true,
                IsVisible = true,
                DefaultValue = ""
            };
            TextAlign = new StringArrayParameter
            {
                Name = "Text Align",
                Description = "Text Alignment",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Datalist,
                IsEditable = true,
                IsVisible = true,
                DefaultValues = new string[5] { "left", "right", "center", "end", "start" },
                DefaultValue = "start"
            };
            TextBaseLine = new StringArrayParameter
            {
                Name = "Text Baseline",
                Description = "Text Baseline",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Datalist,
                IsEditable = true,
                IsVisible = true,
                DefaultValues = new string[6] { "bottom", "top", "middle", "alphabetic", "hanging", "ideographic" },
                DefaultValue = "alphabetic"
            };
            FillStyle = new LinkParameter
            {
                Name = "Fill Style",
                Description = "Select Fill Style",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Datalist,
                IsEditable = true,
                IsVisible = true,
                LinkedParameter = "FillStyle"
            };
            StrokeStyle = new LinkParameter
            {
                Name = "Stroke Style",
                Description = "Select Stroke Style",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Datalist,
                IsEditable = true,
                IsVisible = true,
                LinkedParameter = "StrokeStyle"
            };
        }
    }
}