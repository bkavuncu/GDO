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
        Cluster = 2,
        Image = 3,
        ImageCanvas = 4,
        ImageEvent = 5,
        ImageMapGuide = 6,
        ImageStatic = 7,
        ImageVector = 8,
        ImageWMS = 9,
        MapQuest = 10,
        OSM = 11,
        Raster = 12,
        RasterEvent = 13,
        Source = 14,
        Stamen = 15,
        Tile = 16,
        TileArcGISRest = 17,
        TileDebug = 18,
        TileEvent = 19,
        TileImage = 20,
        TileJSON = 21,
        TileUTFGrid = 22,
        TileVector = 23,
        TileWMS = 24,
        Vector = 25,
        VectorEvent = 26,
        WMTS = 27,
        XYZ = 28,
        Zoomify = 29
    };
    public class Source : Base
    {
        public Source()
        {

        }
        public void Init(int id, string name, int type)
        {
            Id = id;
            Name = name;
            Type = type;

            Prepare();
        }

        new public void Prepare()
        {
            ClassName = this.GetType().Name;

            //AddtoEditables(() => Id);
            AddtoEditables(() => Name);
            //AddtoEditables(() => Type);
        }

        public void Modify(int id, string name, int type)
        {
            Id = id;
            Name = name;
            Type = type;
        }
    }
}