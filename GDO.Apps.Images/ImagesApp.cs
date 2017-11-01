using System.IO;
using System.Web;
using GDO.Core;
using GDO.Core.Apps;
using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json.Linq;

namespace GDO.Apps.Images
{
    public class ImagesAppConfig : AppJsonConfiguration {
        public string ImageName;
        public string ImageNameDigit;
        public int Rotate;
        public DisplayBlockInfo DisplayBlock;
        public DisplayRegionInfo DisplayRegion;
    }
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

        #region config

        public ImagesAppConfig Configuration;
        public IAppConfiguration GetConfiguration() {
            return Configuration;
        }

        public bool SetConfiguration(IAppConfiguration config) {
            if (config is ImagesAppConfig) {
                Configuration = (ImagesAppConfig) config;
                // todo signal update of config status
                return true;
            }

            Configuration = (ImagesAppConfig) GetDefaultConfiguration();
            return false;
        }

        public IAppConfiguration GetDefaultConfiguration() {
            return new ImagesAppConfig { Name = "Default", Json = new JObject()};
        }

        #endregion 

        public Section Section { get; set; }

        public bool IntegrationMode { get; set; }
        public ICompositeAppInstance ParentApp { get; set; }
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

        public void Init()
        {
            this.DisplayMode = (int)Mode.FIT;

            this.ThumbNailImage = null;
            this.TilesNumInEachBlockRow = 3;
            this.TilesNumInEachBlockCol = 3;
            this.Tiles = null;

            if (this.Configuration.ImageNameDigit != null)
            {
                FindImageData(this.Configuration.ImageNameDigit);
            }
            else
            {
                this.Configuration.ImageNameDigit = "";
                this.Configuration.Rotate = 0;
                this.Configuration.DisplayRegion = new DisplayRegionInfo();
                this.Configuration.DisplayBlock = new DisplayBlockInfo(Section.Cols, Section.Rows);
            }
            String basePath = HttpContext.Current.Server.MapPath("~/Web/Images/images/");
            if (!Directory.Exists(basePath))
            {
                Directory.CreateDirectory(basePath);
            }
        }

        private void FindImageData(string digits)
        {
            String basePath = HttpContext.Current.Server.MapPath("~/Web/Images/images/");
            if (digits == "" || !Directory.Exists(basePath + digits))
            {
                return;
            }
            string[] lines = File.ReadAllLines(basePath + this.Configuration.ImageNameDigit + "\\config.txt");
            if (lines.Length != 9)
            {
                return;
            }
            this.Configuration.ImageName = lines[1];
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

        public List<string> GetDatabase() {
            string database_path = HttpContext.Current.Server.MapPath("~/Web/Images/Images/Database.txt");
            if (File.Exists(database_path)) {
                return File.ReadAllLines(database_path).Where(l => !string.IsNullOrWhiteSpace(l)).ToList();
            }
            return new List<string>();
        }
    }
}