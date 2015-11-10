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


    class TextFieldConverter
    {

        public static PlainDataset ConvertTSV (Stream stream, ref ConverterOutcome outcome)
        {
            return ConvertDelimited (stream, "\t", ref outcome);
        }

        public static PlainDataset ConvertCSV (Stream stream, ref ConverterOutcome outcome)
        {
            return ConvertDelimited (stream, ",", ref outcome);
        }

        public static PlainDataset ConvertDelimited (Stream stream, string delimiter, ref ConverterOutcome outcome)
        {
            Debug.Assert (stream != null);
            Debug.Assert (delimiter != null && delimiter != "");

            TextFieldParser parser = new TextFieldParser (stream);
            parser.TextFieldType = FieldType.Delimited;
            parser.SetDelimiters (delimiter);

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
                            columns[i] = new List<string>(2 ^ 15); // We be expecing many records 0_0.
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
                    if (headers)
                    {
                        outcome.MalformedHeaders = true;
                        break; // If we can't read the headers, may as well just give up.
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

            return PlainDataset.FromData (headerNames, jesus);
        }
    }

}
