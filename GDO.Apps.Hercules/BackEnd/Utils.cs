using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace GDO.Apps.Hercules.BackEnd
{
    public class Utils
    {

        // Given a filePath, extracts the file extension. 
        // If filePath is null or empty, the empty string is returned
        public static string ExtractFileExtension(string path)
        {
            if (path == null || path == "" || path.LastIndexOf(".") == -1)
                return "";

            return path.Substring(Clamp(0, path.LastIndexOf(".") + 1, path.Length));
        }

        // Clamp min value max will make sure that value is at most max and at least min.
        // The runtime type of min, value and max must support the comparator operators < and >.
        public static dynamic Clamp(dynamic min, dynamic value, dynamic max)
        {
            if (value < min)
                return min;
            if (value > max)
                return max;

            return value;
        }


        // Creates and array of length size and fills each element with the value of elem.
        // If size is negative and empty array is returned.
        public static T[] FillArray<T>(int size, T elem)
        {
            if (size <= 0)
                return new T[0];

            T[] arr = new T[size];
            for (int i = 0; i < size; i++) {
                arr[i] = elem;
            }

            return arr;
        }


        // Computes the index of the maximum integer present in arr.
        // If more than one element are the maximum, the last occurence is returned.
        // If arr is null or empty, returns -1.
        public static int IndexOfMax(int[] arr)
        {
            if (arr == null || arr.Length <= 0) {
                return -1;
            }

            int max = arr[0];
            int index = 0;

            for (int i = 0; i < arr.Length; i++) {
                if (arr[i] >= max) {
                    max = arr[i];
                    index = i;
                }
            }

            return index;
        }


        // Shortcut for System.Diagnostics.Debug.WriteLine.
        public static void Say(string format, params object[] args)
        {
            System.Diagnostics.Debug.WriteLine(format, args);
        }


        public static string Lines<T>(T[] arr, string separator)
        {
            return string.Join(separator, from o in arr select o.ToString());
        }

        public static string Lines<T>(List<T> arr, string separator)
        {
            return string.Join(separator, from o in arr select o.ToString());
        }

        public static string Maybe(string s, string b)
        {
            return (s == null || s.Length <= 0) ? b : s;
        }

        public static string AxesMapToPlotOrder (string axesMap, JsonDS dataset)
        {
            // Parse axesMap into an AxesMap object
            AxesMap am = new AxesMap(axesMap);
            // List<Pair<Axis, Field> ps
            List<dynamic[]> rows = dataset.rows;
            List<KeyValuePair<string, string>> pairs = am.getPairs();
            Dictionary<string, int> fieldMap = dataset.getFieldIndexMap();
            // for each row in dataset
            List<Dictionary<String, String>> result = new List<Dictionary<String, String>>();
            foreach (dynamic[] row in rows)
            {
                // create an object
                Dictionary<String, String> obj = new Dictionary<String, String> ();
                // for each pair in ps , add axis -> row[field] in object
                foreach (KeyValuePair<string, string> axisFieldPair in pairs)
                {
                    string axisName = axisFieldPair.Key;
                    int fieldIndex = fieldMap[axisFieldPair.Value];
                    dynamic fieldValue = row[fieldIndex];
                    obj.Add(axisName, fieldValue.ToString());
                }
                result.Add(obj);
            }

            return JsonConvert.SerializeObject(result);
        }

        private class AxesMap
        {
            Dictionary<String, List<String>> axesMap;

            public AxesMap(string mapString)
            {
                axesMap = JsonConvert.DeserializeObject<Dictionary<String, List<String>>> (mapString);
            }

            public List<KeyValuePair<string, string>> getPairs()
            {
                List<KeyValuePair<string, string>> pairs = new List<KeyValuePair<string, string>>();

                foreach (string k in axesMap.Keys)
                {
                    List<String> fields = axesMap[k];

                    foreach (string field in fields)
                    {
                        KeyValuePair<string, string> pair = new KeyValuePair<string, string>(k, field);
                        pairs.Add(pair);
                    }
                }

                return pairs;
            }
        }
    }



}
