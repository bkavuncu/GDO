using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Utility;

namespace GDO.Apps.Maps.Core.Styles
{
    public class ImageStyle : Core.Style
    {
        public FloatRangeParameter Opacity { get; set; }
        public FloatRangeParameter Rotation { get; set; }
        public FloatRangeParameter Scale { get; set; }

        new public void Init(float opacity, float rotation, float scale)
        {
            Prepare();
            Opacity.Value = opacity;
            Rotation.Value = rotation;
            Scale.Value = scale;


        }
        new public void Prepare()
        {
            base.Prepare();
            ClassName.Value = this.GetType().Name;

            Opacity = new FloatRangeParameter
            {
                Name = "Opacity",
                Description = "Transparency of the Image",
                Priority = (int)GDO.Utility.Priorities.Low,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Slider,
                IsEditable = true,
                IsVisible = true,
                Value = 1,
                MinValue = 0,
                MaxValue = 1
            };

            Rotation = new FloatRangeParameter
            {
                Name = "Rotation",
                Description = "Rotation",
                Priority = (int)GDO.Utility.Priorities.Normal,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Slider,
                IsEditable = true,
                IsVisible = true,
                Value = 0,
                MinValue = 0,
                MaxValue = 7
            };

            Scale = new FloatRangeParameter
            {
                Name = "Scale",
                Description = "Scale",
                Priority = (int)GDO.Utility.Priorities.Normal,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Slider,
                IsEditable = true,
                IsVisible = true,
                Value = 1,
                MinValue = 0,
                MaxValue = 100
            };
        }

        new public void Modify(float opacity,  float rotation, float scale)
        {
            Opacity.Value = opacity;
            Rotation.Value = rotation;
            Scale.Value = scale;
        }
    }
}