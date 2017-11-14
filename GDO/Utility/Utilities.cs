using System;
using System.Collections.Generic;
using System.Collections.Concurrent;
using System.Drawing;
using System.IO;
using log4net;
using Newtonsoft.Json;

namespace GDO.Utility
{
    public static class Utilities
    {
        private static readonly ILog Log = LogManager.GetLogger(typeof(Utilities));

        public static List<string> ParseString(string str, string divider, bool includeRemainder)
        {//TODO include as comment a sample of what this code is meant to parse 

            //todo think this could be simplified by string.split method - this will avoid any exceptions being thrown here due to index out of range 
            List<string> lines = new List<string>();
            if (string.IsNullOrEmpty(str) || string.IsNullOrEmpty(divider))
            {
                return lines;
            }
            int lastIndex = 0;
            for (int index = 0; index < str.Length; index += divider.Length)
            {

                index = str.IndexOf(divider, index, StringComparison.Ordinal);
                if (index > 0)
                {
                    string line = str.Substring(lastIndex, index - lastIndex);
                    lines.Add(line);
                    lastIndex = index + divider.Length;
                }
                else
                {
                    break;
                }
            }
            if (includeRemainder)
            {
                string remainder = str.Substring(lastIndex, str.Length - lastIndex);
                lines.Add(remainder);
            }
            return lines;
        }
        public static int GetAvailableSlot<T>(ConcurrentDictionary<int, T> dictionary)
        {
            int slot = -1;
            for (int i = 0; i < 1000; i++)//TODO comment why 1000 is used...
            {
                if (!dictionary.ContainsKey(i))
                {
                    slot = i;
                    break;
                }
            }
            return slot;
        }
        public static int GetFirstKey<T>(ConcurrentDictionary<int, T> dictionary)
        {
            int slot = -1;
            for (int i = 0; i < 1000; i++)//TODO comment why 1000 is used...
            {
                if (dictionary.ContainsKey(i))
                {
                    slot = i;
                    break;
                }
            }
            return slot;
        }
        public static int GetAvailableSlot<T>(Dictionary<int, T> dictionary)
        {
            int slot = -1;
            for (int i = 0; i < 1000000; i++)//TODO comment why 1000000 is used...
            {
                if (!dictionary.ContainsKey(i))
                {
                    slot = i;
                    break;
                }
            }
            return slot;
        }

        public static dynamic LoadJsonFile(string fileName) {
            dynamic obj = null;
            try {
                using (StreamReader r = new StreamReader(fileName)) {
                    string json = r.ReadToEnd();
                    obj = JsonConvert.DeserializeObject(json);
                }
            }
            catch (Exception e) {
                Log.Error("Unable to load JSON file " + fileName, e);
            }
            return obj;
        }

        public static dynamic LoadJsonFile<T>(string fileName) {
            dynamic obj = null;
            try {
                using (StreamReader r = new StreamReader(fileName)) {
                    string json = r.ReadToEnd();
                    obj = JsonConvert.DeserializeObject<T>(json);
                }
            }
            catch (Exception e) {
                Log.Error("Unable to load JSON file " + fileName, e);
            }
            return obj;
        }

        public static void SaveJsonFile<T>(string fileName, string folderName, object obj)
        {
            try
            {
                T temp = (T)obj;
                string json = JsonConvert.SerializeObject(temp);
                string path = Directory.GetCurrentDirectory() + @"\\" + folderName + "\\" + fileName + ".json";
                if (!Directory.Exists(Path.GetDirectoryName(path))) {
                    Directory.CreateDirectory(Path.GetDirectoryName(path));
                }
                File.WriteAllText(path, json);
            }
            catch (Exception e)
            {
                Log.Error("Unable to save JSON file " + fileName, e);
            }
        }

        public static void RemoveJsonFile(string fileName, string folderName)
        {
            try
            {
                string path = Directory.GetCurrentDirectory() + @"\\" + folderName + "\\" + fileName + ".json";
                if (File.Exists(path)) {
                    File.Delete(path);
                }
            }
            catch (Exception e)
            {
                Log.Error("Unable to delete JSON file " + fileName, e);
            }

        }

