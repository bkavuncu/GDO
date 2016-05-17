using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Apps.Maps.Core.Sources;
using GDO.Utility;

namespace GDO.Apps.Maps.Core.Sources
{
    public class Zoomify : ImageTileSource
    {
        public IntegerArrayParameter Size { get; set; }
        public StringArrayParameter TierSizeCalculation { get; set; }

        public Zoomify()
        {
            ClassName.Value = this.GetType().Name;

            Size = new IntegerArrayParameter
            {
                Name = "Size",
                Description = "Size of the image.",
                Priority = (int)GDO.Utility.Priorities.Required,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Array,
                IsEditable = false,
                IsVisible = true,
                Length = 2,
            };

            TierSizeCalculation = new StringArrayParameter
            {
                Name = "Tier Size Calculation",
                Description = "Tier size calculation method",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.String,
                IsEditable = false,
                IsVisible = true,
                DefaultValues = new string[2] {"default", "truncated"}
            };
        }
    }
}