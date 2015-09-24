using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core.Styles
{
    public class ImageStyle : Core.Style
    {
        public float Opacity { get; set; }
        public bool RotateWithView { get; set; }
        public float Rotation { get; set; }
        public float Scale { get; set; }

        new public void Init(float opacity, bool rotateWithView, float rotation, float scale)
        {
            Opacity = opacity;
            RotateWithView = rotateWithView;
            Rotation = rotation;
            Scale = scale;
        }
        new public void Modify(float opacity,  float rotation, float scale)
        {
            Opacity = opacity;
            Rotation = rotation;
            Scale = scale;
        }
    }
}