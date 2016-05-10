using System;
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

        new public void Init(string[] gradient, float radius, float shadow, float weight, float blur)
        {
            Gradient.Values = gradient;
            Radius.Value = radius;
            Shadow.Value = shadow;
            Weight.Value = weight;
            Blur.Value = blur;

            Prepare();
        }
        new public void Prepare()
        {
            base.Prepare();
            ClassName.Value = this.GetType().Name;

            Gradient = new StringArrayParameter
            {
                Name = "Gradient",
                Description = "Custom Gradient",
                Priority = (int)GDO.Utility.Priorities.Low,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Array,
                IsEditable = true,
                IsVisible = true,
                Length = 5
            };

            Radius = new FloatRangeParameter
            {
                Name = "Radius",
                Description = "Radius of features",
                Priority = (int)GDO.Utility.Priorities.Normal,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Slider,
                IsEditable = true,
                IsVisible = true,
                MinValue = 0,
                MaxValue = 100,
                Value = 8
            };

            Shadow = new FloatRangeParameter
            {
                Name = "Shadow",
                Description = "Shadow size of features",
                Priority = (int)GDO.Utility.Priorities.Normal,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Slider,
                IsEditable = false,
                IsVisible = true,
                MinValue = 0,
                MaxValue = 1000,
                Value = 250
            };

            Weight = new FloatRangeParameter
            {
                Name = "Weight",
                Description = "Weight of features",
                Priority = (int)GDO.Utility.Priorities.Normal,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Slider,
                IsEditable = false,
                IsVisible = true,
                MinValue = 0,
                MaxValue = 1,
                Value = (float?)0.5
            };

            Blur = new FloatRangeParameter
            {
                Name = "Blur",
                Description = "Blur size of features",
                Priority = (int)GDO.Utility.Priorities.Normal,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Slider,
                IsEditable = true,
                IsVisible = true,
                MinValue = 0,
                MaxValue = 100,
                Value = 15
            };
        }

        new public void Modify(string[] gradient, float radius,  float blur)
        {
            Gradient.Values = gradient;
            Radius.Value = radius;
            Blur.Value = blur;
        }
    }
}