using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Services.Protocols;
using GDO.Utility;

namespace GDO.Apps.Maps.Core.Styles
{
    public class FillStyle : Core.Style
    {
        public ColorParameter Color { get; set; }

        public FillStyle()
        {
            ClassName.Value = this.GetType().Name;
            ObjectType.Value = "ol.style.Fill";

            Color = new ColorParameter
            {
                Name = "Color",
                PropertyName = "color",
                Description = "Color",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = true
            };
        }
    }
}