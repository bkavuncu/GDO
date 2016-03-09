using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core.Sources.Images
{
    public class StaticImageSource : ImageSource
    {
        public string CrossOrigin { get; set; }
        public int? Width { get; set; }
        public int? Height { get; set; }
        public string URL { get; set; }
        public double?[] Extent { get; set; }
        new public void Init(string crossOrigin, int width, int height, string url, double?[] extent)
        {
            CrossOrigin = crossOrigin;
            Width = width;
            Height = height;
            URL = url;
            Extent = extent;

            Prepare();
        }
        new public void Prepare()
        {
            base.Prepare();
            ClassName = this.GetType().Name;
        }

        new public void Modify()
        {
        }
    }
}