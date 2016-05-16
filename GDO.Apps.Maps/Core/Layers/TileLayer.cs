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

        new public void Init()
        {
            Prepare();
        }
        new public void Prepare()
        {
            base.Prepare();
            ClassName.Value = this.GetType().Name;

            Preload = new NullableIntegerParameter
            {
                Name = "Preload",
                Description = "Preloads tiles from low to high resolution up to the defined level",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Number,
                IsEditable = true,
                IsVisible = true,
                Value = 0
            };
        }

        new public void Modify(int preload)
        {
            Preload.Value = preload;
        }
    }
}