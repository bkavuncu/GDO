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
    public class ImagesApp : IBaseAppInstance
    {
        public int Id { get; set; }
        public string AppName { get; set; }
        public Section Section { get; set; }
        public AppConfiguration Configuration { get; set; }
        public bool IntegrationMode { get; set; }
        public IVirtualAppInstance ParentApp { get; set; }
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
        public BlockRegionInfo[,] BlockRegion { get; set; }

        public class DisplayRegionInfo
        {
            public DisplayRegionInfo() {
                this.left = 0;
                this.top = 0;
                this.width = 0;
                this.height = 0;
            }
            public int left { get; set; }
            public int top { get; set; }
            public int width { get; set; }
            public int height { get; set; }
        }

        public class BlockRegionInfo 
        {
            public BlockRegionInfo() {
                this.left = 0;
                this.top = 0;
                this.width = 0;
                this.height = 0;
                this.tiles = null;
            }
            public int left { get; set; }
            public int top { get; set; }
            public int width { get; set; }
            public int height { get; set; }
            public DisplayTileInfo[] tiles { get; set; }
        }

        public class DisplayTileInfo
        {
            public DisplayTileInfo()
            {
                this.tileIdCol = -1;
                this.tileIdRow = -1;
                this.displayLeft = 0;
                this.displayTop = 0;
                this.displayWidth = 0;
                this.displayHeight = 0;
            }
            public int tileIdCol { get; set; }
            public int tileIdRow { get; set; }
            public int displayLeft { get; set; }
            public int displayTop { get; set; }
            public int displayWidth { get; set; }
            public int displayHeight { get; set; }
        }

        public class TilesInfo 
        {
            public TilesInfo() {
                this.left = 0;
                this.top = 0;
                this.cols = 0;
                this.rows = 0;
            }
            public int left { get; set; }
            public int top { get; set; }
            public int cols { get; set; }
            public int rows { get; set; }
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

        public void Init(int instanceId, string appName, Section section, AppConfiguration configuration, bool integrationMode)
        {
            this.Id = instanceId;
            this.AppName = appName;
            this.Section = section;
            this.Configuration = configuration;
            this.DisplayMode = (int)Mode.FIT;
            this.ImageName = null;
            this.ImageNameDigit = ""; 

            this.Rotate = 0;

            this.ThumbNailImage = null;
            this.TilesNumInEachBlockRow = 3;
            this.TilesNumInEachBlockCol = 3;
            this.DisplayRegion = new DisplayRegionInfo();
            this.BlockRegion = new BlockRegionInfo[Section.Cols, Section.Rows];
            for(int i = 0 ; i < Section.Cols ; i++) {
                for (int j = 0 ; j < Section.Rows ; j++) {
                    this.BlockRegion[i, j] = new BlockRegionInfo();
                }
            }
            this.Tiles = null;
            Directory.CreateDirectory(HttpContext.Current.Server.MapPath("~/Web/Images/images"));
        }

    }
}