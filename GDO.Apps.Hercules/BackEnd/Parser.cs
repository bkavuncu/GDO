using Microsoft.VisualBasic.FileIO;
using System;
using System.IO;

namespace GDO.Apps.Hercules.BackEnd
{
    // file/Stream/URL --> PlainDS
    public class Parser
    {
        // Singleton
        private Parser() { }

        // Stream --> PlainDS
        // May throw exceptions!
        public static PlainDS FromStream(Stream stream, string delimiter)
        {
            if (delimiter == null || delimiter == "") // Sanitize the delimiter.
                delimiter = ",";

            if (stream == null) { // No can do with an empty stream!
                throw new Exception("Parser.FromStream: the stream provided is null!");
            }

            PlainDS ds = new PlainDS(); // You will do good in life, little ds.

            TextFieldParser p = null; // You will parse my data, p.
            try {
                p = new TextFieldParser(stream);
                p.TextFieldType = FieldType.Delimited;
                p.SetDelimiters(delimiter);
            } catch (Exception ouch) {
                throw new Exception(string.Format("Parser.FromStream: error creating new TextFieldParser ({0})", ouch.Message));
            }

            bool headers = true; // Parse the data.
            while (!p.EndOfData) {
                try {
                    if (headers) { // Parse the headers.
                        ds.Headers = p.ReadFields();
                        headers = false;
                        continue;
                    }

                    string[] row = p.ReadFields();
                    if (row.Length != ds.NHeaders) { // Ignore rows with missing/too many fields.
                        string err = string.Format("Dataset has {0} headers, this row has {1}.", ds.NHeaders, row.Length);
                        throw new MalformedLineException(err, p.LineNumber);
                    } else {
                        ds.Rows.Add(row);
                    }
                } catch (MalformedLineException ouch) {
                    ds.Malformed.Add(ouch.LineNumber, ouch.Message);
                }
            }

            stream.Close(); // Free resources.
            p.Close();
            p.Dispose();

            return ds; // Return the PlainDS so graciously obtained.
        }

        // file --> PlainDS
        // May throw exceptions!
        public static PlainDS FromFile(string path, string delimiter)
        {
            return FromStream(new FileStream(path, FileMode.Open), delimiter);
        }

        // URL --> PlainDS
        // May throw exceptions!
        public static PlainDS FromURL(string url, string delimiter)
        {
            throw new Exception("Parser.FromURL: not implemented yet!"); // Maybe one day
        }
    }
}
