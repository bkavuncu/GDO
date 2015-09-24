using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Configuration;
using System.Web;

namespace GDO.Apps.Maps.Core.Styles
{
    enum OriginTypes
    {
        BottomLeft = 1,
        BottomRight = 2,
        TopLeft = 3,
        TopRight = 4
    }
    public class IconStyle : Styles.ImageStyle
    {
        public string CrossOrigin { get; set; }
        public float[] Anchor { get; set; }
        public string AnchorOrigin { get; set; }
        public float[] Offset { get; set; }
        public string OffsetOrigin { get; set; }
        public bool SnapToPixel { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
        public int ImageWidth { get; set; }
        public int ImageHeight { get; set; }
        public string ImageSource { get; set; }

        new public void Init(string crossOrigin, float[] anchor, string anchorOrigin, float[] offset, string offsetOrigin, float opacity, float scale, bool snapToPixel,
            bool rotateWithView, float rotation, int width, int height, int imageWidth, int imageHeight, string imageSource)
        {
            base.Init(opacity, rotateWithView, rotation, scale);
            CrossOrigin = crossOrigin;
            Anchor = anchor;
            AnchorOrigin = anchorOrigin;
            Offset = offset;
            OffsetOrigin = offsetOrigin;
            SnapToPixel = snapToPixel;
            Width = width;
            Height = height;
            ImageWidth = imageWidth;
            ImageHeight = imageHeight;
            ImageSource = imageSource;
        }
        new public void Modify(float opacity, float rotation, float scale)
        {
            base.Modify(opacity, rotation, scale);
        }
    }
}