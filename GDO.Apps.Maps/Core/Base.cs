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
        public int Id { get; set; }
        [JsonProperty(Order = -2)]
        public string Name { get; set; }
        [JsonProperty(Order = -2)]
        public string ClassName { get; set; }
        [JsonProperty(Order = -2)]
        public int? Type { get; set; }
        [JsonProperty(Order = -2)]
        public List<string> Editables { get; set; } = new List<string>();

        public void AddtoEditables<T>(Expression<Func<T>> expr)
        {
            var body = ((MemberExpression)expr.Body);
            Editables.Add(body.Member.Name);
        }

        public void Prepare()
        {

        }
    }
}