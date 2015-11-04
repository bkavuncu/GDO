using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.VisualBasic.FileIO;
using System.IO;
using System.Diagnostics;

using Newtonsoft.Json;

namespace DataPillar.DataConverter
{

    /// <summary>
    /// A PlainDataset is the common intermediate representation of a dataset.
    /// It contains the name of each column (columnNames) and the raw data as 
    /// a list of rows, each row as an array of fields (DataRows). 
    /// </summary>
    class PlainDataset
    {
        public long UID;
        public string[] Headers;
        public string[][] Columns;

        public PlainDataset (long uid, string[] headers, string[][] columns)
        {
            UID = uid;
            Headers = headers;
            Columns = columns;
        }
    }

    class ConverterOutcome
    {
        public bool NiceAndClean = true;
        public bool MalformedHeaders = false;
        public Dictionary<string, long> MalformedLines = new Dictionary<string, long> ();
        public long SkippedLines = 0;
    }

    class TextFieldConverter
    {

        public static PlainDataset ConvertTSV (Stream stream, out ConverterOutcome outcome)
        {
            return ConvertDelimited (stream, "\t", out outcome);
        }

        public static PlainDataset ConvertCSV (Stream stream, out ConverterOutcome outcome)
        {
            return ConvertDelimited (stream, ",", out outcome);
        }

        public static PlainDataset ConvertDelimited (Stream stream, string delimiter, out ConverterOutcome outcome)
        {
            Debug.Assert (stream != null);
            Debug.Assert (delimiter != null && delimiter != "");

            TextFieldParser parser = new TextFieldParser (stream);
            parser.TextFieldType = FieldType.Delimited;
            parser.SetDelimiters (delimiter);

            outcome = new ConverterOutcome ();

            string[] headerNames = new string[0];
            List<string>[] columns = new List<string>[0];

            bool headers = true;
            while (!parser.EndOfData)
            {
                try
                {
                    if (headers) // First line is the headers.
                    {
                        headerNames = parser.ReadFields ();
                        columns = new List<string>[headerNames.Length];
                        for (int i = 0; i < headerNames.Length; i++)
                        {
                            columns[i] = new List<string>(2 ^ 15);
                        }
                        headers = false;
                    }
                    else
                    {
                        string[] row = parser.ReadFields ();
                        if (row.Length != headerNames.Length) // Can't take care of filling/trimming row fields...
                        {
                            throw new MalformedLineException ("Number of fields NOT EQUAL to column count!", parser.LineNumber);
                        }
                        else
                        {
                            for (int i = 0; i < row.Length; i++)
                            {
                                columns[i].Add (row[i]);
                            }
                        }
                    }
                }
                catch (MalformedLineException ex)
                {
                    outcome.NiceAndClean = false;
                    if (headers) // If we can't read the headers, may as well just give up.
                    {
                        outcome.MalformedHeaders = true;
                        break;
                    }
                    else
                    {
                        outcome.MalformedLines.Add (ex.Message, ex.LineNumber);
                        outcome.SkippedLines++;
                    }
                }
            }

            string[][] jesus = new string[headerNames.Length][];
            for (int i = 0; i < headerNames.Length; i++) 
            {
                jesus[i] = columns[i].ToArray();
            }

            return new PlainDataset (0, headerNames, jesus);
        }
    }

}
