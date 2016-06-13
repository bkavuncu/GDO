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
        public StringArrayParameter ImagerySet { get; set; }
        public NullableIntegerParameter MaxZoom { get; set; }

        public BingMapsSource()
        {
            ClassName.Value = this.GetType().Name;
            Type.Value = (int)SourceTypes.BingMaps;

            Culture = new StringParameter
            {
                Name = "Culture",
                Description = "Culture code",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.String,
                IsEditable = false,
                IsVisible = true,
                DefaultValue = "en-us"
            };
            Key = new StringParameter
            {
                Name = "Key",
                Description = "Bing Maps API key",
                Priority = (int)GDO.Utility.Priorities.Required,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.String,
                IsEditable = false,
                IsVisible = true,
                DefaultValue = "At9BTvhQUqgpvpeiuc9SpgclVtgX9uM1fjsB-YQWkP3a9ZdxeZQBW99j5K3oEsbM"
            };
            ImagerySet = new StringArrayParameter
            {
                Name = "Imagery Set",
                Description = "Type of imagery",
                Priority = (int)GDO.Utility.Priorities.Required,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Datalist,
                IsEditable = false,
                IsVisible = true,
                DefaultValues = new string[5] { "Road", "Aerial", "AerialWithLabels", "collinsBart", "ordnanceSurvey" },
                DefaultValue = "Road"
            };
            MaxZoom = new NullableIntegerParameter
            {
                Name = "Max Zoom",
                Description = "Max zoom. Default is what's advertized by the BingMaps service.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Integer,
                IsEditable = false,
                IsVisible = true,
            };
        }
    }
}