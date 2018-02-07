using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Web;
using GDO.Apps.Maps.Core.Sources;
using GDO.Utility;

namespace GDO.Apps.Maps.Core.Sources
{
    public class BingMapsSource : ImageTileSource
    {
        public StringParameter Culture { get; set; }
        public StringParameter Key { get; set; }
        public DatalistParameter ImagerySet { get; set; }
        public IntegerParameter MaxZoom { get; set; }

        public BingMapsSource()
        {
            ClassName.Value = this.GetType().Name;
            ObjectType.Value = "ol.source.BingMaps";
            Description.Value = "Layer source for Bing Maps tile data.";

            Culture = new StringParameter
            {
                Name = "Culture",
                PropertyName = "culture",
                Description = "Culture code",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true,
                DefaultValue = "en-us"
            };
            Key = new StringParameter
            {
                Name = "Key",
                PropertyName = "key",
                Description = "Bing Maps API key",
                Priority = (int)GDO.Utility.Priorities.Required,
                IsEditable = false,
                IsVisible = true,
                DefaultValue = "AqJrkrOTlDJUTbioyay25R6bC-LoZaAggCaAGRV19SxySzPpMUpuukTvAiW6ldny",
                Value = "AqJrkrOTlDJUTbioyay25R6bC-LoZaAggCaAGRV19SxySzPpMUpuukTvAiW6ldny",
                IsNull = false,
            };
            ImagerySet = new DatalistParameter
            {
                Name = "Imagery Set",
                PropertyName = "imagerySet",
                Description = "Type of imagery",
                Priority = (int)GDO.Utility.Priorities.Required,
                IsEditable = false,
                IsVisible = true,
                DefaultValues = new string[5] { "Road", "Aerial", "AerialWithLabels", "collinsBart", "ordnanceSurvey" },
                DefaultValue = "Road"
            };
            MaxZoom = new IntegerParameter
            {
                Name = "Max Zoom",
                PropertyName = "maxZoom",
                Description = "Max zoom. Default is what's advertized by the BingMaps service.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true,
                Increment = 1,
            };
        }
    }
}