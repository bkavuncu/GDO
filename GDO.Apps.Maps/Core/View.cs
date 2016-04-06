using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core
{
    public class View : Base
    {
        public Position Position { get; set; }
        public float Rotation { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
        public string Projection { get; set; }

        public View(int id, string name, int type, Position position,string projection, float rotation, int width, int height)
        {
            Id = id;
            Name = name;
            Type = type;
            Position = position;
            Rotation = rotation;
            Width = width;
            Height = height;
            Projection = projection;
        }
    }
}