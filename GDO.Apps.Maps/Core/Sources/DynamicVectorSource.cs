﻿using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Utility;

namespace GDO.Apps.Maps.Core.Sources
{
    public class DynamicVectorSource : Source
    {
        public JSONParameter Config { get; set; }
        public LinkParameter Format { get; set; }
        public FunctionParameter Loader { get; set; }
        public DatalistParameter Strategy { get; set; }
        public BooleanParameter UseSpatialIndex { get; set; }
        public BooleanParameter WrapX { get; set; }

        public DynamicVectorSource()
        {
            ClassName.Value = this.GetType().Name;
            ObjectType.Value = "ol.source.Vector";
            Description.Value = "Provides a source of features for vector layers. Vector features provided by this source are suitable for editing.";

            Config = new JSONParameter
            {
                Name = "Config JSON",
                Description = "Configuration JSON",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true,
                IsProperty = false,
                DefaultValue = "{\"files\": [{\"timestamp\": \"1990-10-30 17:32:01\"},\"file\": \"/Data/Maps/Sample/1.json\"}]}",
            };

            Format = new LinkParameter
            {
                Name = "Format",
                PropertyName = "format",
                Description = "The feature format used by the XHR feature loader when url is set. Required if url is set, otherwise ignored. ",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true,
                LinkedParameter = "formats",
                ClassTypes = new string[8] { "EsriJSONFormat", "GeoJSONFormat", "GMLFormat", "KMLFormat", "OSMXMLFormat", "TopoJSONFormat", "WFSFormat", "XMLFormat" },
            };

            Loader = new FunctionParameter
            {
                Name = "Loader Function",
                PropertyName = "loader",
                Description = "The loader function used to load features, from a remote source for example. Note that the source will create and use an XHR feature loader when url is set.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true,
            };

            Strategy = new DatalistParameter
            {
                Name = "Loading Strategy",
                PropertyName = "strategy",
                Description = "The loading strategy to use.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true,
                DefaultValues = new string[3] { "ol.loadingstrategy.all", "ol.loadingstrategy.bbox", "ol.loadingstrategy.tile" }
            };

            UseSpatialIndex = new BooleanParameter
            {
                Name = "Use Spatial Index",
                PropertyName = "useSpatialIndex",
                Description = "By default, an RTree is used as spatial index. When features are removed and added frequently, and the total number of features is low, setting this to false may improve performance.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true,
                DefaultValue = true,
            };

            WrapX = new BooleanParameter
            {
                Name = "WrapX",
                PropertyName = "wrapX",
                Description = "Wrap the world horizontally. Default is true. For vector editing across the -180° and 180° meridians to work properly, this should be set to false. The resulting geometry coordinates will then exceed the world bounds.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true,
            };
        }
    }
}