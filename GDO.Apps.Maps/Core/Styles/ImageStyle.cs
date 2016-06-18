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
        public SliderParameter Opacity { get; set; }
        public SliderParameter Rotation { get; set; }
        public SliderParameter Scale { get; set; }

        public ImageStyle()
        {
            ClassName.Value = this.GetType().Name;
            ObjectType.Value = "ol.style.Image";
            Description.Value = "A base class used for creating subclasses and not instantiated in apps. Base class for Icon Style, Circle Style and Regular Shape Style.";

            Opacity = new SliderParameter
            {
                Name = "Opacity",
                PropertyName = "opacity",
                Description = "Transparency of the Image",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = true,
                DefaultValue = 1,
                MinValue = 0,
                MaxValue = 1,
                Increment = (float?)0.05,
            };

            Rotation = new SliderParameter
            {
                Name = "Rotation",
                PropertyName = "rotation",
                Description = "Rotation",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = true,
                DefaultValue = 0,
                MinValue = 0,
                MaxValue = 7,
                Increment = (float?)0.35,
            };

            Scale = new SliderParameter
            {
                Name = "Scale",
                PropertyName = "scale",
                Description = "Scale",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = true,
                DefaultValue = 1,
                MinValue = 0,
                MaxValue = 100,
                Increment = (float?)1,
            };
        }
    }
}