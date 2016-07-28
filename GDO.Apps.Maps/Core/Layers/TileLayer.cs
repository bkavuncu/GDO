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
        public IntegerParameter Preload { get; set; }

        public TileLayer()
        {
            ClassName.Value = this.GetType().Name;
            ObjectType.Value = "ol.layer.Tile";
            Description.Value = "For layer sources that provide pre-rendered, tiled images in grids that are organized by zoom levels for specific resolutions.";

            Source = new LinkParameter
            {
                Name = "Source",
                PropertyName = "source",
                Description = "The source for this layer",
                Priority = (int)GDO.Utility.Priorities.Required,
                IsEditable = false,
                IsVisible = true,
                LinkedParameter = "sources",
                ClassTypes = new string[10] { "ImageTileSource", "BingMapsSource", "CartoDBSource", "MapQuestSource", "OSMSource", "StamenSource", "TileArcGISRestSource", "TileWMSSource", "XYZSource", "ZoomifySource" },
            };

            Preload = new IntegerParameter
            {
                Name = "Preload",
                PropertyName = "preload",
                Description = "Preload. Load low-resolution tiles up to preload levels. By default preload is 0, which means no preloading.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = true,
                DefaultValue = 0,
                Increment = 1,
            };
        }
    }
}