using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Apps.Maps.Core.Sources;
using GDO.Utility;

namespace GDO.Apps.Maps.Core.Sources
{
    public class StamenSource : XYZSource
    {
        public StringArrayParameter Layer { get; set; }

        public StamenSource()
        {
            ClassName.Value = this.GetType().Name;

            Layer = new StringArrayParameter
            {
                Name = "Layer",
                Description = "Layer",
                Priority = (int)GDO.Utility.Priorities.Required,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Datalist,
                IsEditable = false,
                IsVisible = true,
                DefaultValues = new string[3] { "toner", "terrain", "watercolor" },
            };
        }
    }
}