using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Web;
using GDO.Core;
using GDO.Utility;

namespace GDO.Apps.Images
{
    enum Mode
    {
        FILL = 1,
        FIT = 0
    };
    public class ImagesApp : IAppInstance
    {
        public int Id { get; set; }
        public Section Section { get; set; }
        public AppConfiguration Configuration { get; set; }
        public string ImageName { get; set; }
        public string ImageNameDigit { get; set; }
        public int DisplayMode { get; set; }
        public Image[,] Tiles { get; set; }
        public ThumbNailImageInfo ThumbNailImage { get; set; }

        public class CanvasDataInfo
        {
            public double left { get; set; }
            public double top { get; set; }
            public double width { get; set; }
            public double height { get; set; }
        }

        public class CropboxDataInfo
        {
            public double left { get; set; }
            public double top { get; set; }
            public double width { get; set; }
            public double height { get; set; }
        }

        public class ImageDataInfo
        {
            public double left { get; set; }
            public double top { get; set; }
            public double width { get; set; }
            public double height { get; set; }
            public double aspectRatio { get; set; }
            public double naturalHeight { get; set; }
            public double naturalWidth { get; set; }
            public double rotate { get; set; }
        }

        public class ThumbNailImageInfo
        {
            public ImageDataInfo imageData { get; set; }
            public CropboxDataInfo cropboxData { get; set; }
            public CanvasDataInfo canvasData { get; set; }
        }

        public void init(int instanceId, Section section, AppConfiguration configuration)
        {
            this.Id = instanceId;
            this.Section = section;
            this.Configuration = configuration;
            this.DisplayMode = (int)Mode.FIT;
            this.ThumbNailImage = null;
            Directory.CreateDirectory(System.Web.HttpContext.Current.Server.MapPath("~/") + @"\Web\Images\images");
        }

    }
}