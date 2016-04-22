using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core.Styles
{
    public class RegularShapeStyle : Styles.ImageStyle
    {
        public int FillStyleId { get; set; }
        public int? Points { get; set; }
        public int? Radius { get; set; }
        public int? Radius1 { get; set; }
        public int? Radius2 { get; set; }
        public int? Angle { get; set; }
        public bool? SnapToPixel { get; set; }
        public int StrokeStyleId { get; set; }

        new public void Init(int fillStyleId, float opacity, bool rotateWithView, float rotation, float scale, int points, int radius, int radius1, int radius2, int angle, bool snapToPixel, int strokeStyleId)
        {
            base.Init(opacity, rotateWithView, rotation, scale);
            FillStyleId = fillStyleId;
            Points = points;
            Radius = radius;
            Radius1 = radius1;
            Radius2 = radius2;
            Angle = angle;
            SnapToPixel = snapToPixel;
            StrokeStyleId = strokeStyleId;

            Prepare();
        }
        new public void Prepare()
        {
            base.Prepare();
            ClassName = this.GetType().Name;
        }

        new public void Modify(float opacity, float rotation, float scale)
        {
            base.Modify(opacity, rotation, scale);
        }
    }
}