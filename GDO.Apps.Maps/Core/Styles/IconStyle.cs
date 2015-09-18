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
        public float[] Anchor { get; set; }
        public int AnchorOrigin { get; set; }
        public float[] Offset { get; set; }
        public int OffsetOrigin { get; set; }
        public bool SnapToPixel { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
        public int ImageWidth { get; set; }
        public int ImageHeight { get; set; }
        public string ImageSource { get; set; }

        new public void Modify(float[] anchor, int anchorOrigin, float[] offset, int offsetOrigin, float opacity, float scale, bool snapToPixel,
            bool rotateWithView, float rotation, int width, int height, int imageWidth, int imageHeight, string imageSource)
        {
            base.Modify(opacity, rotateWithView, rotation, scale);
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
    }
}