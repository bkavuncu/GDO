using System.IO;
using System.Web;
using GDO.Core;

namespace GDO.Apps.Images
{
    enum Mode
    {
        // ReSharper disable once InconsistentNaming
        FILL = 1,
        // ReSharper disable once InconsistentNaming
        FIT = 0
    };
    public class ImagesApp : IAppInstance
    {
        public int Id { get; set; }
        public string AppName { get; set; }
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
        public BlockRegionInfo[,] BlockRegion { get; set; }

        public void init(int instanceId, string appName, Section section, AppConfiguration configuration)
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