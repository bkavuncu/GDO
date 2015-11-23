using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;

namespace GDO.Apps.Hercules.BackEnd.New
{
    //////////////////////////////////////////////////////////////////////////////////////////

    public struct JsonStats
    {
        dynamic min;
        dynamic max;
        dynamic mean;
        dynamic median;
        dynamic variance;
        dynamic stdDev;
        bool isEnum;
    }

    public struct JsonField
    {
        string name;
        string description;
        string type;
        string origin;
        bool disabled;
        JsonStats stats;
    }

    public struct JsonMS
    {
        string name;
        string description;
        int id;
        int nrows;
        string sourceType;
        string sourceOrigin;
        bool disabled;
        JsonField[] fields;
    }

    public struct JsonDS
    {
        JsonMS schema;
        List<dynamic[]> rows;
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

    public struct Stats
    {
        dynamic Min, Max;
        int Count;
        Dictionary<dynamic, int> Modes;
        bool Enum;
        double Sum, Mean, Median, Variance, StdDev;
    }

    public struct AColumn
    {
        AType Type;
        Stats<dynamic> Stats;
        string Header;
        int Number;
    }

    public struct PlainDS
    {
        List<string[]> Rows;
        int NRows;
        Dictionary<long, string> Malformed;
        int NMalformed;
    }

    public struct RichDS
    {
        List<dynamic> Rows;
        List<AType> Types;
        List<AColumn> Columns;
        int NColumns;
        int NRows;
        int NPruned;
    }

    //////////////////////////////////////////////////////////////////////////////////////////

    public class DS
    {

        public static PlainDS PlainFromStream(Stream stream, string delimiter)
        {
            return new PlainDS();
        }

        public static PlainDS PlainFromString(string data, string delimiter)
        {
            return new PlainDS();
        }

        public static PlainDS PlainFromURL(string url, string delimiter)
        {
            return new PlainDS();
        }

        public static PlainDS PlainFromFile(string path, string delimiter)
        {
            return new PlainDS();
        }


        public static RichDS RichFromStream(Stream stream, string delimiter)
        {
            return new RichDS();
        }

        public static RichDS RichFromString(string data, string delimiter)
        {
            return new RichDS();
        }

        public static RichDS RichFromFile(string path, string delimiter)
        {
            return new RichDS();
        }

        public static RichDS RichFromURL(string url, string delimiter)
        {
            return new RichDS();
        }

        public static RichDS RichFromPlain(Stream stream, string delimiter)
        {
            return new RichDS();
        }

        public static JsonDS JsonFromRich(RichDS rich)
        {
            return new JsonDS();
        }

    }
}