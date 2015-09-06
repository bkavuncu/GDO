using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Web;

namespace GDO.Apps.SmartCity.Core
{
    public class Base
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string ClassName { get; set; }
        public int? Type { get; set; }
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