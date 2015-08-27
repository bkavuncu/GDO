using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace GDO.Apps.TimeV.Domain
{
    public class Query
    {
        public String method { get; set; }
        public List<String> fields { get; set; }
        public String conditions { get; set; }
        public List<String> groupByClause { get; set; }

        public String customQuery { get; set; }

        public String ToSQL()
        {
            if (this.method.Equals("Custom"))
            {
                return this.customQuery;
            }

            StringBuilder buf = new StringBuilder();
            buf.Append("SELECT ");
            buf.Append(String.Join(", ", fields));
            buf.Append(" FROM log WHERE ");
            buf.Append(conditions);
            if (groupByClause.Count() != 0)
            {
                buf.Append(" GROUP BY ");
                buf.Append(String.Join(", ", groupByClause));
            }

            return buf.ToString();
        }
    }
}
