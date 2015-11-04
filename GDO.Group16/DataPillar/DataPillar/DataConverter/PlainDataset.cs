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
            Stream stream = new FileStream(filePath, FileMode.Open);
            return FromStream(stream, format);
        }

        public static PlainDataset FromStream(Stream stream, SupportedFormat format)
        {
            ConverterOutcome outcome;

            switch (format)
            {
                case SupportedFormat.CSV: return TextFieldConverter.ConvertCSV(stream, out outcome);
                case SupportedFormat.TSV: return TextFieldConverter.ConvertTSV(stream, out outcome);
                //case SupportedFormat.XML:  return XMLConverter.convertStream(streamData);
                //case SupportedFormat.JSON: return JSONConverter.convertStream(streamData);
                default: return TODO.UNIMPLEMENTED();
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
