﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
  
        public RichDataset (PlainDataset sourceDataset, dynamic[][] typedColumns, AugmentedColumn[] augmentedColumns)
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
        public static RichDataset FromPlainDataset (PlainDataset sourceDataset)
        {
            string[][] rawData = sourceDataset.Columns;
            int numCols = sourceDataset.Headers.Length;
            int numRows = rawData[0].Length;

            dynamic[][] typedCols = new dynamic[numCols][];
            AugmentedColumn[] augCols = new AugmentedColumn[numCols];

            for (int i = 0; i < numCols; i++)
            {
                augCols[i] = new AugmentedColumn ();
                typedCols[i] = new dynamic[numRows];
                for (int j = 0; j < numRows; j++)
                {
                    FieldType cellType = GetFieldType (rawData[i][j], out typedCols[i][j]);

                    augCols[i].FieldType = UnifyFieldTypes (augCols[i].FieldType, cellType);
                }
            }

            ComputeStats (typedCols, augCols);
            RichDataset richDataset = new RichDataset (sourceDataset, typedCols, augCols);
            return richDataset;
        }




        private static void ComputeStats (dynamic[][] typedCols, AugmentedColumn[] augCols)
        {
            int numCols = typedCols.Length;
            int numRows = numCols > 0 ? typedCols[0].Length : 0;

            for (int i = 0; i < numCols; i++)
            {
                dynamic[] typedCol = typedCols[i];
                AugmentedColumn augCol = augCols[i];

                double min = 0, max = 0, sum = 0, mean = 0;

                switch (augCol.FieldType)
                {
                    case FieldType.Integral:
                        long[] longs = new long[numRows];
                        typedCol.CopyTo (longs, 0);
                        Array.Sort (longs);
                        min = longs[0];
                        max = longs[numRows - 1];
                        sum = longs.Sum ();
                        mean = sum / numRows;
                        break;

                    case FieldType.Floating:
                        double[] doubles = new double[numRows]; 
                        typedCol.CopyTo (doubles, 0);
                        Array.Sort (doubles);
                        min = doubles[0];
                        max = doubles[numRows - 1];
                        sum = doubles.Sum ();
                        mean = sum / numRows;
                        break;

                    case FieldType.DateTime:
                        long[] dates = new long[numRows];
                        typedCol.CopyTo (dates, 0);
                        Array.Sort (dates);
                        min = dates[0];
                        max = dates[numRows - 1];
                        sum = dates.Sum ();
                        mean = sum / numRows;
                        break;

                    case FieldType.GPSCoords:
                        double[,] coords = new double[numRows, 2];
                        typedCol.CopyTo (coords, 0);
                        Array.Sort (coords);
                        break;

                    default:
                        string[] texts = new string[numRows];
                        typedCol.CopyTo (texts, 0);
                        Array.Sort(texts, (me, you) => me.Length.CompareTo (you.Length));
                        min = texts[0].Length;
                        max = texts[numRows - 1].Length;
                        break;
                }

                augCol.Min = min;
                augCol.Max = max;
                augCol.Mean = mean; 
            }
            

        }

        private static FieldType UnifyFieldTypes (FieldType curr, FieldType next)
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


        private static FieldType GetFieldType (String value, out dynamic output)
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
            String[] geoValues = value.Split(new[] {' ', '|', ','});
            double latitude;
            double longitude;
            if (geoValues.Length == 2 && double.TryParse(geoValues[0], out latitude) && double.TryParse(geoValues[1], out longitude)) 
            {
                output = new double[2] { latitude, longitude };
                return FieldType.GPSCoords;
            }

            //URL(URI)
            try  
            {
                Uri uri = new Uri (value);
                output = value; // T
                return FieldType.URL;
            } 
            catch 
            {
                output = value;
                return FieldType.Text;
            }

        }
    
    
    }
}
