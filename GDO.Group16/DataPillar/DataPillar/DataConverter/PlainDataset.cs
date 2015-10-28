using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using DataPillar.Common;

namespace DataPillar.DataConverter
{

    /// <summary>
    /// A PlainDataset is the common intermediate representation of a dataset.
    /// It contains the name of each column (columnNames) and the raw data as 
    /// a list of rows, each row as an array of fields (DataRows). 
    /// </summary>
    class PlainDataset
    {
        public long DatasetUID;
        public string[] ColumnNames;
        public List<string[]> DataRows;
    }

    /// <summary>
    /// This is the entry point for the DataConverter. Use this class to convert 
    /// a file containing tabular data into a PlainDataset. 
    /// Supported formats are CSV, TSV, XML and JSON. 
    /// If the file is stored onto disk, use PlainDataset.FromFile(path) to read 
    /// and convert the file at location path.
    /// If the data has already been read and is availabled as a stream (string),
    /// use PlainDataset.FromStream(dataStream, format) to perform the conversion.
    /// In this case, the format must be provided explicitely and must not be 
    /// SupportedFormat.Unsupported.
    /// 
    /// If FromFile is called, the entire contents of the file are read as a string
    /// first, then passed onto FromString.
    /// </summary>
    class PlainDatasetFactory
    {

        public static PlainDataset FromFile(string filePath)
        {
            SupportedFormat format = ParseSupportedFormat(filePath);
            string streamData = TODO.UNIMPLEMENTED();
            return FromStrean(streamData, format);
        }

        public static PlainDataset FromStrean(string streamData, SupportedFormat format)
        {
            switch (format)
            {
                case SupportedFormat.CSV:  return CSVConverter.convertStream(streamData);
                case SupportedFormat.TSV:  return TSVConverter.convertStream(streamData);
                case SupportedFormat.XML:  return XMLConverter.convertStream(streamData);
                case SupportedFormat.JSON: return JSONConverter.convertStream(streamData);
                default:                   return TODO.UNIMPLEMENTED();
            }
        }

        private static SupportedFormat ParseSupportedFormat(string filePath)
        {
            string fileExtension = Utils.ExtractFileExtension(filePath);
            switch (fileExtension.ToUpper())
            {
                case "CSV": return SupportedFormat.CSV;
                case "TSV": return SupportedFormat.TSV;
                case "XML": return SupportedFormat.XML;
                case "JSON": return SupportedFormat.JSON;
                default: return SupportedFormat.Unsupported;
            }
        }
    }

}
