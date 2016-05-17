using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Utility;

namespace GDO.Apps.Maps.Core.Styles
{
    public class StrokeStyle : Core.Style
    {
        public StringParameter Color { get; set; }
        public StringArrayParameter LineCap { get; set; }
        public StringArrayParameter LineJoin { get; set; }
        public FloatArrayParameter LineDash { get; set; }
        public NullableIntegerParameter MiterLimit { get; set; }
        public NullableIntegerParameter Width { get; set; }

        public StrokeStyle()
        {
            ClassName.Value = this.GetType().Name;

            Color = new StringParameter
            {
                Name = "Color",
                Description = "Color",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Color,
                IsEditable = true,
                IsVisible = true
            };
            LineCap = new StringArrayParameter
            {
                Name = "Line Cap",
                Description = "Line Cap Style",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Datalist,
                IsEditable = true,
                IsVisible = true,
                DefaultValues = new string[3] { "butt", "round", "square" },
                DefaultValue = "round"
            };
            LineJoin = new StringArrayParameter
            {
                Name = "Line Join",
                Description = "Line Join Style",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Datalist,
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
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Array,
                IsEditable = true,
                IsVisible = true,
                Length = 4,
            };
            MiterLimit = new NullableIntegerParameter
            {
                Name = "Mitter Limit",
                Description = "Mitter Limit",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Integer,
                IsEditable = true,
                IsVisible = true,
                DefaultValue = 10,
            };
            Width = new NullableIntegerParameter
            {
                Name = "Width",
                Description = "Width",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Integer,
                IsEditable = true,
                IsVisible = true,
            };
        }
    }
}