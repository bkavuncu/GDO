﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Utility;

namespace GDO.Apps.Maps.Core.Styles
{
    public class StrokeStyle : Core.Style
    {
        public ColorParameter Color { get; set; }
        public DatalistParameter LineCap { get; set; }
        public DatalistParameter LineJoin { get; set; }
        public FloatArrayParameter LineDash { get; set; }
        public IntegerParameter MiterLimit { get; set; }
        public IntegerParameter Width { get; set; }

        public StrokeStyle()
        {
            ClassName.Value = this.GetType().Name;
            ObjectType.Value = "ol.style.Stroke";
            Description.Value = "Set stroke style for vector features. Note that the defaults given are the Canvas defaults, which will be used if option is not defined.";

            Color = new ColorParameter
            {
                Name = "Color",
                PropertyName = "color",
                Description = "Color",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = true
            };
            LineCap = new DatalistParameter
            {
                Name = "Line Cap",
                PropertyName = "lineCap",
                Description = "Line Cap Style",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = true,
                DefaultValues = new string[3] { "butt", "round", "square" },
                DefaultValue = "round"
            };
            LineJoin = new DatalistParameter
            {
                Name = "Line Join",
                PropertyName = "lineJoin",
                Description = "Line Join Style",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = true,
                DefaultValues = new string[3] { "bevel", "round", "mitter" },
                DefaultValue = "round"
            };
            LineDash = new FloatArrayParameter
            {
                Name = "Line Dash",
                PropertyName = "lineDash",
                Description = "Line Dash pattern",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = true,
                Length = 4,
                DefaultValues = new float?[4],
                Values = new float?[4],
            };
            MiterLimit = new IntegerParameter
            {
                Name = "Miter Limit",
                PropertyName = "miterLimit",
                Description = "Miter Limit",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = true,
                DefaultValue = 10,
                Increment = 1,
            };
            Width = new IntegerParameter
            {
                Name = "Width",
                PropertyName = "width",
                Description = "Width",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = true,
                Increment = 1,
            };
        }
    }
}