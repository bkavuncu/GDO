using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Device.Location;

using DataPillar.DataConverter;

namespace DataPillar.DataAugmenter
{
    /// <summary>
    /// We have a reference to the original source PlainDataset to obtain the data.
    /// When we are done, the RichDataset will have a list of 'dynamic' rows.
    /// AFAIK dynamic means that is can be ANY TYPE, which is kinda what we need.
    /// Eventually we will serialize an instance of this RichDataset class into a JSON
    /// object to return to the Control APP and hopefully the dynamic keyword will do 
    /// the type conversion to generate the appropriate primitive type in the JSON.
    /// An alternative to dynamic is object, which we might resort to if dynamic doesn't behave.
    /// </summary>
    class RichDataset
    {
        public PlainDataset SourceDataset;
        public dynamic[][] TypedColumns;
        public AugmentedColumn[] AugmentedColumns;

        public RichDataset(PlainDataset sourceDataset, dynamic[][] typedColumns, AugmentedColumn[] augmentedColumns)
        {
            SourceDataset = sourceDataset;
            TypedColumns = typedColumns;
            AugmentedColumns = augmentedColumns;
        }
    }

    class RichDatasetFactory
    {
        /// <summary>
        /// Stuff happens here. Given the PlainDataset, go through each row, and for 
        /// each row go through each field. Figure out which type the filed is and see
        /// if it is the same of the previous fields for that same column. If it is 
        /// numeric, compute the new min, max, mean, modes, variance, stddev. 
        /// If it is a string, do the same on its length. If it is a Date, Time, DateTime,
        /// I guess the same applies? One problem is modes and median... especially median
        /// requires the data to be sorted! If not, we need to sort it ourselves, not that 
        /// it should be more than one call to List.Sort()... but with tens of thousands of
        /// records we may run into performance issues... Or maybe not, who knows.
        /// Well good luck.
        /// </summary>
        /// <param name="plainDataset"></param>
        /// <returns></returns>
        public static RichDataset FromPlainDataset(PlainDataset sourceDataset)
        {
            string[][] rawData = sourceDataset.Columns;
            string[] headers = sourceDataset.Headers;
            int numCols = headers.Length;
            int numRows = rawData[0].Length;

            dynamic[][] typedCols = new dynamic[numCols][];
            AugmentedColumn[] augCols = new AugmentedColumn[numCols];

            for (int i = 0; i < numCols; i++)
            {
                augCols[i] = new AugmentedColumn();
                typedCols[i] = new dynamic[numRows];
                for (int j = 0; j < numRows; j++)
                {
                    FieldType cellType = GetFieldType(rawData[i][j], out typedCols[i][j]);

                    augCols[i].FieldType = UnifyFieldTypes(augCols[i].FieldType, cellType);
                }
                augCols[i].Name = headers[i];
            }

            ComputeStats(typedCols, augCols);
            RichDataset richDataset = new RichDataset(sourceDataset, typedCols, augCols);
            return richDataset;
        }




