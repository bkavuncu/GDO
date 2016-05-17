using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Web;
using Newtonsoft.Json;
using GDO.Utility;

namespace GDO.Apps.Maps.Core
{
    public class Base
    {
        [JsonProperty(Order = -2)]
        public IntegerParameter Id { get; set; }

        [JsonProperty(Order = -2)]
        public StringParameter Name { get; set; }

        [JsonProperty(Order = -2)]
        public StringParameter ClassName { get; set; }

        [JsonProperty(Order = -2)]
        public IntegerParameter Type { get; set; }

        public Base()
        {
            Id = new IntegerParameter
            {
                Name = "Id",
                Description = "Id",
                Priority = (int)GDO.Utility.Priorities.Required,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Integer,
                IsEditable = false,
                IsVisible = true,
            };

            Name = new StringParameter
            {
                Name = "Name",
                Description = "Name of the Parameter",
                Priority = (int)GDO.Utility.Priorities.Required,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.String,
                IsEditable = true,
                IsVisible = true,
            };

            ClassName = new StringParameter
            {
                Name = "Class Name",
                Description = "Name of the Class",
                Priority = (int)GDO.Utility.Priorities.Required,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.String,
                IsEditable = false,
                IsVisible = true,
            };

            Type = new IntegerParameter
            {
                Name = "Type",
                Description = "Type",
                Priority = (int) GDO.Utility.Priorities.Required,
                VisualisationType = (int) GDO.Utility.VisualisationTypes.Integer,
                IsEditable = false,
                IsVisible = false,
            };
        }
}