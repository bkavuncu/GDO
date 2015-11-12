using DP.src.Parser;
using System;
using System.Collections.Generic;
using System.IO;
using System.Device.Location;
//using Newtonsoft.Json;


namespace DP.src.Augment
{

    public class RichDS
    {

        // A matrix of dynamic values. This is a 1-to-1 mapping of the dataset into 
        // memory. The matrix is stored into *columns*, s.t.: v = Values[column][row].
        private dynamic[][] Values = null;

        // A matrix of augmented types. This has a 1-to-1 mapping with Values. i.e.
        // for each value in Values, its type is in Types.
        // The matrix is stored into *columns*, s.t.: t = types[column][row].
        private AType[][] Types = null;

        // The Augmented Columns.
        private AColumn[] AColumns = null;

        // Shortcut for the number of columns.
        private long NColumns = 0;

        // The parser that will be used to read the rows.
        private ParserSSV Parser = null;

        // Shortcut for the number of rows.
        private long NRows = 0;

        // How many rows have been pruned
        private long PrunedRows = 0;

        // This becomes true only after/if at least the headers have been parsed correctly.
        //private bool Alright = false;


        // Can't make these directly, use WithParser, FromFile and FromStream instead.
        private RichDS(ParserSSV parser)
        {
            Parser = parser;
        }


        // Given a Parser, returns a new RichDS that will use it to parse and augment the data.
        // Throws NullPointerException if the Parser is null.
        public static RichDS WithParser(ParserSSV parser)
        {
            if (parser == null) {
                throw new ArgumentNullException("Cannot create a RichDS with a NULL Parser!");
            }
            return new RichDS(parser);
        }


        // Creates a Rich Dataset from the given file. Calls ParserSSV.FromFile.
        // See documentation for ParserSSV.FromFile to see when this will be successfull.
        public static RichDS FromFile(string path, string delimiter)
        {
            return WithParser(ParserSSV.FromFile(path, delimiter));
        }


        // Creates a Rich Dataset from the given stream. Calls ParserSSV.FromStream.
        // See documentation for ParserSSV.FromFile to see when this will be successfull.
        public static RichDS FromFile(Stream stream, string delimiter, long lines)
        {
            return WithParser(ParserSSV.FromStream(stream, delimiter, lines));
        }


        // So it begins. The parser is set, we are ready to go and hopefully not crash.
        // This function may take many seconds to return, depending on how big the file 
        // being parsed is. 
        // Eventually, this function returns true if everything went alright and we can
        // Serialize the AColumns into a JSON. If it returns false it means that the 
        // parser was not setup correctly. This function also returns false 
        // if the first line read by the parser is malformed. That line are the headers 
        // and if we can't parse the headers then we may as well give up on life.
        // Errors can be retrieved via GetMalformed and GetException.
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
                    while (Parser.HasData()) { // Now continue with the rowss
                        if ((row = Parser.ParseRow()) != null) {
                            if (row.Length != NColumns) {
                                Parser.AddMalformed(Parser.GetRowNumber(), "Inconsistent number of cells!");
                            } else {
                                HandleRow(row, Parser.GetRowNumber()); // -1 To account for headers
                            }
                        }
                    }
                    InferTypes();
                    PruneRows();
                    ComputeStats();
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

            int len = headers.Length;

            NColumns = len;
            NRows = Parser.GetRowCount();

            AColumns = new AColumn[len]; // Columns
            for (int i = 0; i < len; i++) {
                AColumns[i] = new AColumn(headers[i], i);
            }

            Values = new dynamic[len][]; // Values
            for (int i = 0; i < len; i++) {
                Values[i] = new dynamic[NRows]; // wow much memory
            }

            Types = new AType[len][]; // And Types
            for (int i = 0; i < len; i++) {
                Types[i] = new AType[NRows]; // wow much memory
            }

            Utils.Say("Initialized {0} columns, {1} rows.", NColumns, NRows);
        }


        // Handles one row: parses each cell and stores the value and the type for that cell.
        private void HandleRow(string[] cells, long row)
        {
            for (int i = 0; i < NColumns; i++) {
                ParseCell(cells[i], out Types[i][row], out Values[i][row]);
            }
        }


