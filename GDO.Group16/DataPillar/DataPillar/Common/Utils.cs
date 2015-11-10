using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataPillar.Common
{
    class Stats<T>
    {
        public T[] Data;
        public T[] SortedData;
        public T Min, Max;
        public double Mean, Median, Variance, StdDev;
        public Dictionary<T, long> Modes;


    }

    class Utils
    {

        public static string ExtractFileExtension(string filePath)
        {
            int indexAfterDot = filePath.LastIndexOf(".") + 1;
            if (indexAfterDot > filePath.Length)
            {
                indexAfterDot = filePath.Length;
            }
            return filePath.Substring(indexAfterDot);
        }

        /// <summary>
        /// arr must be sorted.
        /// </summary>
        /// <param name="arr"></param>
        /// <returns></returns>
        public static double LongMedian(long[] arr)
        {
            int len = arr.Length;
            if (len % 2 == 0)
                return (arr[len / 2] + arr[len / 2 - 1]) / 2;
            else
                return arr[len / 2];
        }

        /// <summary>
        /// arr must be sorted.
        /// </summary>
        /// <param name="arr"></param>
        /// <returns></returns>
        public static double DoubleMedian(double[] arr)
        {
            int len = arr.Length;
            if (len % 2 == 0)
                return (arr[len / 2] + arr[len / 2 - 1]) / 2;
            else
                return arr[len / 2];
        }

        /// <summary>
        /// </summary>
        /// <param name="arr"></param>
        /// <returns></returns>
        public static double LongVariance(long[] arr, double mean)
        {
            int len = arr.Length;
            double sum = 0;
            for (int i = 0; i < len; i++)
            {
                double diff = arr[i] - mean;
                sum += diff * diff;
            }
            return sum / len;
        }

        /// <summary>
        /// </summary>
        /// <param name="arr"></param>
        /// <returns></returns>
        public static double DoubleVariance(double[] arr, double mean)
        {
            int len = arr.Length;
            double sum = 0;
            for (int i = 0; i < len; i++)
            {
                double diff = arr[i] - mean;
                sum += diff * diff;
            }
            return sum / len;
        }


    }

    class TODO
    {
        public static dynamic UNIMPLEMENTED()
        {
            throw new Exception("Implement me already!");
        }
    }
}
