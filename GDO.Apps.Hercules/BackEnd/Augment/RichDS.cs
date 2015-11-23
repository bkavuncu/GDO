using GDO.Apps.Hercules.BackEnd.Parser;
using System;
using System.Collections.Generic;
using System.IO;
using System.Device.Location;
using Newtonsoft.Json;


namespace GDO.Apps.Hercules.BackEnd.Augment
{

    public class RichDS
    {

        private List<dynamic[]> Rows     = null;
        private List<AType[]>   Types    = null;
        private AColumn[]       AColumns = null;

        private int NColumns = 0;
        private int NRows = 0;

        private int NPruned = 0;

        private List<long> MalformedLines = new List<long>();


        private ParserSSV Parser = null;


        private RichDS(ParserSSV parser)
        {
            Parser = parser;
        }


        public static RichDS FromFile(string path, string delimiter)
        {
            return new RichDS(ParserSSV.FromFile(path, delimiter));
        }

        public static RichDS FromStream(Stream stream, string delimiter, long lines)
        {
            return new RichDS(ParserSSV.FromStream(stream, delimiter, lines));
        }


        public bool Begin()
        {
            Utils.Say("Begin...");
            string[] row = null;
            if (Parser.HasData()) {
                if ((row = Parser.ParseHeaders()) == null) {
                    Utils.Say("Failed to parse the headers!");
                    return false;
                } else {
                    Initialize(row); // We got the headers, that's a start, initialize stuff.
                    Utils.Say("Parsing...");
                    while (Parser.HasData()) { // Now continue with the rowss
                        if ((row = Parser.ParseRow()) != null) {
                            if (row.Length != NColumns) {
                                MalformedLines.Add(Parser.GetRowNumber());
                                //Parser.AddMalformed(Parser.GetRowNumber(), "Inconsistent number of cells!");
                            } else {
                                AddRow(row); // -1 To account for headers
                            }
                        }
                    }
                    Augment();
                }
            } else {
                Utils.Say("Parser has no data!");
                return false;
            }
            Utils.Say("Finished.");
            return true;
        }


        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ////  FIRST PASS  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


        // Now that we have the headers we can initialize this class's fields.
        private void Initialize(string[] headers)
        {
            Utils.Say("Initialize...");

            NColumns = headers.Length;

            AColumns = new AColumn[NColumns];
            for (int i = 0; i < NColumns; i++) {
                AColumns[i] = new AColumn(headers[i], i);
            }

            Rows = new List<dynamic[]>();
            Types = new List<AType[]>(); 

            Utils.Say("Initialized {0} columns", NColumns);
        }


        private void AddRow(string[] cells)
        {
            AType[] types = new AType[NColumns];
            dynamic[] values = new dynamic[NColumns];

            for (int col = 0; col < NColumns; col++) {
                ParseCell(cells[col], out types[col], out values[col]);
            }

            Types.Add(types);
            Rows.Add(values);
        }


        public static void ParseCell(string cell, out AType type, out dynamic value)
        {
            // Integer
            long integer;
            if (long.TryParse(cell, out integer)) {
                value = (double) integer; // Still save as double... cos
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


        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ////  SECOND PASS  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


        private void Augment()
        {
            NRows = Rows.Count; // Now we know

            Utils.Say("Parsed {0} rows.", NRows);

            InferTypes();
            PruneRows();
            ComputeStats();
        }


        // Now that all the rows have been parsed, it's time to figure out the types.
        private void InferTypes()
        {
            Utils.Say("Inferring types...");

            for (int col = 0; col < NColumns; col++) {
                TypeColumn(col);
            }

            Utils.Say("Types inferred.");
        }


        // Figure out column type modes and principal type
        private void TypeColumn(int col)
        {
            AType[] types = new AType[NRows];

            int[] modes = new int[(int)AType.Unknown]; // Which type appears the most?
            foreach (AType[] row in Types)
                modes[(int)row[col]]++;
            
            bool integer  = modes[(int)AType.Integral] > 0;
            bool floating = modes[(int)AType.Floating] > 0;

            AType type = (AType)Utils.IndexOfMax(modes);
            if (type == AType.Integral && floating || type == AType.Floating && integer)
                type = AType.Floating;

            AColumns[col].Type = type;
        }


        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ////  THRID PASS  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


        // Prune rows with conflicting types.
        private void PruneRows()
        {
            Utils.Say("Pruning rows...");

            List<dynamic[]> values = new List<dynamic[]>(NRows);

            for (int row = 0; row < NRows; row++) {
                if (!ShouldPruneRow(Types[row])) 
                    values.Add(Rows[row]);
                else 
                    NPruned++;
            }

            Rows = values; // Only care about valid rows
            NRows -= NPruned;
            Types = null; // Don't need the types any more

            Utils.Say("{0} rows pruned.", NPruned);
        }

        // If any cell in any rows doesn't agree with the principal type, that row is removed.
        private bool ShouldPruneRow(AType[] row)
        {
            for (int col = 0; col < NColumns; col++)  // Check that row is fine 
                if (!TypesCompatible(row[col], AColumns[col].Type))
                    return true;

            return false;
        }

        // Floating and Integers are compatible; equals types are compatible. Everything else is not.
        private bool TypesCompatible(AType fst, AType snd)
        {
            if (fst == snd)
                return true;
            if (fst == AType.Integral && snd == AType.Floating)
                return true;
            if (fst == AType.Floating && snd == AType.Integral)
                return true;

            return false;
        }


        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ////  FOURTH PASS  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


        // Only once Rows have been pruned, can we safely compute stats about the column.
        private void ComputeStats()
        {
            Utils.Say("Computing stats...");

            dynamic[] values = new dynamic[NRows]; // Column of values

            for (int col = 0; col < NColumns; col++) {
                switch (AColumns[col].Type) {
                    case AType.Floating:
                    case AType.Integral:
                    case AType.DateTime:    
                        for (int row = 0; row < NRows; row++) {
                            values[row] = Rows[row][col];
                        }
                        AColumns[col].Stats = Stats<dynamic>.DynamicStats(values, true, true);
                        break;
                    case AType.Text:
                        for (int row = 0; row < NRows; row++) {
                            values[row] = Rows[row][col].Length; // Use Length for strings...
                        }
                        AColumns[col].Stats = Stats<dynamic>.DynamicStats(values, true, true);
                        break;
                    case AType.GPSCoords:
                    case AType.URL:
                    case AType.Boolean:
                    case AType.Unknown:
                        AColumns[col].Stats = Stats<dynamic>.DynamicStats(values, false, false);
                        break;
                }
            }

            Utils.Say("Stats computed...");
        }


        //
        public void Serialize(string path)
        {
            
        }

        
        //
        public void Print()
        {
            for (int i = 0;  i < NColumns; i++) {
                Utils.Say("*********************************************************************************");
                Utils.Say(AColumns[i].ToString());
            }
            //System.Console.WriteLine(AColumns.ToString());
        }
    }
}