        public static string RemoveString(string source, string remove) // TODO what does this method do? 
        {
            if (source != null && remove != null) {
                int index = source.IndexOf(remove, StringComparison.Ordinal);
                string cleanPath = (index < 0)
                    ? source
                    : source.Remove(index, remove.Length);
                return cleanPath;
            }
            else {
                Log.Debug("Error in Remove String due to null arguments");
                return null;
            }
        }
        public static byte[] GetBytes(string str)
        {
            byte[] bytes = new byte[str.Length * sizeof(char)];
            Buffer.BlockCopy(str.ToCharArray(), 0, bytes, 0, bytes.Length);
            return bytes;
        }

        public static Image Base64ToImage(string base64String)
        {
            byte[] imageBytes = Convert.FromBase64String(base64String);
            using (var ms = new MemoryStream(imageBytes, 0, imageBytes.Length))
            {
                Image image = Image.FromStream(ms, true);
                return image;
            }
        }

        public static double CalculateTimeSpan(int?[] time, bool isDuration)
        {
            int[] temp = new int[7];
            for (int i = 0; i < 7; i++)
            {
                if (time[i] == null)
                {
                    temp[i] = 0;
                }
                else
                {
                    temp[i] = (int)time[i];
                }
            }
            TimeSpan total = TimeSpan.Zero;
            if (isDuration)
            {
                TimeSpan[] span = new TimeSpan[7];
                span[0] = TimeSpan.FromDays(temp[0]*365);
                span[1] = TimeSpan.FromDays(temp[1]*12);
                span[2] = TimeSpan.FromDays(temp[2]);
                span[3] = TimeSpan.FromHours(temp[3]);
                span[4] = TimeSpan.FromMinutes(temp[4]);
                span[5] = TimeSpan.FromSeconds(temp[5]);
                span[6] = TimeSpan.FromMilliseconds(temp[6]);

                for (int i = 0; i < 7; i++)
                {
                    total = total.Add(span[i]);
                }
            }
            else
            {
                total = new DateTime(temp[0], temp[1], temp[2], temp[3], temp[4], temp[5], temp[6]) - new DateTime(1970, 1, 1);
            }
            return total.TotalMilliseconds;
        }

        public static int CastToInt(int? val, int defVal)
        {
            if (val == null)
            {
                return defVal;
            }
            else
            {
                return (int) val;
            }
        }

        public static double CastToDouble(double? val, double defVal)
        {
            if (val == null)
            {
                return defVal;
            }
            else
            {
                return (double)val;
            }
        }

        public static bool CastToBool(bool? val, bool defVal)
        {
            if (val == null)
            {
                return defVal;
            }
            else
            {
                return (bool)val;
            }
        }

        public static string Slice(string source, int start, int end)
        {
            if (end < 0)
            {
                end = source.Length + end;
            }
            int len = end - start;
            return source.Substring(start, len);
        }
    }

    public class GenericDictionary<TU>
    {
        private Dictionary<int, TU> _dict;

        public void Init()
        {
            _dict = new Dictionary<int, TU>();
        } 

        public void Add<T>(int key, T value) where T : TU
        {
            _dict.Add(key, value);
        }

        public int AddNextAvailableSlot<T>(T value) where T : TU
        {
            int key = GetAvailableSlot();
            _dict.Add(key, value);
            return key;
        }

        public void Update<T>(int key, T value) where T : TU
        {
            _dict[key] = value;
        }

        public void Remove(int key)
        {
            _dict.Remove(key);
        }

        public bool Contains(int key)
        {
            return _dict.ContainsKey(key);
        }

        public int Count(int key)
        {
            return _dict.Count;
        }

        public T GetValue<T>(int key) where T : TU
        {
            return (T)_dict[key];
        }

        public int GetAvailableSlot()
        {
            int slot = -1;
            for (int i = 0; i < 1000; i++)
            {
                if (!_dict.ContainsKey(i))
                {
                    slot = i;
                    break;
                }
            }
            return slot;
        }

        public Dictionary<int, TU> GetDictionary()
        {
            return _dict;
        }

        public TU[] ToArray()
        {
            int i = 0;
            TU[] array = new TU[_dict.Count];
            foreach (KeyValuePair<int,TU> pair in _dict)
            {
                array[i] = pair.Value;
                i++;
            }
            return array;
        }
    }
}
