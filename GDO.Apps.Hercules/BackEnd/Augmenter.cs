﻿using System;
using System.Collections.Generic;
using System.Device.Location;
using System.IO;
using System.Linq;
using System.Web;

namespace GDO.Apps.Hercules.BackEnd
{

    // PlainDS --> RichDS
    public class Augmenter
    {

        // Description of the last error generated by the methods of this class.
        private static string LastError;

        // Gets the last error generated by the methods of this class.
        public static string GetError() { return LastError; }

        //
        private Augmenter() { }

        // file --> RichDS
        public static RichDS FromFile(string path, string delimiter)
        {
            PlainDS plain = Parser.FromFile(path, delimiter);
            if (plain == null) {
                LastError = "Augmenter.FromFile: " + Parser.GetError();
                return null;
            } else {
                return FromPlain(plain);
            }
        }


        // Stream --> RichDS
        public static RichDS FromStream(Stream stream, string delimiter)
        {
            PlainDS plain = Parser.FromStream(stream, delimiter);
            if (plain == null) {
                LastError = "Augmenter.FromStream: " + Parser.GetError();
                return null;
            } else {
                return FromPlain(plain);
            }
        }


        // URL --> RichDS
        // TODO Maybe one day
        public static RichDS FromURL(string url, string delimiter)
        {
            LastError = "Augmenter.FromURL: not implemented yet!";
            return null;
        }


        // PlainDS --> RichDS
        public static RichDS FromPlain(PlainDS ds)
        {
            if (ds == null) {
                LastError = "Augmenter.FromPlain: PlainDS can't be null!";
                return null;
            }

            List<AType[]> types = new List<AType[]>(ds.NRows); // Initializeee!
            List<dynamic[]> values = new List<dynamic[]>(ds.NRows);

            for (int r = 0, nrows = ds.NRows; r < nrows; r++) { // Parse all rows.
                AType[] rtypes = new AType[ds.NHeaders];
                dynamic[] rvalues = new dynamic[ds.NHeaders];
                for (int c = 0, ncols = ds.NHeaders; c < ncols; c++) {
                    ParseOne(ds.Rows[r][c], out rtypes[c], out rvalues[c]);
                }
                types.Add(rtypes);
                values.Add(rvalues);
            }

            AType[] principals = new AType[ds.NHeaders]; // Compute principal types.
            for (int c = 0, ncols = principals.Length; c < ncols; c++) {
                principals[c] = PrincipalType(types, c);
            }

            AColumn[] cols = new AColumn[ds.NHeaders]; // Create the columns.
            for (int c = 0, ncols = cols.Length; c < ncols; c++) {
                cols[c] = new AColumn();
                cols[c].Index  = c;
                cols[c].Header = ds.Headers[c];
                cols[c].Type = principals[c];
            }

            List<dynamic[]> correct = new List<dynamic[]>(); // Prune inconsistent rows.
            for (int r = 0, nrows = ds.NRows; r < nrows; r++) {
                if (!ShouldPruneRow(types, r, principals)) {
                    correct.Add(values[r]);
                }
            }

            for (int c = 0, ncols = cols.Length; c < ncols; c++) { // Compute stats.
                cols[c].Stats = ColumnStats(values, c, cols[c].Type);
            }

            RichDS rich = new RichDS(); // We done!!!
            rich.Columns = cols;
            rich.Rows = correct;
            rich.NPruned = values.Count - correct.Count;

            return rich;
        }


