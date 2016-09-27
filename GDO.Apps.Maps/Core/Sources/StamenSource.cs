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
        public DatalistParameter Layer { get; set; }

        public StamenSource()
        {
            ClassName.Value = this.GetType().Name;
            ObjectType.Value = "ol.source.Stamen";
            Description.Value = "Layer source for the Stamen tile server.";

            Layer = new DatalistParameter
            {
                Name = "Layer",
                PropertyName = "layer",
                Description = "Layer",
                Priority = (int)GDO.Utility.Priorities.Required,
                IsEditable = false,
                IsVisible = true,
                DefaultValues = new string[3] { "toner", "terrain", "watercolor" },
            };
        }
    }
}