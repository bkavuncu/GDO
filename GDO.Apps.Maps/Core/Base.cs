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

        //[JsonProperty(Order = -2)]
        //public List<string> Editables { get; set; } = new List<string>();

        /*public void AddtoEditables<T>(Expression<Func<T>> expr)
        {
            var body = ((MemberExpression)expr.Body);
            Editables.Add(body.Member.Name);
        }*/

        public void Prepare()
        {
            Id = new IntegerParameter
            {
                Name = "Id",
                Description = "Id",
                Priority = (int) GDO.Utility.Priorities.Normal,
                VisualisationType = (int) GDO.Utility.VisualisationTypes.Number,
                IsEditable = false,
                IsVisible = true
            };

            Name = new StringParameter
            {
                Name = "Name",
                Description = "Name of the Parameter",
                Priority = (int)GDO.Utility.Priorities.Normal,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.String,
                IsEditable = false,
                IsVisible = true
            };

            ClassName = new StringParameter
            {
                Name = "ClassName",
                Description = "Name of the Class",
                Priority = (int)GDO.Utility.Priorities.Normal,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.String,
                IsEditable = false,
                IsVisible = true
            };

            Type = new IntegerParameter
            {
                Name = "Type",
                Description = "Type",
                Priority = (int)GDO.Utility.Priorities.Normal,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Number,
                IsEditable = false,
                IsVisible = false
            };
        }
    }
}