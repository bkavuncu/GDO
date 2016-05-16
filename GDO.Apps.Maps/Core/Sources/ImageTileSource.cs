using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Utility;

namespace GDO.Apps.Maps.Core.Sources.Tiles
{
    public class ImageTileSource : Source
    {
        public IntegerParameter CacheSize { get; set; }
        public StringParameter CrossOrigin { get; set; }
        public BooleanParameter Opaque { get; set; }
        public StringParameter Projection { get; set; }
        public FloatArrayParameter Extent { get; set; }
        public NullableIntegerParameter MinZoom { get; set; }
        public FloatArrayParameter Origin { get; set; }
        public FloatArrayParameter Resolutions { get; set; }
        public IntegerArrayParameter TileSize { get; set; }
        public StringParameter Url { get; set; }
        public BooleanParameter WrapX { get; set; }


        new public void Init(string crossOrigin, bool opaque, string projection)
        {
            CrossOrigin = crossOrigin;
            Opaque = opaque;
            Projection = projection;

            Prepare();
        }

        new public void Prepare()
        {
            base.Prepare();
            ClassName = this.GetType().Name;
        }

        new public void Modify()
        {
        }
    }
}