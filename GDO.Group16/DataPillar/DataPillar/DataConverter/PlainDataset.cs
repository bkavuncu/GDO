using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;

using DataPillar.Common;
using DataPillar.DataAugmenter;

namespace DataPillar.DataConverter
{

    /// <summary>
    /// What happened after we tried to parse a plain Datasettete?
    /// if NiceAndClean is true, then everything went alright, no need to check the other fields.
    /// Else, a few things may have gone wrong.
    /// Unsupported format only contains a non-empty string when the file type provided is not a 
    /// supported one. If that is the case then the PlainDataset could not be parsed and is returned empty.
    /// IOError only contains a non-empty string when a file/stream-related exception was caught whilst parsing.
    /// If that is the case then the PlainDataset could not be parsed and is returned empty.
    /// Else, things are looking up for us: the file/stream could be opened.
    /// However, the first line may be malformed. If that is the case, MalformedHeaders is true,
    /// and the PlainDataset returned is empty.
    /// If one or more other lines were malformed, those have been collected in MalformedLines
    /// toghether with the line number, the total number of which is SkippedLines.
    /// The PlainDataset returned only contains those lines that are not malformed.
    /// The name of the source file is saved in... SourceFile! This is initially set to the 
    /// string "<stream>".
    /// </summary>
    class ConverterOutcome
    {
        public bool NiceAndClean = true;
        public bool MalformedHeaders = false;
        public Dictionary<string, long> MalformedLines = new Dictionary<string, long>();
        public long SkippedLines = 0;

        public string UnsupportedFormat = "";
        public string IOError = "";
        public string SourceFile = "<stream>";
    }


    /// <summary>
    /// A PlainDataset is the common intermediate representation of a dataset.
    /// It contains the name of each column (Headers) and the raw data as 
    /// an array of columns, each column as an array of fields (Columns). 
    /// Additionally is has a unique identifier (UID).
    /// </summary>
    class PlainDataset
    {
        private static long NextUID = 0;

        public long UID;
        public string[] Headers;
        public string[][] Columns;

        private PlainDataset(long uid, string[] headers, string[][] columns)
        {
            UID = uid;
            Headers = headers;
            Columns = columns;
        }

        /// <summary>
        /// Creates and returns a new PlainDataset containing the data provided.
        /// </summary>
        /// <param name="headers"></param>
        /// <param name="columns"></param>
        /// <returns></returns>
        public static PlainDataset FromData(string[] headers, string[][] columns)
        {
            return new PlainDataset(NextUID++, headers, columns);
        }

        /// <summary>
        /// Creates and returns an empty PlainDataset: no headers and no columns.
        /// Any DataSet created this way has UID = -1.
        /// </summary>
        /// <returns></returns>
        public static PlainDataset Empty()
        {
            return new PlainDataset(-1, new string[0], new string[0][]);
        }


        /// <summary>
        /// Converts a file stored at filePath and containing tabular data into a PlainDataset. 
        /// Supported formats are CSV, TSV, XML and JSON. 
        /// FromFile will read the file contents as a Stream and call FromStream.
        /// </summary>
        public static PlainDataset FromFile(string filePath, ref ConverterOutcome outcome)
        {
            try
            {
                outcome.SourceFile = filePath;
                Stream stream = new FileStream(filePath, FileMode.Open);
                string fileExt = Utils.ExtractFileExtension(filePath);
                return FromStream(stream, fileExt, ref outcome);
            }
            catch (Exception ex)
            {
                outcome.IOError = ex.Message;
                return PlainDataset.Empty();
            }
        }

        /// <summary>
        /// Converts a Stream containing tabular data into a PlainDataset. 
        /// </summary>
        /// <param name="stream"></param>
        /// <param name="fileExt">This is needed to make sure the steram is interpreted correctly
        /// Supported file extensions are CSV, TSV, XML and JSON. </param>
        /// <param name="outcome"></param>
        /// <returns></returns>
        public static PlainDataset FromStream(Stream stream, string fileExt, ref ConverterOutcome outcome)
        {
            switch (fileExt.ToUpper())
            {
                case "CSV":
                    return TextFieldConverter.ConvertCSV(stream, ref outcome);
                case "TSV":
                    return TextFieldConverter.ConvertCSV(stream, ref outcome);
                case "XML":
                case "JSON":
                default:
                    outcome.UnsupportedFormat = fileExt;
                    return PlainDataset.Empty();
            }
        }
    }
}



///// <summary>
///// The dataset file formats supported by the application.
///// </summary>
//enum SupportedFormat
//{
//    CSV,
//    TSV,
//    XML,
//    JSON,
//    Unsupported
//}
