﻿using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Utility;

namespace GDO.Apps.Maps.Core.Sources
{
    public class VectorTileSource : Source
    {
        public IntegerParameter CacheSize { get; set; }
        public LinkParameter Format { get; set; }
        public StringParameter Projection { get; set; }
        public FloatArrayParameter Extent { get; set; }
        public IntegerParameter MinZoom { get; set; }
        public FloatArrayParameter Origin { get; set; }
        public FloatArrayParameter Resolutions { get; set; }
        public IntegerArrayParameter TileSize { get; set; }
        public FunctionParameter TileLoadFunction { get; set; }
        public FloatParameter TilePixelRatio { get; set; }
        public StringParameter Url { get; set; }
        public BooleanParameter WrapX { get; set; }

        public VectorTileSource()
        {
            ClassName.Value = this.GetType().Name;
            ObjectType.Value = "ol.source.VectorTile";
            Description.Value = "Class for layer sources providing vector data divided into a tile grid, to be used with VectorTile. Although this source receives tiles with vector features from the server, it is not meant for feature editing. Features are optimized for rendering, their geometries are clipped at or near tile boundaries and simplified for a view resolution. ";

            CacheSize = new IntegerParameter
            {
                Name = "Cache Size",
                PropertyName = "cacheSize",
                Description = "Cache Size",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true,
                DefaultValue = 128,
                Increment = 1,
            };

            Format = new LinkParameter
            {
                Name = "Format",
                PropertyName = "format",
                Description = "Feature format for tiles. Used and required by the default Tile Load Function.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true,
                LinkedParameter = "formats",
                ClassTypes = new string[8] { "EsriJSONFormat", "GeoJSONFormat", "GMLFormat", "KMLFormat", "OSMXMLFormat", "TopoJSONFormat", "WFSFormat", "XMLFormat" },
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

            Extent = new FloatArrayParameter
            {
                Name = "Extent",
                PropertyName = "extent",
                Description = "Extent for the tile grid. No tiles outside this extent will be requested",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true,
                IsPartOfObject = true,
                ObjectName = "ol.tilegrid.TileGrid",
                Length = 2,
                DefaultValues = new float?[2],
                Values = new float?[2],
            };

            MinZoom = new IntegerParameter
            {
                Name = "Minimum Zoom",
                PropertyName = "minZoom",
                Description = "Minimum Zoom",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true,
                DefaultValue = 0,
                IsPartOfObject = true,
                ObjectName = "ol.tilegrid.TileGrid",
                Increment = 1,
            };

            Origin = new FloatArrayParameter
            {
                Name = "Origin",
                PropertyName = "origin",
                Description = "The tile grid origin, i.e. where the x and y axes meet ([z, 0, 0]). Tile coordinates increase left to right and upwards",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true,
                Length = 2,
                IsPartOfObject = true,
                ObjectName = "ol.tilegrid.TileGrid",
                DefaultValues = new float?[2],
                Values = new float?[2],
            };

            Resolutions = new FloatArrayParameter
            {
                Name = "Resolutions",
                PropertyName = "resolutions",
                Description = "Resolutions. The array index of each resolution needs to match the zoom level. This means that even if a minZoom is configured, the resolutions array will have a length of maxZoom + 1",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true,
                Length = 10,
                IsPartOfObject = true,
                ObjectName = "ol.tilegrid.TileGrid",
                DefaultValues = new float?[10],
                Values = new float?[10],
            };

            TileSize = new IntegerArrayParameter
            {
                Name = "Tile Size",
                PropertyName = "tileSize",
                Description = "Tile Size",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true,
                Length = 2,
                DefaultValues = new int?[2] { 256, 256 },
                Values = new int?[2],
                IsPartOfObject = true,
                ObjectName = "ol.tilegrid.TileGrid",
            };

            TileLoadFunction = new FunctionParameter
            {
                Name = "Tile Load Function",
                PropertyName = "tileLoadFunction",
                Description = "Optional function to load a tile given a URL.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true,
                DefaultValue = "function(tile, url) {tile.setLoader(function() {var data = // ... fetch datavar format = tile.getFormat();tile.setFeatures(format.readFeatures(data));tile.setProjection(format.readProjection(data));};});",
            };

            TilePixelRatio = new FloatParameter
            {
                Name = "Tile Pixel Ratio",
                PropertyName = "tilePixelRatio",
                Description = "The pixel ratio used by the tile service. For example, if the tile service advertizes 256px by 256px tiles but actually sends 512px by 512px images (for retina/hidpi devices) then tilePixelRatio should be set to 2.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true,
                DefaultValue = 1,
                Increment = (float)0.1,
            };

            Url = new StringParameter
            {
                Name = "Url",
                PropertyName = "url",
                Description = "URL template. Must include {x}, {y} or {-y}, and {z} placeholders. A {?-?} template pattern, for example subdomain{a-f}.domain.com, may be used instead of defining each one separately in the urls option",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = true,
            };
            WrapX = new BooleanParameter
            {
                Name = "WrapX",
                PropertyName = "wrapx",
                Description = "Whether to wrap the world horizontally. The default, undefined, is to request out-of-bounds tiles from the server. When set to false, only one world will be rendered. When set to true, tiles will be requested for one world only, but they will be wrapped horizontally to render multiple worlds.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true,
            };
        }
    }
}