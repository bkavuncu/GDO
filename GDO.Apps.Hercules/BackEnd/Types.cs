using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MongoDB.Bson.Serialization.Attributes;

namespace GDO.Apps.Hercules.BackEnd
{
    //////////////////////////////////////////////////////////////////////////////////////////

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
            return string.Format("{0} Count:{1} Min:{2} Max:{3} Sum:{4} Mean:{5} Median:{6} Var:{7} SD:{8}",
                                 isEnum ? "ENUM" : "NOT-ENUM", count, min, max, sum, mean, median, variance, sd);
        }
    }

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
            return string.Format("{0}#{1} {2} {3} {5} :: {4} --> {6}",
                                 index, name, description, origin, type, disabled ? "DISABLED" : "ACTIVE", stats.ToString());
        }
    }

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
            return string.Format("{0}#{1} {2} {3} {4} {5} | {6} rows\n{7}",
                                 _id, name, description, sourceOrigin, sourceType, disabled ? "DISABLED" : "ACTIVE", nrows,
                                 Utils.Lines(fields, "\n"));
        }
    }


    public class JsonRows
    {
        public MongoDB.Bson.ObjectId _id;
        public List<dynamic[]> rows;
    }

    public class JsonDS
    {
        public JsonMiniset schema;
        public List<dynamic[]> rows;

        public override string ToString()
        {
            return string.Format("{0}\n{1}", schema.ToString(), Utils.Lines(rows, "\n\t"));
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
