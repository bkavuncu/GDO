using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core
{
    public enum SourceTypes
    {
        None = -1,
        Base = 0,
        BingMaps = 1,
        CartoDB = 30,
        Cluster = 2,
        Image = 3,
        ImageCanvas = 4,
        ImageMapGuide = 6,
        ImageStatic = 7,
        ImageVector = 8,
        ImageWMS = 9,
        MapQuest = 10,
        OSM = 11,
        Raster = 12,
        Source = 14,
        Stamen = 15,
        Tile = 16,
        TileArcGISRest = 17,
        TileDebug = 18,
        TileEvent = 19,
        TileImage = 20,
        TileJSON = 21,
        TileUTFGrid = 22,
        VectorTile = 23,
        TileWMS = 24,
        Vector = 25,
        WMTS = 27,
        XYZ = 28,
        Zoomify = 29
    };
    public class Source : Base
    {
        public Source()
        {
            ClassName.Value = this.GetType().Name;
        }
    }
}