        // You have some string... what is it? Assigns a type and value to it.
        public static void ParseOne(string cell, out AType type, out dynamic value)
        {
            // Integer
            long integer;
            if (long.TryParse(cell, out integer)) {
                value = (double)integer; // Still save as double... cos
                type = AType.Integral;
                return;
            }

            // Float
            double floating;
            if (double.TryParse(cell, out floating)) {
                value = floating;
                type = AType.Floating;
                return;
            }

            // Boolean
            bool boolean;
            if (bool.TryParse(cell, out boolean)) {
                value = boolean;
                type = AType.Boolean;
                return;
            }

            // DateTime
            DateTime dateTime;
            if (DateTime.TryParse(cell, out dateTime)) {
                value = dateTime.Ticks;
                type = AType.DateTime;
                return;
            }

            // GeoCoordinates
            string[] geos = cell.Split(' ', '|', ',');
            double latitude, longitude;
            if (geos.Length == 2 && double.TryParse(geos[0], out latitude) && double.TryParse(geos[1], out longitude)) {
                value = new GeoCoordinate(latitude, longitude);
                type = AType.GPSCoords;
                return;
            }

            // URL (URI)
            if (Uri.IsWellFormedUriString(cell, UriKind.Absolute)) {
                Uri uri = new Uri(cell);
                value = uri;
                type = AType.URL;
                return;
            }

            // Text
            value = cell;
            type = AType.Text;
        }


        // Infers the principal type of a list of ATypes.
        // The principal type is the type that occurs most often.
        public static AType PrincipalType(List<AType[]> types, int col)
        {
            int[] modes = new int[Enum.GetNames(typeof(AType)).Length];

            for (int r = 0, nrows = types.Count; r < nrows; r++) {
                modes[(int)types[r][col]]++;
            }

            return (AType)Utils.IndexOfMax(modes);
        }


        // Should prune row if ANY of the types are incompatible to the given type
        // types :: [rows][cols]
        // principals :: [cols]
        public static bool ShouldPruneRow(List<AType[]> types, int row, AType[] principals)
        {
            for (int c = 0, ncols = principals.Length; c < ncols; c++) {
                if (!TypesCompatible(types[row][c], principals[c])) {
                    return true;
                }
            }
            return false;
        }


        // Floating and Integer are compatible; equals types are compatible; everything else is not.
        public static bool TypesCompatible(AType fst, AType snd)
        {
            if (fst == snd)
                return true;
            if (fst == AType.Integral && snd == AType.Floating)
                return true;
            if (fst == AType.Floating && snd == AType.Integral)
                return true;

            return false;
        }


        // Compute statistics for column col
        public static AStats ColumnStats(List<dynamic[]> values, int col, AType type)
        {
            dynamic[] data = new dynamic[values.Count];

            switch (type) {
                case AType.Floating:
                case AType.Integral:
                case AType.DateTime:
                    for (int r = 0, nrows = values.Count; r < nrows; r++) {
                        data[r] = values[r][col];
                    }
                    return Stats.DynamicStats(data);

                case AType.Text:
                    for (int r = 0, nrows = values.Count; r < nrows; r++) {
                        data[r] = values[r][col].ToString().Length; // Use Length for strings.
                    }
                    return Stats.DynamicStats(data);

                case AType.GPSCoords:
                case AType.URL:
                case AType.Boolean:
                case AType.Unknown:
                    return new AStats();
            }

            return new AStats();
        }
    }
}





//// Integer and Floating unify into Floating; equal types unify into themselves, everything else unifies to Text.
//public static AType UnifyTypes(AType fst, AType snd)
//{
//    if (fst == AType.Floating && snd == AType.Integral)
//        return AType.Floating;
//    if (fst == AType.Integral && snd == AType.Floating)
//        return AType.Floating;
//    if (fst == snd)
//        return fst;

//    return AType.Text;
//}



//// You have many strings... what are they? Assigns types and values to them.
//// data, types and values must have the same Length, otherwise bad things happen.
//public static void ParseMany(string[] data, AType[] types, dynamic[] values)
//{
//    for (int i = 0, len = data.Length; i < len; i++) {
//        ParseOne(data[i], out types[i], out values[i]);
//    }
//}

// Infers the principal type of a list of ATypes.
// The principal type is the type that occurs most often.
//public static AType PrincipalType(AType[] types)
//{
//    int[] modes = new int[Enum.GetNames(typeof(AType)).Length];

//    foreach (AType type in types) {
//        modes[(int)type]++;
//    }

//    return (AType)Utils.IndexOfMax(modes);
//}