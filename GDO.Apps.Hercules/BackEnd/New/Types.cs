using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GDO.Apps.Hercules.BackEnd.New
{
    //////////////////////////////////////////////////////////////////////////////////////////

    public class JsonStats
    {
        public dynamic min;
        public dynamic max;
        public dynamic mean;
        public dynamic median;
        public dynamic variance;
        public dynamic sum;
        public dynamic sd;
        public int count;
        public bool isEnum;
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
    }

    public class JsonMiniset
    {
        public string name;
        public string description;
        public int id;
        public int nrows;
        public string sourceType;
        public string sourceOrigin;
        public bool disabled;
        public JsonField[] fields;
    }

    public class JsonDS
    {
        public JsonMiniset schema;
        public List<dynamic[]> rows;
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
