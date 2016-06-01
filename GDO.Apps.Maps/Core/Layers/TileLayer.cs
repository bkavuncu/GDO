using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Utility;

namespace GDO.Apps.Maps.Core.Layers
{
    public class TileLayer : Layer
    {
        public LinkParameter Source { get; set; }
        public NullableIntegerParameter Preload { get; set; }

        public TileLayer()
        {
            ClassName.Value = this.GetType().Name;
            ObjectType.Value = "ol.layer.Tile";

            Source = new LinkParameter
            {
                Name = "Source",
                PropertyName = "source",
                Description = "The source for this layer",
                Priority = (int)GDO.Utility.Priorities.Required,
                IsEditable = false,
                IsVisible = true,
                LinkedParameter = "sources",
                ObjectType = "ol.source.Tile",
            };

            Preload = new NullableIntegerParameter
            {
                Name = "Preload",
                PropertyName = "preload",
                Description = "Preload. Load low-resolution tiles up to preload levels. By default preload is 0, which means no preloading.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = true,
                DefaultValue = 0
            };
        }
    }
}