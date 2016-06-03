using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Utility;

namespace GDO.Apps.Maps.Core.Sources
{
    public class ImageTileSource : Source
    {
        public NullableIntegerParameter CacheSize { get; set; }
        public StringParameter CrossOrigin { get; set; }
        public BooleanParameter Opaque { get; set; }
        public StringParameter Projection { get; set; }
        public FloatArrayParameter Extent { get; set; }
        public NullableIntegerParameter MinZoom { get; set; }
        public NullableIntegerParameter MaxZoom { get; set; }
        public FloatArrayParameter Origin { get; set; }
        public FloatArrayParameter Resolutions { get; set; }
        public IntegerArrayParameter TileSize { get; set; }
        public StringParameter TileLoadFunction { get; set; }
        public FloatParameter TilePixelRatio { get; set; }
        public StringParameter Url { get; set; }
        public BooleanParameter WrapX { get; set; }


        public ImageTileSource()
        {
            ClassName.Value = this.GetType().Name;
            Type.Value = (int)SourceTypes.TileImage;

            CacheSize = new NullableIntegerParameter
            {
                Name = "Cache Size",
                Description = "Cache Size",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Integer,
                IsEditable = false,
                IsVisible = true,
                DefaultValue = 2048,
            };

            CrossOrigin = new StringParameter
            {
                Name = "Cross Origin",
                Description = "he crossOrigin attribute for loaded images. Note that you must provide a crossOrigin value if you are using the WebGL renderer or if you want to access pixel data with the Canvas renderer",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.String,
                IsEditable = false,
                IsVisible = true,
            };

            Opaque = new BooleanParameter
            {
                Name = "Opaque",
                Description = "Whether the layer is opaque.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Boolean,
                IsEditable = false,
                IsVisible = true,
            };

            Projection = new StringParameter
            {
                Name = "Projection",
                Description = "Projection",
                Priority = (int)GDO.Utility.Priorities.Required,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.String,
                IsEditable = false,
                IsVisible = true,
            };

            Extent = new FloatArrayParameter
            {
                Name = "Extent",
                Description = "Extent for the tile grid. No tiles outside this extent will be requested",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Array,
                IsEditable = false,
                IsVisible = true,
            };

            MinZoom = new NullableIntegerParameter
            {
                Name = "Minimum Zoom",
                Description = "Minimum Zoom",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Integer,
                IsEditable = false,
                IsVisible = true,
                DefaultValue = 0,
            };

            MaxZoom = new NullableIntegerParameter
            {
                Name = "Maximum Zoom",
                Description = "Maximum Zoom",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Integer,
                IsEditable = false,
                IsVisible = true,
                DefaultValue = 0,
            };

            Origin = new FloatArrayParameter
            {
                Name = "Origin",
                Description = "The tile grid origin, i.e. where the x and y axes meet ([z, 0, 0]). Tile coordinates increase left to right and upwards",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Array,
                IsEditable = false,
                IsVisible = true,
                Length = 2,
            };

            Resolutions = new FloatArrayParameter
            {
                Name = "Resolutions",
                Description = "Resolutions. The array index of each resolution needs to match the zoom level. This means that even if a minZoom is configured, the resolutions array will have a length of maxZoom + 1",
                Priority = (int)GDO.Utility.Priorities.Required,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Array,
                IsEditable = false,
                IsVisible = true,
                Length = 21,
            };

            TileSize = new IntegerArrayParameter
            {
                Name = "Tile Size",
                Description = "Tile Size",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Array,
                IsEditable = false,
                IsVisible = true,
                Length = 2,
                DefaultValues = new int[2] {256,256},
            };

            TileLoadFunction = new StringParameter
            {
                Name = "Tile Load Function",
                Description = "Optional function to load a tile given a URL.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Function,
                IsEditable = false,
                IsVisible = true,
                DefaultValue = "function(imageTile, src) {imageTile.getImage().src = src;};",
            };

            TilePixelRatio = new FloatParameter
            {
                Name = "Tile Pixel Ratio",
                Description = "The pixel ratio used by the tile service. For example, if the tile service advertizes 256px by 256px tiles but actually sends 512px by 512px images (for retina/hidpi devices) then tilePixelRatio should be set to 2.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Float,
                IsEditable = false,
                IsVisible = true,
                DefaultValue = 1,
            };

            Url = new StringParameter
            {
                Name = "Url",
                Description = "URL template. Must include {x}, {y} or {-y}, and {z} placeholders. A {?-?} template pattern, for example subdomain{a-f}.domain.com, may be used instead of defining each one separately in the urls option",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.String,
                IsEditable = true,
                IsVisible = true,
            };
            WrapX = new BooleanParameter()
            {
                Name = "WrapX",
                Description = "Whether to wrap the world horizontally. The default, undefined, is to request out-of-bounds tiles from the server. When set to false, only one world will be rendered. When set to true, tiles will be requested for one world only, but they will be wrapped horizontally to render multiple worlds.",
                Priority = (int) GDO.Utility.Priorities.Optional,
                VisualisationType = (int) GDO.Utility.VisualisationTypes.Boolean,
                IsEditable = false,
                IsVisible = true,
            };
        }
    }
}