using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Utility;

namespace GDO.Apps.Maps.Core.Sources
{
    public class MapQuestSource : XYZSource
    {
        public DatalistParameter Layer { get; set; }

        public MapQuestSource()
        {
            ClassName.Value = this.GetType().Name;
            Type.Value = (int)SourceTypes.MapQuest;

            Layer = new DatalistParameter
            {
                Name = "Layer",
                Description = "Layer",
                Priority = (int)GDO.Utility.Priorities.Required,
                IsEditable = false,
                IsVisible = true,
                DefaultValues = new string[3] {"osm", "sat", "hyb"},
            };
        }
    }
}