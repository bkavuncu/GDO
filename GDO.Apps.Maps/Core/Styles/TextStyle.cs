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
        public StringArrayParameter TextAlign { get; set; }
        public StringArrayParameter TextBaseLine { get; set; }
        public LinkParameter FillStyleId { get; set; }
        public LinkParameter StrokeStyleId { get; set; }

        new public void Init(string font, int offsetX, int offsetY, float scale, float rotation, string content,
            string textAlign, string textBaseLine, int fillStyleId, int strokeStyleId)
        {
            Prepare();
            Font.Value = font;
            OffsetX.Value = offsetX;
            OffsetY.Value = offsetY;
            Scale.Value = scale;
            Rotation.Value = rotation;
            Content.Value = content;
            TextAlign.Value = textAlign;
            TextBaseLine.Value = textBaseLine;
            FillStyleId.Value = fillStyleId;
            StrokeStyleId.Value = strokeStyleId;
        }

        new public void Prepare()
        {
            base.Prepare();
            ClassName.Value = this.GetType().Name;
            Font = new StringParameter
            {
                Name = "Font",
                Description = "Font",
                Priority = (int)GDO.Utility.Priorities.Normal,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.String,
                IsEditable = true,
                IsVisible = true,
                Value = "10px sans-serif"
            };
            OffsetX = new IntegerParameter
            {
                Name = "Offset X",
                Description = "Offset X",
                Priority = (int)GDO.Utility.Priorities.Normal,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Number,
                IsEditable = true,
                IsVisible = true,
                Value = 0,
            };
            OffsetY = new IntegerParameter
            {
                Name = "Offset Y",
                Description = "Offset Y",
                Priority = (int)GDO.Utility.Priorities.Normal,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Number,
                IsEditable = true,
                IsVisible = true,
                Value = 0,
            };
            Scale = new FloatParameter
            {
                Name = "Scale",
                Description = "Scale",
                Priority = (int)GDO.Utility.Priorities.Normal,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Number,
                IsEditable = true,
                IsVisible = true,
                Value = 1,
            };
            Rotation = new FloatParameter
            {
                Name = "Rotation",
                Description = "Rotation",
                Priority = (int)GDO.Utility.Priorities.Normal,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Number,
                IsEditable = true,
                IsVisible = true,
                Value = 0,
            };
            Content = new StringParameter
            {
                Name = "Content",
                Description = "Content",
                Priority = (int)GDO.Utility.Priorities.Normal,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.String,
                IsEditable = true,
                IsVisible = true,
                Value = ""
            };
            TextAlign = new StringArrayParameter
            {
                Name = "Text Align",
                Description = "Text Align",
                Priority = (int)GDO.Utility.Priorities.Normal,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Datalist,
                IsEditable = true,
                IsVisible = true,
                Values = new string[5]{"left","right","center","end","start"},
                Value = "start"
            };
            TextBaseLine = new StringArrayParameter
            {
                Name = "Text Baseline",
                Description = "Text Baseline",
                Priority = (int)GDO.Utility.Priorities.Normal,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Datalist,
                IsEditable = true,
                IsVisible = true,
                Values = new string[6] { "bottom", "top", "middle", "alphabetic", "hanging", "ideographic" },
                Value = "alphabetic"
            };
            FillStyleId = new LinkParameter
            {
                Name = "Fill Style",
                Description = "Select Fill Style",
                Priority = (int)GDO.Utility.Priorities.Normal,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Datalist,
                IsEditable = true,
                IsVisible = true,
                LinkedParameter = "FillStyle"
            };
            StrokeStyleId = new LinkParameter
            {
                Name = "Stroke Style",
                Description = "Select Stroke Style",
                Priority = (int)GDO.Utility.Priorities.Normal,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Datalist,
                IsEditable = true,
                IsVisible = true,
                LinkedParameter = "StrokeStyle"
            };
        }

        new public void Modify(string font, float scale, float rotation, string content,
            string textAlign, string textBaseLine, int fillStyleId, int strokeStyleId)
        {
            Font.Value = font;
            Scale.Value = scale;
            Rotation.Value = rotation;
            Content.Value = content;
            TextAlign.Value = textAlign;
            TextBaseLine.Value = textBaseLine;
            FillStyleId.Value = fillStyleId;
            StrokeStyleId.Value = strokeStyleId;
        }
    }
}