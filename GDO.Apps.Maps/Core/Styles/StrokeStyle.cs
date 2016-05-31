using System;
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
        public NullableIntegerParameter MiterLimit { get; set; }
        public NullableIntegerParameter Width { get; set; }

        public StrokeStyle()
        {
            ClassName.Value = this.GetType().Name;
            Type.Value = (int)StyleTypes.Stroke;

            Color = new ColorParameter
            {
                Name = "Color",
                Description = "Color",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = true
            };
            LineCap = new DatalistParameter
            {
                Name = "Line Cap",
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
                Description = "Line Dash pattern",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = true,
                Length = 4,
            };
            MiterLimit = new NullableIntegerParameter
            {
                Name = "Mitter Limit",
                Description = "Mitter Limit",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = true,
                DefaultValue = 10,
            };
            Width = new NullableIntegerParameter
            {
                Name = "Width",
                Description = "Width",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = true,
            };
        }
    }
}