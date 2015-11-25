using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GDO.Apps.Hercules.BackEnd
{
    // Statistics about an array of data.
    public class Stats
    {

        // Can't instantiate, only static methods
        private Stats() { }


        // Computes a bunch of statistics about some array of data @arr.
        // If @arr is null, it will be as if it was of length 0.
        // If @arr is of length 0, a Stats object is returned, but contains 0-initialized 
        // numerical data and the values of Min and Max are undefined.
        // If the type of @arr must be sortable with Array.Sort and support numeric operations
        // +,/,-,* and support equality by (==). Otherwise *BAD* things will happen!
        public static AStats DynamicStats(dynamic[] arr)
        {
            AStats stats = new AStats();

            if (arr == null || arr.Length == 0)
                return stats;

            int len = arr.Length;
          
            dynamic[] sorted = new dynamic[len];
            arr.CopyTo(sorted, 0);
            Array.Sort(sorted);
            
            stats.Count = len;
            stats.Min = sorted[0];
            stats.Max = sorted[len - 1];
            stats.Modes = DynamicModes(sorted);
            stats.Enum = IsEnum(stats.Modes.Count, len);
            
            stats.Sum = DynamicSum(arr);
            stats.Mean = stats.Sum / len;
            stats.Median = DynamicMedian(sorted);
            stats.Variance = DynamicVariance(arr, stats.Mean);
            stats.StdDev = Math.Sqrt(stats.Variance);

            return stats;
        }


        // Calculates the sum of an array of data.
        // If arr is null or empty, the constant 0 is returned.
        // The type of arr must be numeric (i.e. support +,-,/,* operators),
        // otherwise BAD things will happen.
        public static dynamic DynamicSum(dynamic[] arr)
        {
            if (arr == null || arr.Length <= 0)
                return 0;

            dynamic sum = 0;
            for (int i = 0, len = arr.Length; i < len; i++) {
                sum += arr[i];
            }
            return sum;
        }


        // Calculates the median of an array of data.
        // If arr is null or empty, the constant 0 is returned.
        // The type of arr must be numeric (i.e. support +,-,/,* operators),
        // otherwise BAD things will happen.
        public static dynamic DynamicMedian(dynamic[] arr)
        {
            if (arr == null || arr.Length <= 0)
                return 0;

            int len = arr.Length;
            if (len % 2 == 0)
                return (arr[len / 2] + arr[len / 2 - 1]) / 2;
            else
                return arr[len / 2];
        }


        // Calcualtes the variance of an array of data, given the mean.
        // If arr is null or empty, the constant 0 is returned.
        // The type of arr must be numeric (i.e. support +,-,/,* operators),
        // otherwise BAD things will happen.
        public static dynamic DynamicVariance(dynamic[] arr, dynamic mean)
        {
            if (arr == null || arr.Length <= 0)
                return 0;

            int len = arr.Length;
            double sum = 0;
            for (int i = 0; i < len; i++) {
                double diff = arr[i] - mean;
                sum += diff * diff;
            }

            return sum / len;
        }


        // Calculates the frequency of each element in arr.
        // arr must be SORTED and its dynamic type must support equality by (==),
        // otherwise BAD things will happen.
        // If arr is null or empty, and empty Dictionary is returned.
        public static Dictionary<dynamic, int> DynamicModes(dynamic[] arr)
        {
            Dictionary<dynamic, int> modes = new Dictionary<dynamic, int>();

            if (arr == null || arr.Length <= 0)
                return modes;

            dynamic prev = arr[0];
            int count = 1;

            for (int i = 1; i < arr.Length; i++) {
                dynamic curr = arr[i];
                if (curr == prev)
                    count++;
                else {
                    modes.Add(prev, count);
                    count = 1;
                }
                prev = curr;
            }

            return modes;
        }


        // Given some data, count is the total number of elements in it.
        // uniques is the number of unique/distinct occurencies/values in that data.
        // IsEnum will return true if it thinks that the values should be treated as 
        // enumeration values.
        public static bool IsEnum(int uniques, int count)
        {
            double desired = 12.5 * Math.Pow(2, (Math.Log10(count) - 2));
            return uniques <= desired;
        }
    }
}
