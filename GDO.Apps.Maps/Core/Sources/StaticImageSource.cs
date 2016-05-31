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
        public StringParameter ImageLoadFunction { get; set; }
        public StringParameter Url { get; set; }

        public StaticImageSource()
        {
            ClassName.Value = this.GetType().Name;
            Type.Value = (int)SourceTypes.ImageStatic;

            CrossOrigin = new StringParameter
            {
                Name = "Cross Origin",
                Description = "The crossOrigin attribute for loaded images. Note that you must provide a crossOrigin value if you are using the WebGL renderer or if you want to access pixel data with the Canvas renderer. ",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.String,
                IsEditable = false,
                IsVisible = true,
            };

            ImageSize = new IntegerArrayParameter
            {
                Name = "Image Size",
                Description = "Size of the image in pixels. Usually the image size is auto-detected, so this only needs to be set if auto-detection fails for some reason.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Array,
                IsEditable = false,
                IsVisible = true,
                Length = 2,
            };

            ImageExtent = new FloatArrayParameter
            {
                Name = "Image Extent",
                Description = "Extent of the image in map coordinates. This is the [left, bottom, right, top] map coordinates of your image.",
                Priority = (int)GDO.Utility.Priorities.Required,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Array,
                IsEditable = false,
                IsVisible = true,
                Length = 4,
            };

            Projection = new StringParameter
            {
                Name = "Projection",
                Description = "Projection",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.String,
                IsEditable = false,
                IsVisible = true,
            };

            ImageLoadFunction = new StringParameter
            {
                Name = "Image Load Function",
                Description = "Optional function to load an image given a URL.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Function,
                IsEditable = false,
                IsVisible = true,
            };

            Url = new StringParameter
            {
                Name = "Url",
                Description = "Image URL",
                Priority = (int)GDO.Utility.Priorities.Required,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.String,
                IsEditable = false,
                IsVisible = true,
            };
        }
    }
}