        private static void ComputeStats(dynamic[][] typedCols, AugmentedColumn[] augCols)
        {
            int numCols = typedCols.Length;
            int numRows = numCols > 0 ? typedCols[0].Length : 0;

            for (int i = 0; i < numCols; i++)
            {
                dynamic[] typedCol = typedCols[i];
                AugmentedColumn augCol = augCols[i];

                double min = 0, max = 0, sum = 0, mean = 0;
                bool amIenum = false;

                switch (augCol.FieldType)
                {
                    case FieldType.Integral:
                        long[] longs = new long[numRows];
                        typedCol.CopyTo(longs, 0);
                        Array.Sort(longs);
                        min = longs[0];
                        max = longs[numRows - 1];
                        sum = longs.Sum();
                        mean = sum / numRows;
                        amIenum = GetEnums(longs);
                        break;

                    case FieldType.Floating:
                        double[] doubles = new double[numRows];
                        for (int j = 0; j < numRows; j++)
                        {
                            doubles[j] = (double)typedCol[j];
                        }
                        Array.Sort(doubles);
                        min = doubles[0];
                        max = doubles[numRows - 1];
                        sum = doubles.Sum();
                        mean = sum / numRows;
                        amIenum = GetEnums(doubles);
                        break;

                    case FieldType.DateTime:
                        long[] dates = new long[numRows];
                        typedCol.CopyTo(dates, 0);
                        Array.Sort(dates);
                        min = dates[0];
                        max = dates[numRows - 1];
                        sum = dates.Sum();
                        mean = sum / numRows;
                        amIenum = GetEnums(dates);
                        break;

                    case FieldType.GPSCoords:
                        GeoCoordinate[] coords = new GeoCoordinate[numRows];
                        typedCol.CopyTo(coords, 0);
                        Array.Sort (coords);
                        amIenum = GetEnums(coords);
                        break;

                    default:
                        string[] texts = new string[numRows];
                        typedCol.CopyTo(texts, 0);
                        Array.Sort(texts, (me, you) => me.Length.CompareTo(you.Length));
                        min = texts[0].Length;
                        max = texts[numRows - 1].Length;

                        Array.Sort(texts);
                        amIenum = GetEnums(texts);
                        break;
                }

                augCol.Min = min;
                augCol.Max = max;
                augCol.Mean = mean;
                augCol.Enum = amIenum;
            }


        }

        private static bool GetEnums<T>(T[] arr) where T : IEquatable<T>
        {
            if (arr.Length == 0)
                return false;

            Dictionary<T, int> enums = new Dictionary<T, int>();

            T prev = arr[0];
            int count = 1;
            for (int i = 1; i < arr.Length; i++)
            {
                T curr = arr[i];
                if (curr.Equals(prev))
                    count++;
                else
                {
                    enums.Add(prev, count);
                    count = 1;
                }
                prev = curr;
            }

            return isEnum(enums.Count, arr.Length);
        }

        private static bool isEnum (int actualSize, int totalSize)
        {
            double desiredSize = 12.5 * Math.Pow(2, (Math.Log10(totalSize) - 2));
            return actualSize <= desiredSize;
        }

        private static FieldType UnifyFieldTypes(FieldType curr, FieldType next)
        {
            if (curr == FieldType.Unknown)
            {
                return next;
            }
            if (curr == FieldType.Integral && next == FieldType.Floating)
            {
                return FieldType.Floating;
            }
            if (curr == FieldType.Floating && next == FieldType.Integral)
            {
                return FieldType.Floating;
            }
            if (curr != next)
            {
                return FieldType.Text;
            }
            return curr;
        }


        private static FieldType GetFieldType(String value, out dynamic output)
        {
            //Integer
            long integer;
            if (long.TryParse(value, out integer))
            {
                output = integer;
                return FieldType.Integral;
            }

            //Float
            double floating;
            if (double.TryParse(value, out floating))
            {
                output = floating;
                return FieldType.Floating;
            }

            //Boolean
            bool boolean;
            if (bool.TryParse(value, out boolean))
            {
                output = boolean;
                return FieldType.Boolean;
            }

            //DateTime
            DateTime dateTime;
            if (DateTime.TryParse(value, out dateTime))
            {
                output = dateTime.Ticks;
                return FieldType.DateTime;
            }

            //GeoCoordinates
            String[] geoValues = value.Split(new[] { ' ', '|', ',' });
            double latitude;
            double longitude;
            if (geoValues.Length == 2 && double.TryParse(geoValues[0], out latitude) && double.TryParse(geoValues[1], out longitude))
            {
                output = new GeoCoordinate(latitude, longitude);
                return FieldType.GPSCoords;
            }

            //URL(URI)
            if (Uri.IsWellFormedUriString(value, UriKind.Absolute))
            {
                Uri uri = new Uri(value);
                output = value; // T
                return FieldType.URL;
            }
            else
            {
                output = value;
                return FieldType.Text;
            }
        }


    }
}
