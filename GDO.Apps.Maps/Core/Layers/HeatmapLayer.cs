﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Utility;

namespace GDO.Apps.Maps.Core.Layers
{
    public class HeatmapLayer : Layer
    {
        public StringArrayParameter Gradient { get; set; }
        public FloatRangeParameter Radius { get; set; }
        public FloatRangeParameter Shadow { get; set; }
        public FloatRangeParameter Weight { get; set; }
        public FloatRangeParameter Blur { get; set; }

        public HeatmapLayer(int id, string name, int type, int sourceId) : base(id, name, type, sourceId)
        {
            ClassName.Value = this.GetType().Name;

            Gradient = new StringArrayParameter
            {
                Name = "Gradient",
                Description = "Custom Gradient",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Array,
                IsEditable = true,
                IsVisible = true,
                Length = 5
            };

            Radius = new FloatRangeParameter
            {
                Name = "Radius",
                Description = "Radius of features",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Slider,
                IsEditable = true,
                IsVisible = true,
                MinValue = 0,
                MaxValue = 100,
                Default = 8
            };

            Shadow = new FloatRangeParameter
            {
                Name = "Shadow",
                Description = "Shadow size of features",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Slider,
                IsEditable = false,
                IsVisible = true,
                MinValue = 0,
                MaxValue = 1000,
                Default = 250
            };

            Weight = new FloatRangeParameter
            {
                Name = "Weight",
                Description = "Weight of features",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Slider,
                IsEditable = false,
                IsVisible = true,
                MinValue = 0,
                MaxValue = 1,
                Default = (float?)0.5
            };

            Blur = new FloatRangeParameter
            {
                Name = "Blur",
                Description = "Blur size of features",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Slider,
                IsEditable = true,
                IsVisible = true,
                MinValue = 0,
                MaxValue = 100,
                Default = 15
            };
        }
    }
}