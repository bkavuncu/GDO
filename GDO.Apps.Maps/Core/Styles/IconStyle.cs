using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Configuration;
using System.Web;
using GDO.Utility;

namespace GDO.Apps.Maps.Core.Styles
{
    enum OriginTypes
    {
        BottomLeft = 1,
        BottomRight = 2,
        TopLeft = 3,
        TopRight = 4
    }
    public class IconStyle : Styles.ImageStyle
    {
        public StringParameter CrossOrigin { get; set; }
        public FloatArrayParameter Anchor { get; set; }
        public StringArrayParameter AnchorOrigin { get; set; }
        public FloatArrayParameter Offset { get; set; }
        public StringArrayParameter OffsetOrigin { get; set; }
        public BooleanParameter SnapToPixel { get; set; }
        public NullableIntegerParameter Width { get; set; }
        public NullableIntegerParameter Height { get; set; }
        public NullableIntegerParameter ImageWidth { get; set; }
        public NullableIntegerParameter ImageHeight { get; set; }
        public StringParameter ImageSource { get; set; }

        new public void Init(string crossOrigin, float[] anchor, string anchorOrigin, float[] offset, string offsetOrigin, float opacity, float scale, bool snapToPixel,
            float rotation, int width, int height, int imageWidth, int imageHeight, string imageSource)
        {
            Prepare();
            base.Init(opacity, rotation, scale);
            CrossOrigin.Value = crossOrigin;
            Anchor.Values = anchor;
            AnchorOrigin.Value = anchorOrigin;
            Offset.Values = offset;
            OffsetOrigin.Value = offsetOrigin;
            SnapToPixel.Value = snapToPixel;
            Width.Value = width;
            Height.Value = height;
            ImageWidth.Value = imageWidth;
            ImageHeight.Value = imageHeight;
            ImageSource.Value = imageSource;
        }
        new public void Prepare()
        {
            base.Prepare();
            ClassName.Value = this.GetType().Name;

            CrossOrigin = new StringParameter
            {
                Name = "Crossorigin",
                Description = "Required for WebGL render",
                Priority = (int)GDO.Utility.Priorities.Low,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.String,
                IsEditable = false,
                IsVisible = true
            };
            Anchor = new FloatArrayParameter
            {
                Name = "Anchor",
                Description = "Anchor",
                Priority = (int)GDO.Utility.Priorities.Normal,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Array,
                IsEditable = false,
                IsVisible = true,
                Values = new float[2] {(float)0.5, (float)0.5 }
            };
            AnchorOrigin = new StringArrayParameter
            {
                Name = "Anchor Origin",
                Description = "Select Anchor Origin",
                Priority = (int)GDO.Utility.Priorities.Normal,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Datalist,
                IsEditable = false,
                IsVisible = true,
                Values = new string[4] { "bottom - left", "bottom - right", "top - left", "top - right" },
                Value = "top - left"
            };
            Offset = new FloatArrayParameter
            {
                Name = "Offset",
                Description = "Offset",
                Priority = (int)GDO.Utility.Priorities.Normal,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Array,
                IsEditable = false,
                IsVisible = true,
                Values = new float[2] { (float)0, (float)0 }
            };
            OffsetOrigin = new StringArrayParameter
            {
                Name = "Offset Origin",
                Description = "Select Offset Origin",
                Priority = (int)GDO.Utility.Priorities.Normal,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Datalist,
                IsEditable = false,
                IsVisible = true,
                Values = new string[4] { "bottom - left", "bottom - right", "top - left", "top - right" },
                Value = "top - left"
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
            Width = new NullableIntegerParameter
            {
                Name = "Width",
                Description = "Width",
                Priority = (int)GDO.Utility.Priorities.Normal,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Number,
                IsEditable = false,
                IsVisible = true
            };
            Height = new NullableIntegerParameter
            {
                Name = "Height",
                Description = "Height",
                Priority = (int)GDO.Utility.Priorities.Normal,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Number,
                IsEditable = false,
                IsVisible = true
            };
            ImageWidth = new NullableIntegerParameter
            {
                Name = "Image Height",
                Description = "Image Height",
                Priority = (int)GDO.Utility.Priorities.Normal,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Number,
                IsEditable = false,
                IsVisible = true
            };
            ImageHeight = new NullableIntegerParameter
            {
                Name = "Image Height",
                Description = "Image Height",
                Priority = (int)GDO.Utility.Priorities.Normal,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Number,
                IsEditable = false,
                IsVisible = true
            };
            ImageSource = new StringParameter
            {
                Name = "Image Source",
                Description = "Image Source",
                Priority = (int)GDO.Utility.Priorities.Normal,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.String,
                IsEditable = false,
                IsVisible = true
            };
        }

        new public void Modify(float opacity, float rotation, float scale)
        {
            base.Modify(opacity, rotation, scale);
        }
    }
}