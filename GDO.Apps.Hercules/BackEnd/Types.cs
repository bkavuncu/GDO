using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MongoDB.Bson.Serialization.Attributes;

namespace GDO.Apps.Hercules.BackEnd
{
    // Field statistics.
    public class JsonStats
    {
        public dynamic min;
        public dynamic max;
        public dynamic mean;
        public dynamic median;
        public dynamic variance;
        public dynamic sd;
        public dynamic sum;
        public int count;
        public bool isEnum;

        public override string ToString()
        {
            return string.Format("{0,-8} Count:{1,-20} Min:{2,-20} Max:{3,-20} Sum:{4,-20} Mean:{5,-20} Median:{6,-20} Var:{7,-20} SD:{8,-20}", isEnum ? "ENUM" : "NOT-ENUM", count.ToString("0.00"), min.ToString("0.00"), max.ToString("0.00"), sum.ToString("0.00"), mean.ToString("0.00"), median.ToString("0.00"), variance.ToString("0.00"), sd.ToString("0.00"));
        }

        public JsonStats clone()
        {
            return new JsonStats { min = min, max = max, mean = mean, median = median, variance = variance, sd = sd, sum = sum, count = count, isEnum = isEnum };
        }
    }

    // One field in a dataset.
    public class JsonField
    {
        public string name;
        public int index;
        public string description;
        public string type;
        public string origin;
        public bool disabled;
        public JsonStats stats;

        public override string ToString()
        {
            return string.Format("{0,3}#{1,23} {2} {3} {5,8} :: {4,10} --> {6}", index, name, description, origin, type, disabled ? "DISABLED" : "ACTIVE", stats.ToString());
        }

        public JsonField clone()
        {
            return new JsonField { name = name, index = index, description = description, type = type, origin = origin, disabled = disabled, stats = stats.clone() };
        }

        public bool isNumeric()
        {
            return type.Equals("Integral") || type.Equals("Floating") || type.Equals("DateTime");
        }
    }

    // The miniset: metadata on the fields.
    public class JsonMiniset
    {
        public string name;
        public string description;
        public int nrows;
        public string sourceType;
        public string sourceOrigin;
        public bool disabled;
        public JsonField[] fields;
        public MongoDB.Bson.ObjectId _id;

        public override string ToString()
        {
            return string.Format("{0} | {1} | {2} rows | {3} | {4} | {5} | {6}\n{7}", name, _id, nrows, description, sourceOrigin, sourceType, disabled ? "DISABLED" : "ACTIVE", Utils.Lines(fields, "\n"));
        }

        public JsonMiniset clone()
        {
            return new JsonMiniset { name = name, description = description, nrows = nrows, sourceType = sourceType, sourceOrigin = sourceOrigin, disabled = disabled, fields = fields.Select(f => f.clone()).ToArray(), _id = _id };
        }
    }

    // Just the tabular data.
    public class JsonRows
    {
        public MongoDB.Bson.ObjectId _id;
        public List<dynamic[]> rows;
    }

    // Dataset: rows + miniset.
    public class JsonDS
    {
        public JsonMiniset schema;
        public List<dynamic[]> rows;

        public override string ToString()
        {
            return string.Format("{0}\n{1}\t\t", schema.ToString(), Utils.Lines(rows, "\n"));
        }

        public Dictionary<string, int> getFieldIndexMap()
        {
            Dictionary<string, int> map = new Dictionary<string, int>();
            JsonField[] fields = schema.fields;
            for (int i = 0; i < fields.Length; i++)
            {
                JsonField f = fields[i];
                map.Add(f.name, i);
            }

            return map;
        }

        private JsonField findField(string fieldName)
        {
            foreach (JsonField field in schema.fields) {
                if (field.name.Equals(fieldName)) {
                    return field;
                }
            }
            return null;
        }

        public JsonDS filter(JsonFilter filter)
        {
            JsonField field = findField(filter.fieldName);
            if (field == null) {
                throw new Exception(string.Format("JsonDS.field: this JsonDS does not contain field name {0}.", filter.fieldName));
            }

            JsonDS ds = new JsonDS();
            ds.schema = schema.clone();
            ds.rows = new List<dynamic[]>();

            if (field.isNumeric()) {
                foreach (dynamic[] row in this.rows) {
                    dynamic value = row[field.index];
                    if (value >= filter.min && value <= filter.max) {
                        ds.rows.Add(row);
                    }
                }
            } else if (field.type.Equals("Text")) {
                foreach (dynamic[] row in this.rows) {
                    dynamic value = row[field.index].Length;
                    if (value >= filter.min || value <= filter.max) {
                        ds.rows.Add(row);
                    }
                }
            } else {
                foreach (dynamic[] row in this.rows) {
                    dynamic value = row[field.index];
                    ds.rows.Add(row);
                }
            }

            return ds;
        }
    }

    public class JsonFilter
    {
        public string fieldName;
        public dynamic min;
        public dynamic max;
    }

    //////////////////////////////////////////////////////////////////////////////////////////

    public enum AType
    {
        Text,
        Integral,
        Floating,
        DateTime,
        GPSCoords,
        URL,
        Boolean,
        Unknown
    }

    public class AStats
    {
        public dynamic Min = 0, Max = 0;
        public int Count = 0;
        public Dictionary<dynamic, int> Modes = new Dictionary<dynamic, int>();
        public bool Enum = false;
        public double Sum = 0, Mean = 0, Median = 0, Variance = 0, StdDev = 0;
    }

    public class AColumn
    {
        public AType Type = AType.Unknown;
        public AStats Stats = new AStats();
        public string Header = "";
        public int Index = 0;
    }

    public class PlainDS
    {
        public string[] Headers = new string[0];
        public int NHeaders { get { return Headers.Length; } }

        public List<string[]> Rows = new List<string[]>();
        public int NRows { get { return Rows.Count; } }

        public Dictionary<long, string> Malformed = new Dictionary<long, string>();
        public int NMalformed { get { return Malformed.Count; } }
    }

    public class RichDS
    {
        public List<dynamic[]> Rows = new List<dynamic[]>();
        public int NRows { get { return Rows.Count; } }

        public AColumn[] Columns = new AColumn[0];
        public int NColumns { get { return Columns.Length; } }

        public int NPruned = 0;
    }
}
