namespace GDO.Apps.Images { 
    public class DisplayRegionInfo {
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

    public class BlockRegionInfo {
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

    public class DisplayTileInfo {
        public DisplayTileInfo() {
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

    public class TilesInfo {
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

    public class CanvasDataInfo {
        public double left { get; set; }
        public double top { get; set; }
        public double width { get; set; }
        public double height { get; set; }
    }

    public class CropboxDataInfo {
        public double left { get; set; }
        public double top { get; set; }
        public double width { get; set; }
        public double height { get; set; }
    }

    public class ImageDataInfo {
        public double left { get; set; }
        public double top { get; set; }
        public double width { get; set; }
        public double height { get; set; }
        public double aspectRatio { get; set; }
        public double naturalHeight { get; set; } // natural size of the thumbnail image not the origin one on Control Panel
        public double naturalWidth { get; set; }
        public double rotate { get; set; }
    }

    public class ThumbNailImageInfo {
        public ImageDataInfo imageData { get; set; }
        public CropboxDataInfo cropboxData { get; set; }
        public CanvasDataInfo canvasData { get; set; }
    }
}