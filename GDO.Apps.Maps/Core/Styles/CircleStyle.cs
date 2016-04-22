using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Core;

namespace GDO.Apps.Maps.Core.Styles
{
    public class CircleStyle : Styles.ImageStyle
    {
        public int FillStyleId { get; set; }
        public int? Radius { get; set; }
        public bool? SnapToPixel { get; set; }
        public int StrokeStyleId { get; set; }

        new public void Init(int fillStyleId, float opacity, bool rotateWithView, float rotation, float scale, int radius, bool snapToPixel, int strokeStyleId)
        {
            base.Init(opacity, rotateWithView, rotation, scale);
            FillStyleId = fillStyleId;
            Radius = radius;
            SnapToPixel = snapToPixel;
            StrokeStyleId = strokeStyleId;

            Prepare();
        }
        new public void Prepare()
        {
            base.Prepare();
            ClassName = this.GetType().Name;
        }


        new public void Modify( float opacity, float rotation, float scale)
        {
            base.Modify(opacity, rotation, scale);
        }
    }
}