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
        
        public ThumbNailImageInfo ThumbNailImage { get; set; }
        public int TilesNumInEachBlockRow { get; set; }
        public int TilesNumInEachBlockCol { get; set;}
        
        public TilesInfo[,] Tiles { get; set; }
        public int ImageNaturalWidth { get; set; }
        public int ImageNaturalHeight { get; set; }
        public int TileWidth { get; set; }
        public int TileHeight { get; set; }
        public int TileCols { get; set; }
        public int TileRows { get; set; }
        public int Rotate { get; set; }

        public DisplayRegionInfo DisplayRegion { get; set; }

        public class DisplayRegionInfo
        {
            public int left;
            public int top;
            public int width;
            public int height;
        }

        public class TilesInfo 
        {
            public int left;
            public int top;
            public int cols;
            public int rows;
        }

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
            this.TilesNumInEachBlockRow = 3;
            this.TilesNumInEachBlockCol = 3;
            this.DisplayRegion = new DisplayRegionInfo();
            this.DisplayRegion.left = 0;
            this.DisplayRegion.top = 0;
            this.DisplayRegion.width = 0;
            this.DisplayRegion.height = 0;
            this.Tiles = null;
            Directory.CreateDirectory(System.Web.HttpContext.Current.Server.MapPath("~/") + @"\Web\Images\images");
        }

    }
}