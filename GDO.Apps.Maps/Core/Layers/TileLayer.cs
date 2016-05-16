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

        public TileLayer(int id, string name, int type, int sourceId) : base(id, name, type, sourceId)
        {
            ClassName.Value = this.GetType().Name;

            Preload = new NullableIntegerParameter
            {
                Name = "Preload",
                Description = "Preload. Load low-resolution tiles up to preload levels. By default preload is 0, which means no preloading.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Number,
                IsEditable = true,
                IsVisible = true,
                Default = 0
            };
        }
    }
}