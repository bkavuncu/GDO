using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core.Styles
{
    public class TextStyle : Core.Style
    {
        public string Font { get; set; }
        public int? OffsetX { get; set; }
        public int? OffsetY { get; set; }
        public float? Scale { get; set; }
        public float? Rotation { get; set; }
        public string Content { get; set; }
        public string TextAlign { get; set; }
        public string TextBaseLine { get; set; }
        public FillStyle Fill { get; set; }
        public StrokeStyle Stroke { get; set; }

        new public void Init(string font, int offsetX, int offsetY, float scale, float rotation, string content,
            string textAlign, string textBaseLine, FillStyle fill, StrokeStyle stroke)
        {
            Font = font;
            OffsetX = offsetX;
            OffsetY = offsetY;
            Scale = scale;
            Rotation = rotation;
            Content = content;
            TextAlign = textAlign;
            TextBaseLine = textBaseLine;
            Fill = fill;
            Stroke = stroke;

            Prepare();
        }

        new public void Prepare()
        {
            base.Prepare();
            ClassName = this.GetType().Name;
            AddtoEditables(() => Font);
            AddtoEditables(() => Scale);
            AddtoEditables(() => Rotation);
            AddtoEditables(() => Content);
            AddtoEditables(() => TextAlign);
            AddtoEditables(() => TextBaseLine);
            AddtoEditables(() => Fill);
            AddtoEditables(() => Stroke);
        }

        new public void Modify(string font, float scale, float rotation, string content,
            string textAlign, string textBaseLine, FillStyle fill, StrokeStyle stroke)
        {
            Font = font;
            Scale = scale;
            Rotation = rotation;
            Content = content;
            TextAlign = textAlign;
            TextBaseLine = textBaseLine;
            Fill = fill;
            Stroke = stroke;
        }
    }
}