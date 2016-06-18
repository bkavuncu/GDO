using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core
{
    public class Position : ICloneable
    {
        public float?[] TopLeft { get; set; }
        public float?[] Center { get; set; }
        public float?[] BottomRight { get; set; }
        public float? Resolution { get; set; }
        public int? Width { get; set; }
        public int? Height { get; set; }

        public Position(float?[] topLeft, float?[] center, float?[] bottomRight, float? resolution, int? width, int? height)
        {
            TopLeft = topLeft;
            Center = center;
            BottomRight = bottomRight;
            Resolution = resolution;
            Width = width;
            Height = height;
        }

        public object Clone()
        {
            return this.MemberwiseClone();
        }
    }
}