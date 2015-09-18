﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Core;

namespace GDO.Apps.Maps.Core.Styles
{
    public class CircleStyle : Styles.ImageStyle
    {
        public FillStyle Fill { get; set; }
        public int Radius { get; set; }
        public bool SnapToPixel { get; set; }
        public StrokeStyle Stroke { get; set; }

        new public void Modify(FillStyle fill, float opacity, bool rotateWithView, float rotation, float scale, int radius, bool snapToPixel, StrokeStyle stroke)
        {
            base.Modify(opacity, rotateWithView, rotation, scale);
            Fill = fill;
            Radius = radius;
            SnapToPixel = snapToPixel;
            Stroke = stroke;
        }
    }
}