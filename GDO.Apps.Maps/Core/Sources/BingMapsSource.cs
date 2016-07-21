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
<<<<<<< HEAD
        public DatalistParameter ImagerySet { get; set; }
        public IntegerParameter MaxZoom { get; set; }
=======
        public StringArrayParameter ImagerySet { get; set; }
        public new NullableIntegerParameter MaxZoom { get; set; }// todo this is hiding a parent class method. assume thats intentional 
>>>>>>> cd6a2abf482faf5b4346568824152561c1b2d2c4

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
                DefaultValue = "At9BTvhQUqgpvpeiuc9SpgclVtgX9uM1fjsB-YQWkP3a9ZdxeZQBW99j5K3oEsbM",
                Value = "At9BTvhQUqgpvpeiuc9SpgclVtgX9uM1fjsB-YQWkP3a9ZdxeZQBW99j5K3oEsbM",
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