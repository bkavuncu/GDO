using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Utility;

namespace GDO.Apps.Maps.Core.Sources.Images
{
    public class StaticImageSource : Source
    {
        public StringParameter CrossOrigin { get; set; }
        public IntegerArrayParameter ImageSize { get; set; }
        public FloatArrayParameter ImageExtent { get; set; }
        public StringParameter Projection { get; set; }
        public FunctionParameter ImageLoadFunction { get; set; }
        public StringParameter Url { get; set; }

        public StaticImageSource()
        {
            ClassName.Value = this.GetType().Name;
            ObjectType.Value = "ol.source.ImageStatic";
            Description.Value = "A layer source for displaying a single, static image.";

            CrossOrigin = new StringParameter
            {
                Name = "Cross Origin",
                PropertyName = "crossOrigin",
                Description = "The crossOrigin attribute for loaded images. Note that you must provide a crossOrigin value if you are using the WebGL renderer or if you want to access pixel data with the Canvas renderer. ",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true,
            };

            ImageSize = new IntegerArrayParameter
            {
                Name = "Image Size",
                PropertyName = "imageSize",
                Description = "Size of the image in pixels. Usually the image size is auto-detected, so this only needs to be set if auto-detection fails for some reason.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true,
                Length = 2,
                DefaultValues = new int?[2],
                Values = new int?[2],
            };

            ImageExtent = new FloatArrayParameter
            {
                Name = "Image Extent",
                PropertyName = "imageExtent",
                Description = "Extent of the image in map coordinates. This is the [left, bottom, right, top] map coordinates of your image.",
                Priority = (int)GDO.Utility.Priorities.Required,
                IsEditable = false,
                IsVisible = true,
                Length = 4,
                DefaultValues = new float?[4],
                Values = new float?[4],
            };

            Projection = new StringParameter
            {
                Name = "Projection",
                PropertyName = "projection",
                Description = "Projection",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true,
            };

            ImageLoadFunction = new FunctionParameter
            {
                Name = "Image Load Function",
                PropertyName = "imageLoadFunction",
                Description = "Optional function to load an image given a URL.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true,
            };

            Url = new StringParameter
            {
                Name = "Url",
                PropertyName = "url",
                Description = "Image URL",
                Priority = (int)GDO.Utility.Priorities.Required,
                IsEditable = false,
                IsVisible = true,
            };
        }
    }
}