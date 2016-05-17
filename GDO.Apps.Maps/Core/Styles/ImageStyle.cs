using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Utility;

namespace GDO.Apps.Maps.Core.Styles
{
    public class ImageStyle : Core.Style
    {
        //BASE CLASS (NOT INSTANIATED)
        public FloatRangeParameter Opacity { get; set; }
        public FloatRangeParameter Rotation { get; set; }
        public FloatRangeParameter Scale { get; set; }

        public ImageStyle()
        {
            ClassName.Value = this.GetType().Name;

            Opacity = new FloatRangeParameter
            {
                Name = "Opacity",
                Description = "Transparency of the Image",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Slider,
                IsEditable = true,
                IsVisible = true,
                DefaultValue = 1,
                MinValue = 0,
                MaxValue = 1
            };

            Rotation = new FloatRangeParameter
            {
                Name = "Rotation",
                Description = "Rotation",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Slider,
                IsEditable = true,
                IsVisible = true,
                DefaultValue = 0,
                MinValue = 0,
                MaxValue = 7
            };

            Scale = new FloatRangeParameter
            {
                Name = "Scale",
                Description = "Scale",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Slider,
                IsEditable = true,
                IsVisible = true,
                DefaultValue = 1,
                MinValue = 0,
                MaxValue = 100
            };
        }
    }
}