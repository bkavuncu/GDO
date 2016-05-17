using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Configuration;
using System.Web;
using GDO.Utility;

namespace GDO.Apps.Maps.Core.Styles
{
    public class IconStyle : Styles.ImageStyle
    {
        public StringParameter CrossOrigin { get; set; }
        public FloatArrayParameter Anchor { get; set; }
        public StringArrayParameter AnchorOrigin { get; set; }
        public FloatArrayParameter Offset { get; set; }
        public StringArrayParameter OffsetOrigin { get; set; }
        public BooleanParameter SnapToPixel { get; set; }
        public IntegerArrayParameter Size { get; set; }
        public IntegerArrayParameter ImageSize { get; set; }
        public StringParameter ImageSource { get; set; }

        public IconStyle()
        {
            ClassName.Value = this.GetType().Name;
            Type.Value = (int)StyleTypes.Icon;

            CrossOrigin = new StringParameter
            {
                Name = "Crossorigin",
                Description = "The crossOrigin attribute for loaded images. Note that you must provide a crossOrigin value if you are using the WebGL renderer or if you want to access pixel data with the Canvas renderer. ",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.String,
                IsEditable = false,
                IsVisible = true
            };

            Anchor = new FloatArrayParameter
            {
                Name = "Anchor",
                Description = "Anchor",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Array,
                IsEditable = false,
                IsVisible = true,
                DefaultValues = new float[2] { (float)0.5, (float)0.5 }
            };

            AnchorOrigin = new StringArrayParameter
            {
                Name = "Anchor Origin",
                Description = "Origin of the anchor",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Datalist,
                IsEditable = false,
                IsVisible = true,
                DefaultValues = new string[4] { "bottom - left", "bottom - right", "top - left", "top - right" },
                DefaultValue = "top - left"
            };

            Offset = new FloatArrayParameter
            {
                Name = "Offset",
                Description = "Offset",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Array,
                IsEditable = false,
                IsVisible = true,
                DefaultValues = new float[2] { (float)0, (float)0 }
            };

            OffsetOrigin = new StringArrayParameter
            {
                Name = "Offset Origin",
                Description = "Origin of the offset",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Datalist,
                IsEditable = false,
                IsVisible = true,
                DefaultValues = new string[4] { "bottom - left", "bottom - right", "top - left", "top - right" },
                DefaultValue = "top - left"
            };

            SnapToPixel = new BooleanParameter
            {
                Name = "Snap To Pixel",
                Description = "If true integral numbers of pixels are used as the X and Y pixel coordinate when drawing the icon in the output canvas. If false fractional numbers may be used. Using true allows for sharp rendering (no blur), while using false allows for accurate rendering. Note that accuracy is important if the icon's position is animated. Without it, the icon may jitter noticeably. Default value is true.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Boolean,
                DefaultValue = true,
                IsEditable = false,
                IsVisible = true
            };

            Size = new IntegerArrayParameter
            {
                Name = "Size",
                Description = "Icon size in pixel. Can be used together with offset to define the sub-rectangle to use from the origin (sprite) icon image.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Array,
                IsEditable = false,
                IsVisible = true
            };

            ImageSize = new IntegerArrayParameter
            {
                Name = "ImageSize",
                Description = "Image size in pixels. Only required if img is set and src is not, and for SVG images in Internet Explorer 11. The provided imgSize needs to match the actual size of the image.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Array,
                IsEditable = false,
                IsVisible = true
            };

            ImageSource = new StringParameter
            {
                Name = "Image Source",
                Description = "Image Source URI",
                Priority = (int)GDO.Utility.Priorities.Required,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.String,
                IsEditable = false,
                IsVisible = true
            };
        }
    }
}