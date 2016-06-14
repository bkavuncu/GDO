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
        public DatalistParameter AnchorOrigin { get; set; }
        public FloatArrayParameter Offset { get; set; }
        public DatalistParameter OffsetOrigin { get; set; }
        public BooleanParameter SnapToPixel { get; set; }
        public IntegerArrayParameter Size { get; set; }
        public IntegerArrayParameter ImageSize { get; set; }
        public StringParameter ImageSource { get; set; }

        public IconStyle()
        {
            ClassName.Value = this.GetType().Name;
            ObjectType.Value = "ol.style.Icon";

            CrossOrigin = new StringParameter
            {
                Name = "Crossorigin",
                PropertyName = "crossOrigin",
                Description = "The crossOrigin attribute for loaded images. Note that you must provide a crossOrigin value if you are using the WebGL renderer or if you want to access pixel data with the Canvas renderer. ",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true
            };

            Anchor = new FloatArrayParameter
            {
                Name = "Anchor",
                PropertyName = "anchor",
                Description = "Anchor",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true,
                DefaultValues = new float[2] { (float)0.5, (float)0.5 },
                Values = new float[2],
                Length = 2,

            };

            AnchorOrigin = new DatalistParameter
            {
                Name = "Anchor Origin",
                PropertyName = "anchorOrigin",
                Description = "Origin of the anchor",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true,
                DefaultValues = new string[4] { "bottom - left", "bottom - right", "top - left", "top - right" },
                DefaultValue = "top - left"
            };

            Offset = new FloatArrayParameter
            {
                Name = "Offset",
                PropertyName = "offset",
                Description = "Offset",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true,
                DefaultValues = new float[2] { (float)0, (float)0 },
                Length = 2,
            };

            OffsetOrigin = new DatalistParameter
            {
                Name = "Offset Origin",
                PropertyName = "offsetOrigin",
                Description = "Origin of the offset",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true,
                DefaultValues = new string[4] { "bottom - left", "bottom - right", "top - left", "top - right" },
                DefaultValue = "top - left"
            };

            SnapToPixel = new BooleanParameter
            {
                Name = "Snap To Pixel",
                PropertyName = "snapToPixel",
                Description = "If true integral numbers of pixels are used as the X and Y pixel coordinate when drawing the icon in the output canvas. If false fractional numbers may be used. Using true allows for sharp rendering (no blur), while using false allows for accurate rendering. Note that accuracy is important if the icon's position is animated. Without it, the icon may jitter noticeably. Default value is true.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                DefaultValue = true,
                IsEditable = false,
                IsVisible = true
            };

            Size = new IntegerArrayParameter
            {
                Name = "Size",
                PropertyName = "size",
                Description = "Icon size in pixel. Can be used together with offset to define the sub-rectangle to use from the origin (sprite) icon image.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true,
                Length = 2,
            };

            ImageSize = new IntegerArrayParameter
            {
                Name = "ImageSize",
                PropertyName = "imgSize",
                Description = "Image size in pixels. Only required if img is set and src is not, and for SVG images in Internet Explorer 11. The provided imgSize needs to match the actual size of the image.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true,
                Length = 2,
            };

            ImageSource = new StringParameter
            {
                Name = "Image Source",
                PropertyName = "src",
                Description = "Image Source URI",
                Priority = (int)GDO.Utility.Priorities.Required,
                IsEditable = false,
                IsVisible = true
            };
        }
    }
}