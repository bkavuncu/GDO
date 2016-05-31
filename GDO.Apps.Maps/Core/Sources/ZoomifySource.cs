using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Apps.Maps.Core.Sources;
using GDO.Utility;

namespace GDO.Apps.Maps.Core.Sources
{
    public class ZoomifySource : ImageTileSource
    {
        public IntegerArrayParameter Size { get; set; }
        public DatalistParameter TierSizeCalculation { get; set; }

        public ZoomifySource()
        {
            ClassName.Value = this.GetType().Name;
            Type.Value = (int)SourceTypes.Zoomify;

            Size = new IntegerArrayParameter
            {
                Name = "Size",
                Description = "Size of the image (Width,Height).",
                Priority = (int)GDO.Utility.Priorities.Required,
                IsEditable = false,
                IsVisible = true,
                Length = 2,
            };

            TierSizeCalculation = new DatalistParameter
            {
                Name = "Tier Size Calculation",
                Description = "Tier size calculation method",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true,
                DefaultValues = new string[2] {"default", "truncated"}
            };
        }
    }
}