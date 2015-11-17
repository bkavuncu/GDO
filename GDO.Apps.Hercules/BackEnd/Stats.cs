using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DP.src
{

    // Statistics about an array of data.
    class Stats<T>
    {
        
        // What are the minimum and maximum elements of Data?
        public T Min, Max;

        // How many elements are in Data?
        public int Count = 0;

        // Frequency table: how often does each distinc value of T appear in Data?
        public Dictionary<T, int> Modes = new Dictionary<T, int>();

        // Is the Data made up of so few elements that they may form an enumeration?
        public bool Enum = false;

        // These statistics only apply to numerical data.
        public double Sum = 0, Mean = 0, Median = 0, Variance = 0, StdDev = 0;


        public Stats() { }


        // Computes a bunch of statistics about some array of data @arr.
        // If @arr is null, it will be as if it was of length 0.
        // If @arr is of length 0, a Stats object is returned, but contains 0-initialized 
        // numerical data and the values of Min and Max are undefined.
        // If the type of @arr is @numeric, then numerical stats will be computed:
        // sum, mean, median, variance, standard deviation.
        // Otherwise these statistics are not compute and their values default to 0.
        // If @arr is not @sortable, no stats will be computed.
        // A @numeric @arr must also be @sortable for this function to be useful. 
        // If @arr is said to be @sortable and @numeric but its dynamic type disagrees,
        // *BAD* things will happen!
        public static Stats<dynamic> DynamicStats(dynamic[] arr, bool sortable, bool numeric)
        {
            Stats<dynamic> stats = new Stats<dynamic>();

            if (arr == null || arr.Length == 0)
                return stats;

            int len = arr.Length;

            if (sortable) {
                dynamic[] sorted = new dynamic[len];
                arr.CopyTo(sorted, 0);
                Array.Sort(sorted);

                stats.Count = len;
                stats.Min = sorted[0];
                stats.Max = sorted[len - 1];
                stats.Modes = DynamicModes(sorted);
                stats.Enum = IsEnum(stats.Modes.Count, len);

                if (numeric) {
                    stats.Sum = DynamicSum(arr);
                    stats.Mean = stats.Sum / len;
                    stats.Median = DynamicMedian(sorted);
                    stats.Variance = DynamicVariance(arr, stats.Mean);
                    stats.StdDev = Math.Sqrt(stats.Variance);
                }
            }

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
        // arr must be SORTED and its dynamic type must support .Equals(),
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
                if (curr.Equals(prev))
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



///// <summary>
///// Doesn't include Sum, Mean, Median, Variance nor StdDev.
///// </summary>
///// <typeparam name="A"></typeparam>
///// <param name="arr"></param>
///// <returns></returns>
//public static Stats<A> GenericStats<A>(A[] arr) where A : IEquatable<A>
//{
//    int len = arr.Length;
//    Stats<A> stats = new Stats<A>();
//    A[] sorted = new A[len];
//    arr.CopyTo(sorted, 0);
//    Array.Sort(sorted);
//    stats.Count = len;
//    stats.Min = sorted[0];
//    stats.Max = sorted[len - 1];
//    stats.Modes = AnyModes(sorted);
//    stats.Data = arr;
//    stats.SortedData = sorted;
//    stats.Enum = IsEnum(stats.Modes.Count, len);
//    return stats;
//}

/// <summary>
/// 
/// 
/// </summary>
/// <typeparam name="A"></typeparam>
/// <param name="arr"></param>
/// <param name="comparator">if this is null it uses ==</param>
/// <returns></returns>
//public static Dictionary<A, int> GenericModes<A>(A[] arr) where A : IEquatable<A>
//{
//    Dictionary<A, int> modes = new Dictionary<A, int>();

//    A prev = arr[0];
//    int count = 1;
//    for (int i = 1; i < arr.Length; i++) {
//        A curr = arr[i];

//        if (curr.Equals(prev)) {
//            count++;
//        } else {
//            modes.Add(prev, count);
//            count = 1;
//        }
//        prev = curr;
//    }

//    return modes;
//}



///// <summary>
///// 
///// </summary>
///// <param name="arr"></param>
///// <returns></returns>
//public static Stats<long> LongStats(long[] arr)
//{
//    Stats<long> stats = GenericStats(arr);

//    stats.Sum = stats.Data.Sum();
//    stats.Mean = stats.Sum / stats.Count;
//    stats.Median = LongMedian(stats.SortedData);
//    stats.Variance = LongVariance(arr, stats.Mean);
//    stats.StdDev = Math.Sqrt(stats.Variance);

//    return stats;
//}

///// <summary>
///// 
///// </summary>
///// <param name="arr"></param>
///// <returns></returns>
//public static Stats<double> DoubleStats(double[] arr)
//{
//    Stats<double> stats = GenericStats(arr);

//    stats.Sum = stats.Data.Sum();
//    stats.Mean = stats.Sum / stats.Count;
//    stats.Median = DoubleMedian(stats.SortedData);
//    stats.Variance = DoubleVariance(arr, stats.Mean);
//    stats.StdDev = Math.Sqrt(stats.Variance);

//    return stats;
//}

///// <summary>
///// arr must be sorted.
///// </summary>
///// <param name="arr"></param>
///// <returns></returns>
//public static double LongMedian(long[] arr)
//{
//    int len = arr.Length;
//    if (len % 2 == 0)
//        return (arr[len / 2] + arr[len / 2 - 1]) / 2;
//    else
//        return arr[len / 2];
//}

///// <summary>
///// arr must be sorted.
///// </summary>
///// <param name="arr"></param>
///// <returns></returns>
//public static double DoubleMedian(double[] arr)
//{
//    int len = arr.Length;
//    if (len % 2 == 0)
//        return (arr[len / 2] + arr[len / 2 - 1]) / 2;
//    else
//        return arr[len / 2];
//}


///// <summary>
///// </summary>
///// <param name="arr"></param>
///// <returns></returns>
//public static double LongVariance(long[] arr, double mean)
//{
//    int len = arr.Length;
//    double sum = 0;
//    for (int i = 0; i < len; i++) {
//        double diff = arr[i] - mean;
//        sum += diff * diff;
//    }
//    return sum / len;
//}

///// <summary>
///// </summary>
///// <param name="arr"></param>
///// <returns></returns>
//public static double DoubleVariance(double[] arr, double mean)
//{
//    int len = arr.Length;
//    double sum = 0;
//    for (int i = 0; i < len; i++) {
//        double diff = arr[i] - mean;
//        sum += diff * diff;
//    }
//    return sum / len;
//}

