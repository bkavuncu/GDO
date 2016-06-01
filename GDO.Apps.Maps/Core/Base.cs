﻿using System;
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
    public abstract class Base
    {
        [JsonProperty(Order = -2)]
        public IntegerParameter Id { get; set; }

        [JsonProperty(Order = -2)]
        public StringParameter Name { get; set; }

        [JsonProperty(Order = -2)]
        public StringParameter ClassName { get; set; }

        [JsonProperty(Order = -2)]
        public StringParameter ObjectType { get; set; }

        public Base()
        {
            Id = new IntegerParameter
            {
                Name = "Id",
                Description = "Id",
                Priority = (int) GDO.Utility.Priorities.Required,
                IsEditable = false,
                IsVisible = true,
                IsProperty = false,
            };

            Name = new StringParameter
            {
                Name = "Name",
                Description = "Name of the Parameter",
                Priority = (int) GDO.Utility.Priorities.Required,
                IsEditable = true,
                IsVisible = true,
                IsProperty = false,
            };

            ClassName = new StringParameter
            {
                Name = "Class Name",
                Description = "Name of the Class",
                Priority = (int) GDO.Utility.Priorities.Required,
                IsEditable = false,
                IsVisible = true,
                IsProperty = false,
            };

            ObjectType = new StringParameter
            {
                Name = "Type",
                Description = "Type of JS Object",
                Priority = (int) GDO.Utility.Priorities.Required,
                IsEditable = false,
                IsVisible = false,
                IsProperty = false,
            };
        }
    }
}