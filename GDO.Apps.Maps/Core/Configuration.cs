using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Utility;
using Newtonsoft.Json;

namespace GDO.Apps.Maps.Core
{
    public class Configuration : Base
    {

        public ListParameter Layers { get; set; }
        public ListParameter Sources { get; set; }
        public ListParameter Styles { get; set; }
        public ListParameter Formats { get; set; }
        public ListParameter Datas { get; set; }
        public ListParameter Views { get; set; }

        public Configuration() : base()
        {
            ClassName.Value = this.GetType().Name;
            Description.Value = "";

            Name = new StringParameter
            {
                Name = "Name",
                Description = "Name",
                Priority = (int)GDO.Utility.Priorities.System,
                IsEditable = false,
                IsVisible = true,
                IsProperty = false,
            };

            Layers = new ListParameter
            {
                Name = "Layers",
                Description = "List of Layers",
                Priority = (int)GDO.Utility.Priorities.System,
                IsEditable = false,
                IsVisible = true,
                IsProperty = false,
                Length = 1,
                DefaultValues = new string[1],
                Values = new string[1],
            };

            Sources = new ListParameter
            {
                Name = "Sources",
                Description = "List of Sources",
                Priority = (int)GDO.Utility.Priorities.System,
                IsEditable = false,
                IsVisible = true,
                IsProperty = false,
                Length = 1,
                DefaultValues = new string[1],
                Values = new string[1],
            };

            Styles = new ListParameter
            {
                Name = "Styles",
                Description = "List of Styles",
                Priority = (int)GDO.Utility.Priorities.System,
                IsEditable = false,
                IsVisible = true,
                IsProperty = false,
                Length = 1,
                DefaultValues = new string[1],
                Values = new string[1],
            };

            Formats = new ListParameter
            {
                Name = "Formats",
                Description = "List of Formats",
                Priority = (int)GDO.Utility.Priorities.System,
                IsEditable = false,
                IsVisible = true,
                IsProperty = false,
                Length = 1,
                DefaultValues = new string[1],
                Values = new string[1],
            };

            Datas = new ListParameter
            {
                Name = "Data",
                Description = "List of Data Sources",
                Priority = (int)GDO.Utility.Priorities.System,
                IsEditable = false,
                IsVisible = true,
                IsProperty = false,
                Length = 1,
                DefaultValues = new string[1],
                Values = new string[1],
            };

            Views = new ListParameter
            {
                Name = "Views",
                Description = "List of Views",
                Priority = (int)GDO.Utility.Priorities.System,
                IsEditable = false,
                IsVisible = true,
                IsProperty = false,
                Length = 1,
                DefaultValues = new string[1],
                Values = new string[1],
            };

        }
    }
}