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
        public IntegerParameter MiterLimit { get; set; }
        public IntegerParameter Width { get; set; }

        new public void Init(string color, string lineCap, string lineJoin, float[] lineDash, int miterLimit, int width)
        {
            Prepare();
            Color.Value = color;
            LineCap.Value = lineCap;
            LineDash.Values = lineDash;
            LineJoin.Value = lineJoin;
            MiterLimit.Value = miterLimit;
            Width.Value = width;
        }
        new public void Prepare()
        {
            base.Prepare();
            ClassName.Value = this.GetType().Name;

            Color = new StringParameter
            {
                Name = "Color",
                Description = "Color",
                Priority = (int)GDO.Utility.Priorities.Normal,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Color,
                IsEditable = true,
                IsVisible = true
            };
            LineCap = new StringArrayParameter
            {
                Name = "Line Cap",
                Description = "Line Cap",
                Priority = (int)GDO.Utility.Priorities.Normal,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Datalist,
                IsEditable = true,
                IsVisible = true,
                Values = new string[3] {"butt", "round", "square"},
                Value = "round"
            };
            LineJoin = new StringArrayParameter
            {
                Name = "Line Join",
                Description = "Line Join",
                Priority = (int)GDO.Utility.Priorities.Normal,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Datalist,
                IsEditable = true,
                IsVisible = true,
                Values = new string[3] { "bevel", "round", "mitter" },
                Value = "round"
            };
            LineDash = new FloatArrayParameter
            {
                Name = "Line Dash",
                Description = "Line Dash",
                Priority = (int)GDO.Utility.Priorities.Normal,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Array,
                IsEditable = true,
                IsVisible = true,
                Length = 4,
            };
            MiterLimit = new IntegerParameter
            {
                Name = "Mitter Limit",
                Description = "Mitter Limit",
                Priority = (int)GDO.Utility.Priorities.Normal,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Number,
                IsEditable = true,
                IsVisible = true,
                Value = 10,
            };
            Width = new IntegerParameter
            {
                Name = "Width",
                Description = "Width",
                Priority = (int)GDO.Utility.Priorities.Normal,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Number,
                IsEditable = true,
                IsVisible = true,
            };
        }

        new public void Modify(string color, string lineCap, string lineJoin, float[] lineDash, int miterLimit, int width)
        {
            Color.Value = color;
            LineCap.Value = lineCap;
            LineDash.Values = lineDash;
            LineJoin.Value = lineJoin;
            MiterLimit.Value = miterLimit;
            Width.Value = width;
        }
    }
}