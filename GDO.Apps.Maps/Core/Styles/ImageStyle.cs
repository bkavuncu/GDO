﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Utility;

namespace GDO.Apps.Maps.Core.Styles
{
    public class ImageStyle : Core.Style
    {
        //BASE CLASS (NOT INSTANIATED)
        public SliderParameter Opacity { get; set; }
        public SliderParameter Rotation { get; set; }
        public SliderParameter Scale { get; set; }

        public ImageStyle()
        {
            ClassName.Value = this.GetType().Name;
            Type.Value = (int)StyleTypes.Image;

            Opacity = new SliderParameter
            {
                Name = "Opacity",
                Description = "Transparency of the Image",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = true,
                DefaultValue = 1,
                MinValue = 0,
                MaxValue = 1
            };

            Rotation = new SliderParameter
            {
                Name = "Rotation",
                Description = "Rotation",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = true,
                DefaultValue = 0,
                MinValue = 0,
                MaxValue = 7
            };

            Scale = new SliderParameter
            {
                Name = "Scale",
                Description = "Scale",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = true,
                DefaultValue = 1,
                MinValue = 0,
                MaxValue = 100
            };
        }
    }
}