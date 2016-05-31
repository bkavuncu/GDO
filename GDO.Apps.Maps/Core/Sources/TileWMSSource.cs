using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Apps.Maps.Core.Sources;
using GDO.Utility;

namespace GDO.Apps.Maps.Core.Sources
{
    public class TileWMSSource : ImageTileSource
    {
        public JSONParameter Params { get; set; }
        public NullableIntegerParameter Gutter { get; set; }
        public BooleanParameter Hidpi { get; set; }
        public DatalistParameter ServerType { get; set; }

        public TileWMSSource()
        {
            ClassName.Value = this.GetType().Name;
            Type.Value = (int)SourceTypes.TileWMS;

            Params = new JSONParameter
            {
                Name = "Parameters",
                Description = "WMS request parameters. At least a LAYERS param is required. STYLES is '' by default. VERSION is 1.3.0 by default. WIDTH, HEIGHT, BBOX and CRS (SRS for WMS version < 1.3.0) will be set dynamically.",
                Priority = (int)GDO.Utility.Priorities.Required,
                IsEditable = false,
                IsVisible = true,
            };

            Gutter = new NullableIntegerParameter
            {
                Name = "Gutter",
                Description = "The size in pixels of the gutter around image tiles to ignore. By setting this property to a non-zero value, images will be requested that are wider and taller than the tile size by a value of 2 x gutter. Defaults to zero. Using a non-zero value allows artifacts of rendering at tile edges to be ignored. If you control the WMS service it is recommended to address artifacts at tile edges issues by properly configuring the WMS service.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true,
            };

            Hidpi = new BooleanParameter
            {
                Name = "Hidpi",
                Description = "Use the ol.Map#pixelRatio value when requesting the image from the remote server.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true,
            };

            ServerType = new DatalistParameter
            {
                Name = "Server Type",
                Description = "The type of the remote WMS server. Currently only used when hidpi is true.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true,
                DefaultValues = new string[4] {"carmentaserver","geoserver","mapserver","qgis"},
            };
        }
    }
}