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
        public JSONParameter Config { get; set; }
        public StringParameter Account { get; set; }

        public CartoDBSource()
        {
            ClassName.Value = this.GetType().Name;
            ObjectType.Value = "ol.source.CartoDB";
            Description.Value = "Layer source for the CartoDB tiles.";

            Config = new JSONParameter
            {
                Name = "Config",
                PropertyName = "config",
                Description = "If using anonymous maps, the CartoDB config to use. See http://docs.cartodb.com/cartodb-platform/maps-api/anonymous-maps/ for more detail. If using named maps, a key-value lookup with the template parameters. See http://docs.cartodb.com/cartodb-platform/maps-api/named-maps/ for more detail.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true,
            };

            Account = new StringParameter
            {
                Name = "Account",
                PropertyName = "account",
                Description = "CartoDB account name",
                Priority = (int)GDO.Utility.Priorities.Required,
                IsEditable = false,
                IsVisible = true,
            };
        }

    }
}