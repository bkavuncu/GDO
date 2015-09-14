using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core
{
    public class View
    {
        public int Id { get; set; }
        public Position Position { get; set; }
        public int MinResolution { get; set; }
        public int MaxResolution { get; set; }
        public int MinZoom { get; set; }
        public int MaxZoom { get; set; }
        public string Projection { get; set; }
        public float Rotation { get; set; }

        public View(int id, Position position, int minResolution, int maxResolution, int minZoom, int maxZoom, string projection, float rotation)
        {
            Id = Id;
            Position = position;
            MinResolution = minResolution;
            MaxResolution = maxResolution;
            MinZoom = minZoom;
            MaxZoom = maxZoom;
            Projection = projection;
            Rotation = rotation;
        }
    }
}