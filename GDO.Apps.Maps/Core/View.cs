using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core
{
    public class View
    {
        public Position Position { get; set; }
        //public int MinResolution { get; set; }
        //public int MaxResolution { get; set; }
        //public int MinZoom { get; set; }
        //public int MaxZoom { get; set; }
        //public string Projection { get; set; }
        public float Rotation { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }

        public View(Position position, float rotation, int width, int height)
        {
            Position = position;
            //MinResolution = minResolution;
            //MaxResolution = maxResolution;
            //MinZoom = minZoom;
            //MaxZoom = maxZoom;
            //Projection = projection;
            Rotation = rotation;
            Width = width;
            Height = height;
        }
    }
}