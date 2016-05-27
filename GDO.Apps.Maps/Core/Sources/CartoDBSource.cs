using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Security.Principal;
using System.Web;
using GDO.Utility;

namespace GDO.Apps.Maps.Core.Sources
{
    public class CartoDBSource : XYZSource
    {
        public StringParameter Config { get; set; }
        public StringParameter Account { get; set; }

        public CartoDBSource()
        {
            ClassName.Value = this.GetType().Name;
            Type.Value = (int)SourceTypes.CartoDB;

            Config = new StringParameter
            {
                Name = "Config",
                Description = "If using anonymous maps, the CartoDB config to use. See http://docs.cartodb.com/cartodb-platform/maps-api/anonymous-maps/ for more detail. If using named maps, a key-value lookup with the template parameters. See http://docs.cartodb.com/cartodb-platform/maps-api/named-maps/ for more detail.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.JSON,
                IsEditable = false,
                IsVisible = true,
            };

            Account = new StringParameter
            {
                Name = "Account",
                Description = "CartoDB account name",
                Priority = (int)GDO.Utility.Priorities.Required,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.String,
                IsEditable = false,
                IsVisible = true,
            };
        }

    }
}