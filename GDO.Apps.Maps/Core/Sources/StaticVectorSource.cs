﻿using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Utility;

namespace GDO.Apps.Maps.Core.Sources
{
    public class StaticVectorSource : Source
    {
        public LinkParameter Format { get; set; }
        public FunctionParameter Loader { get; set; }
        public FileInputParameter Url { get; set; }
        public DatalistParameter Strategy { get; set; }
        public BooleanParameter UseSpatialIndex { get; set; }
        public BooleanParameter WrapX { get; set; }

        public StaticVectorSource()
        {
            ClassName.Value = this.GetType().Name;
            ObjectType.Value = "ol.source.Vector";
            Description.Value = "Provides a source of features for vector layers. Vector features provided by this source are suitable for editing.";

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

            Url = new FileInputParameter
            {
                Name = "Url",
                PropertyName = "url",
                Description = "Relative path of the data file (can be an url). Setting this option instructs the source to use an XHR loader. Use a string and an ol.loadingstrategy.all for a one-off download of all features from the given URL. Use a ol.FeatureUrlFunction to generate the url with other loading strategies. Requires format to be set as well. When default XHR feature loader is provided, the features will be transformed from the data projection to the view projection during parsing. If your remote data source does not advertise its projection properly, this transformation will be incorrect. For some formats, the default projection (usually EPSG:4326) can be overridden by setting the defaultDataProjection constructor option on the format.",
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
                ParameterType = (int)ParameterTypes.Global,
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