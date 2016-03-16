using System;
using System.Collections.Generic;
using System.Collections.Concurrent;
using System.Drawing;
using System.IO;
using Newtonsoft.Json;

namespace GDO.Utility
{
    public static class Utilities
    {
        public static List<string> ParseString(string str, string divider, bool includeRemainder)
        {
            List<string> lines = new List<string>();
            if (String.IsNullOrEmpty(str) || String.IsNullOrEmpty(divider))
            {
                return lines;
            }
            int lastIndex = 0;
            for (int index = 0; index < str.Length; index += divider.Length)
            {

                index = str.IndexOf(divider, index);
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
        public static dynamic LoadJsonFile(string fileName)
        {
            dynamic obj = null;
            try
            {
                using (StreamReader r = new StreamReader(fileName))
                {
                    string json = r.ReadToEnd();
                    obj = JsonConvert.DeserializeObject(json);
                }
            }
            catch (Exception e)
            {

            }
            return obj;
        }

        public static dynamic LoadJsonFile<T>(string fileName)
        {
            dynamic obj = null;
            try
            {
                using (StreamReader r = new StreamReader(fileName))
                {
                    string json = r.ReadToEnd();
                    obj = JsonConvert.DeserializeObject<T>(json);
                }
            }
            catch (Exception e)
            {

            }
            return obj;
        }

        public static void SaveJsonFile<T>(string fileName, string folderName, object obj)
        {
            try
            {
                T temp = (T)obj;
                string json = JsonConvert.SerializeObject(temp);
                String path = Directory.GetCurrentDirectory() + @"\\" + folderName + "\\" + fileName + ".json";
                System.IO.File.WriteAllText(@path, json);
            }
            catch (Exception e)
            {

            }
        }

        public static void RemoveJsonFile(string fileName, string folderName)
        {
            try
            {
                String path = Directory.GetCurrentDirectory() + @"\\" + folderName + "\\" + fileName + ".json";
                System.IO.File.Delete(path);
            }
            catch (Exception e)
            {
                
            }

        }

        public static string RemoveString(string source, string remove)
        {
            int index = source.IndexOf(remove);
            string cleanPath = (index < 0)
                ? source
                : source.Remove(index, remove.Length);
            return cleanPath;
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
            int key = this.GetAvailableSlot();
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
