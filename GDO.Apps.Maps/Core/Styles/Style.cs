using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mime;
using System.Web;
using GDO.Utility;

namespace GDO.Apps.Maps.Core.Styles
{
    public class Style : Core.Style
    {
        public LinkParameter FillStyleId { get; set; }
        public LinkParameter ImageStyleId { get; set; }
        public LinkParameter StrokeStyleId { get; set; }
        public LinkParameter TextStyleId { get; set; }
        public NullableIntegerParameter ZIndex { get; set; }

        new public void Init(int? fillStyleId, int? imageStyleId, int? strokeStyleId, int? textStyleId, int? zIndex)
        {
            Prepare();
            FillStyleId.Value = fillStyleId;
            ImageStyleId.Value = imageStyleId;
            StrokeStyleId.Value = strokeStyleId;
            TextStyleId.Value = textStyleId;
            ZIndex.Value = zIndex;

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
                IsEditable = true,
                IsVisible = true,
                LinkedParameter = "FillStyle"
            };
            ImageStyleId = new LinkParameter
            {
                Name = "Image Style",
                Description = "Select Image Style",
                Priority = (int)GDO.Utility.Priorities.Normal,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Datalist,
                IsEditable = true,
                IsVisible = true,
                LinkedParameter = "ImageStyle"
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
            TextStyleId = new LinkParameter
            {
                Name = "Text Style",
                Description = "Select Text Style",
                Priority = (int)GDO.Utility.Priorities.Normal,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Datalist,
                IsEditable = true,
                IsVisible = true,
                LinkedParameter = "TextStyle"
            };
            ZIndex = new NullableIntegerParameter
            {
                Name = "ZIndex",
                Description = "ZIndex",
                Priority = (int)GDO.Utility.Priorities.Normal,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Number,
                IsEditable = true,
                IsVisible = true
            };
        }

        new public void Modify(int? fillStyleId, int? imageStyleId, int? strokeStyleId, int? textStyleId, int? zIndex)
        {
            FillStyleId.Value = fillStyleId;
            ImageStyleId.Value = imageStyleId;
            StrokeStyleId.Value = strokeStyleId;
            TextStyleId.Value = textStyleId;
            ZIndex.Value = zIndex;
        }
    }
}