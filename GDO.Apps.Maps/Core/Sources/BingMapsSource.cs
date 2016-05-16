using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Web;
using GDO.Apps.Maps.Core.Sources.Tiles;
using GDO.Utility;

namespace GDO.Apps.Maps.Core.Sources
{
    public class BingMapsSource : ImageTileSource
    {
        public StringParameter Culture { get; set; }
        public StringParameter Key { get; set; }
        public StringArrayParameter ImagerySet { get; set; }
        public NullableIntegerParameter MaxZoom { get; set; }
        new public void Init(string culture, string key, string imagerySet, int maxZoom)
        {
            Prepare();
            Culture.Value = culture;
            Key.Value = key;
            ImagerySet.Value = imagerySet;
            MaxZoom.Value = maxZoom;
        }
        new public void Prepare()
        {
            base.Prepare();
            ClassName.Value = this.GetType().Name;

            Culture = new StringParameter
            {
                Name = "Culture",
                Description = "Culture",
                Priority = (int)GDO.Utility.Priorities.Normal,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.String,
                IsEditable = false,
                IsVisible = true,
                Value = "en-us"
            };
            Key = new StringParameter
            {
                Name = "Key",
                Description = "Key",
                Priority = (int)GDO.Utility.Priorities.Normal,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.String,
                IsEditable = false,
                IsVisible = true,
                Value = "At9BTvhQUqgpvpeiuc9SpgclVtgX9uM1fjsB-YQWkP3a9ZdxeZQBW99j5K3oEsbM"
            };
            ImagerySet = new StringArrayParameter
            {
                Name = "Imagery Set",
                Description = "Imagery Set",
                Priority = (int)GDO.Utility.Priorities.Normal,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Datalist,
                IsEditable = true,
                IsVisible = true,
                Values = new string[5] { "Road", "Aerial", "AerialWithLabels", "collinsBart", "ordnanceSurvey" },
                Value = "Road"
            };
            MaxZoom = new NullableIntegerParameter
            {
                Name = "Max Zoom",
                Description = "Max Zoom",
                Priority = (int)GDO.Utility.Priorities.Low,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Number,
                IsEditable = true,
                IsVisible = true,
            };
        }

        new public void Modify()
        {

        }
    }
}