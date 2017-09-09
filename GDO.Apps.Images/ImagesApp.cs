using System.IO;
using System.Web;
using GDO.Core;
using GDO.Core.Apps;
using System;

namespace GDO.Apps.Images
{
    enum Mode
    {
        // ReSharper disable once InconsistentNaming
        FILL = 1,
        // ReSharper disable once InconsistentNaming
        FIT = 0
    };
    public class ImagesApp : IBaseAppInstance
    {
        public int Id { get; set; }
        public string AppName { get; set; }
        public App App { get; set; }
        public Section Section { get; set; }
        public AppConfiguration Configuration { get; set; }
        public bool IntegrationMode { get; set; }
        public ICompositeAppInstance ParentApp { get; set; }
        public string ImageName
        {
            get { return Configuration.State.ImageName; }
            set { Configuration.State.ImageName = value; }
        }
        public string ImageNameDigit
        {
            get { return Configuration.State.ImageNameDigit; }
            set { Configuration.State.ImageNameDigit = value; }
        }
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
        public int Rotate {
            get { return Configuration.State.Rotate; }
            set { Configuration.State.Rotate = value; }
        }

        public DisplayRegionInfo DisplayRegion { get; set; }
        public DisplayBlockInfo DisplayBlock
        {
            get { return Configuration.State.DisplayBlock; }
            set { Configuration.State.DisplayBlock = value; }
        }

        public void Init()
        {
            this.DisplayMode = (int)Mode.FIT;

            if (Configuration.State == null)
            {
                this.Configuration.State = new ImageAppStateConfiguration();
            }

            this.ThumbNailImage = null;
            this.TilesNumInEachBlockRow = 3;
            this.TilesNumInEachBlockCol = 3;
            this.DisplayRegion = new DisplayRegionInfo();
            this.Tiles = null;

            if (this.ImageNameDigit != null)
            {
                FindImageData(this.ImageNameDigit);
            }
            else
            {
                this.ImageNameDigit = "";
                this.Rotate = 0;
                this.DisplayBlock = new DisplayBlockInfo(Section.Cols, Section.Rows);
            }
            String basePath = HttpContext.Current.Server.MapPath("~/Web/Images/images/");
            if (!Directory.Exists(basePath))
            {
                Directory.CreateDirectory(HttpContext.Current.Server.MapPath("~/Web/Images/images"));
            }
        }

        private void FindImageData(string digits)
        {
            String basePath = HttpContext.Current.Server.MapPath("~/Web/Images/images/");
            if (digits == "" || !Directory.Exists(basePath + digits))
            {
                return;
            }
            string[] lines = File.ReadAllLines(basePath + this.ImageNameDigit + "\\config.txt");
            if (lines.Length != 9)
            {
                return;
            }
            this.ImageName = lines[1];
            this.ImageNaturalWidth = Convert.ToInt32(lines[3]);
            this.ImageNaturalHeight = Convert.ToInt32(lines[4]);
            this.TileWidth = Convert.ToInt32(lines[5]);
            this.TileHeight = Convert.ToInt32(lines[6]);
            this.TileCols = Convert.ToInt32(lines[7]);
            this.TileRows = Convert.ToInt32(lines[8]);
            this.ThumbNailImage = null;
            this.Tiles = new TilesInfo[this.TileCols, this.TileRows];
            for (int i = 0; i < this.TileCols; i++)
            {
                for (int j = 0; j < this.TileRows; j++)
                {
                    this.Tiles[i, j] = new TilesInfo
                    {
                        left = i * this.TileWidth,
                        top = j * this.TileHeight,
                        cols = i,
                        rows = j
                    };
                }
            }
        }
    }

    public class ImageAppStateConfiguration
    {
        public string ImageName { get; set; }

        public string ImageNameDigit { get; set; }

        public int Rotate { get; set; }

        public DisplayBlockInfo DisplayBlock { get; set; }
    }
}