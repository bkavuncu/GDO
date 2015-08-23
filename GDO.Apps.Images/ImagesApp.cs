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
        public int TilesNumInEachBlockCol { get; set; }
        
        public TilesInfo[,] Tiles { get; set; }
        public int ImageNaturalWidth { get; set; } // natural size of the origin image
        public int ImageNaturalHeight { get; set; }
        public int TileWidth { get; set; } // size of each tile 1:1 to the origin image without any zooming
        public int TileHeight { get; set; }
        public int TileCols { get; set; } // cols of tiles including those not displayed
        public int TileRows { get; set; } // rows of tiles including those not displayed
        public int Rotate { get; set; }

        public DisplayRegionInfo DisplayRegion { get; set; }
        public DisplayRegionInfo[,] BlockRegion { get; set; }

        public class DisplayRegionInfo
        {
            public DisplayRegionInfo() {
                this.left = 0;
                this.top = 0;
                this.width = 0;
                this.height = 0;
            }
            public int left;
            public int top;
            public int width;
            public int height;
        }

        public class TilesInfo 
        {
            public TilesInfo() {
                this.left = 0;
                this.top = 0;
                this.cols = 0;
                this.rows = 0;
                this.displayLeft = 0;
                this.displayTop = 0;
                this.displayWidth = 0;
                this.displayHeight = 0;
            }
            public int left;
            public int top;
            public int cols;
            public int rows;
            public int displayLeft;
            public int displayTop;
            public int displayWidth;
            public int displayHeight;
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
            public double naturalHeight { get; set; } // natural size of the thumbnail image not the origin one on Control Panel
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
            this.BlockRegion = new DisplayRegionInfo[Section.Cols, Section.Rows];
            for(int i = 0 ; i < Section.Cols ; i++) {
                for (int j = 0 ; j < Section.Rows ; j++) {
                    this.BlockRegion[i, j] = new DisplayRegionInfo();
                }
            }
            this.Tiles = null;
            Directory.CreateDirectory(System.Web.HttpContext.Current.Server.MapPath("~/") + @"\Web\Images\images");
        }

    }
}