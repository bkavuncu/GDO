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
        public IntegerParameter ZIndex { get; set; }

        public Style()
        {
            ClassName.Value = this.GetType().Name;
            ObjectType.Value = "ol.style.Style";
            Description.Value = "Container for vector feature rendering styles. Any changes made to the style or its children through set*() methods will not take effect until the feature or layer that uses the style is re-rendered.";

            FillStyle = new LinkParameter
            {
                Name = "Fill Style",
                PropertyName = "fill",
                Description = "Select Fill Style",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = true,
                LinkedParameter = "styles",
                ClassTypes = new string[1] { "FillStyle" },
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
                ClassTypes = new string[1] { "ImageStyle" },
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
                ClassTypes = new string[1] { "StrokeStyle" },
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
                ClassTypes = new string[1] { "TextStyle" },
            };
            ZIndex = new IntegerParameter
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