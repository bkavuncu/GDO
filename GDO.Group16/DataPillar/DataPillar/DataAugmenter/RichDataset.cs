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
        public List<dynamic[]> TypedRows;
        public AugmentedColumn[] AugmentedColumns;     
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
        public static RichDataset FromPlainDataset(PlainDataset plainDataset)
        {
            // Type inference, statistical analysis...
            return null; 
        }
    }
}
