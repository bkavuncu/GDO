using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core.Sources.Images
{
    public class StaticImage : ImageSource
    {
        public int Width { get; set; }
        public int Height { get; set; }
        public string URL { get; set; }
        public Extent Extent { get; set; }
        new public void Modify(int width, int height, string url, Extent extent)
        {
            Width = width;
            Height = height;
            URL = url;
            Extent = extent;
        }
    }
}