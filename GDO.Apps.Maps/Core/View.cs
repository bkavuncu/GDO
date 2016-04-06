using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Newtonsoft.Json;

namespace GDO.Apps.Maps.Core
{
    public class View : Base, ICloneable
    {
        public Position Position { get; set; }
        public float Rotation { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
        public string Projection { get; set; }

        [JsonConstructor]
        public View(int id, string name, Position position,string projection, float rotation, int width, int height)
        {
            Id = id;
            Name = name;
            Position = position;
            Rotation = rotation;
            Width = width;
            Height = height;
            Projection = projection;
        }

        public View(Position position, string projection, float rotation, int width, int height)
        {
            Position = position;
            Rotation = rotation;
            Width = width;
            Height = height;
            Projection = projection;
        }

        public object Clone()
        {
            return this.MemberwiseClone();
        }
    }
}