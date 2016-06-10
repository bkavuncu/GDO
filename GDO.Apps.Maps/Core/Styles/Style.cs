using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mime;
using System.Web;
using GDO.Utility;

namespace GDO.Apps.Maps.Core.Styles
{
    public class Style : Core.Style
    {
        public LinkParameter FillStyle { get; set; }
        public LinkParameter ImageStyle { get; set; }
        public LinkParameter StrokeStyle { get; set; }
        public LinkParameter TextStyle { get; set; }
        public NullableIntegerParameter ZIndex { get; set; }

        public Style()
        {
            ClassName.Value = this.GetType().Name;
            ObjectType.Value = "ol.style.Style";

            FillStyle = new LinkParameter
            {
                Name = "Fill Style",
                PropertyName = "fill",
                Description = "Select Fill Style",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = true,
                LinkedParameter = "styles",
                ObjectType = "ol.style.Fill",
            };
            ImageStyle = new LinkParameter
            {
                Name = "Image Style",
                PropertyName = "image",
                Description = "Select Image Style",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = true,
                LinkedParameter = "styles",
                ObjectType = "ol.style.Image",
            };
            StrokeStyle = new LinkParameter
            {
                Name = "Stroke Style",
                PropertyName = "stroke",
                Description = "Select Stroke Style",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = true,
                LinkedParameter = "styles",
                ObjectType = "ol.style.Stroke",
            };
            TextStyle = new LinkParameter
            {
                Name = "Text Style",
                PropertyName = "text",
                Description = "Select Text Style",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = true,
                LinkedParameter = "styles",
                ObjectType = "ol.style.Text",
            };
            ZIndex = new NullableIntegerParameter
            {
                Name = "ZIndex",
                PropertyName = "zIndex",
                Description = "ZIndex",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = true,
                Increment = 1,
            };
        }
    }
}