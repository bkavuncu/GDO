using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core.Styles
{
    public enum LineCapTypes
    {
        None = -1,
        Butt = 1,
        Round = 2,
        Square = 3
    };

    public enum LineJoinTypes
    {
        None = -1,
        Bevel = 1,
        Round = 2,
        Miter = 3
    };

    public class StrokeStyle : Core.Style
    {
        public string Color { get; set; }
        public int LineCap { get; set; }
        public int LineJoin { get; set; }
        public int[] LineDash { get; set; }
        public int MiterLimit { get; set; }
        public int Width { get; set; }

        new public void Init(string color, int lineCap, int lineJoin, int[] lineDash, int miterLimit, int width)
        {
            Color = color;
            LineCap = lineCap;
            LineDash = lineDash;
            LineJoin = lineJoin;
            MiterLimit = miterLimit;
            Width = width;
        }
        new public void Modify(string color, int lineCap, int lineJoin, int[] lineDash, int miterLimit, int width)
        {
            Color = color;
            LineCap = lineCap;
            LineDash = lineDash;
            LineJoin = lineJoin;
            MiterLimit = miterLimit;
            Width = width;
        }
    }
}