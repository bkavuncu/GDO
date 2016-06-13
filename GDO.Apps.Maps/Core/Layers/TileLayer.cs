using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Utility;

namespace GDO.Apps.Maps.Core.Layers
{
    public class TileLayer : Layer
    {
        public NullableIntegerParameter Preload { get; set; }

        public TileLayer()
        {
            ClassName.Value = this.GetType().Name;
            Type.Value = (int)LayerTypes.Tile;

            Preload = new NullableIntegerParameter
            {
                Name = "Preload",
                Description = "Preload. Load low-resolution tiles up to preload levels. By default preload is 0, which means no preloading.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Integer,
                IsEditable = true,
                IsVisible = true,
                DefaultValue = 0
            };
        }
    }
}