        // Given a string(cell), try and parse it into an Augmented type and by doing so obtain its value.
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

            // URL(URI)
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


        // Now that all the rows have been parsed, it's time to figure out the types.
        private void InferTypes()
        {
            Utils.Say("Inferring types...");
            for (int i = 0; i < NColumns; i++) {
                TypeColumn(AColumns[i]);
            }
            Utils.Say("Types inferred.");
        }


        // Figure out column type modes and principal type
        private void TypeColumn(AColumn col)
        {
            AType[] types = Types[col.Number];

            int[] intModes = Utils.FillArray(Enum.GetNames(typeof(AType)).Length, 0);
            for (int i = 0; i < types.Length; i++) {
                intModes[(int)types[i]]++;
            }

            Dictionary<AType, int> typeModes = new Dictionary<AType, int>();
            for (int i = 0; i < intModes.Length; i++) {
                typeModes.Add((AType)i, intModes[i]);
            }

            col.TypeModes = typeModes;

            // If we have both integers and floatings, then the type is floating.
            // TODO Ugly... clean up.
            bool integer = intModes[(int)AType.Integral] > 0;
            bool floating = intModes[(int)AType.Floating] > 0;
            AType commonest = (AType)Utils.IndexOfMax(intModes);
            if (commonest == AType.Integral && floating)
                commonest = AType.Floating;
            else if (commonest == AType.Floating && integer)
                commonest = AType.Floating;
            col.PrincipalType = commonest;
        }


        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ////  THRID PASS  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


        // Prune rows with conflicting types.
        private void PruneRows()
        {
            Utils.Say("Pruning rows...");

            bool[] invalid = new bool[NRows]; // Which rows should be pruned?
            int pruned = 0; // How many rows have been pruned?
            for (int row = 0; row < NRows; row++) {
                if (ShouldPruneRow(row)) {
                    invalid[row] = true;
                    pruned++;
                }
            }

            PrunedRows = pruned;

            if (pruned == 0) // The values stay the same if no row was pruned.
                return;


            dynamic[][] copy = new dynamic[NColumns][];
            for (int col = 0; col < NColumns; col++) {
                copy[col] = new dynamic[NRows - pruned];
            }

            for (int row = 0, cur = 0; row < NRows; row++) {
                if (!invalid[row]) {
                    for (int col = 0; col < NColumns; col++) {
                        copy[col][cur] = Values[col][row];
                    }
                    cur++;
                }
            }

            NRows -= pruned;
            Values = copy; // 0_0

            Utils.Say("{0} rows pruned.", pruned);
        }

        // Move row @from into row @to.
        private void MoveRow(int from, int to)
        {
            for (int col = 0; col < NColumns; col++) {  
                Values[col][to] = Values[col][from];
            }
        }

        // If any cell in any rows doesn't agree with the principal type, that row is removed.
        private bool ShouldPruneRow(int row)
        {
            for (int col = 0; col < AColumns.Length; col++)  // Check that row is fine 
                if (!TypesCompatible(Types[col][row], AColumns[col].PrincipalType))
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

            for (int col = 0; col < NColumns; col++) {
                switch (AColumns[col].PrincipalType) {
                    case AType.Floating:
                    case AType.Integral:
                    case AType.DateTime:
                        AColumns[col].Data = Stats<dynamic>.DynamicStats(Values[col], true, true);
                        break;
                    case AType.Text:
                        AColumns[col].Data = Stats<dynamic>.DynamicStats(Values[col], true, false);
                        break;
                    case AType.GPSCoords:
                    case AType.URL:
                    case AType.Boolean:
                    case AType.Unknown:
                        AColumns[col].Data = Stats<dynamic>.DynamicStats(Values[col], false, false);
                        break;
                }
            }

            Utils.Say("Stats computed...");
        }


        //
        public void Serialize(string path)
        {
            //string hope = JsonConvert.SerializeObject(AColumns);
            //System.Console.WriteLine(hope);
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
