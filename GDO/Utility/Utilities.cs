using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Collections.Concurrent;
using System.Drawing;
using System.IO;
using GDO.Core;
using Newtonsoft.Json;

namespace GDO.Utility
{
    public class Utilities
    {
        public static int GetAvailableSlot<T>(ConcurrentDictionary<int, T> dictionary)
        {
            int slot = -1;
            for (int i = 0; i < 1000; i++)
            {
                if (!dictionary.ContainsKey(i))
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
            for (int i = 0; i < 1000000; i++)
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
            using (StreamReader r = new StreamReader(fileName))
            {
                string json = r.ReadToEnd();
                obj = JsonConvert.DeserializeObject(json);
            }
            return obj;
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
            System.Buffer.BlockCopy(str.ToCharArray(), 0, bytes, 0, bytes.Length);
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
    public class GenericDictionary<U>
    {
        private Dictionary<int, U> _dict;

        public void Init()
        {
            _dict = new Dictionary<int, U>();
        } 

        public void Add<T>(int key, T value) where T : U
        {
            _dict.Add(key, value);
        }

        public int AddNextAvailableSlot<T>(T value) where T : U
        {
            int key = this.GetAvailableSlot();
            _dict.Add(key, value);
            return key;
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

        public T GetValue<T>(int key) where T : U
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

        public Dictionary<int, U> GetDictionary()
        {
            return _dict;
        }

        public U[] ToArray()
        {
            int i = 0;
            U[] array = new U[_dict.Count];
            foreach (KeyValuePair<int,U> pair in _dict)
            {
                array[i] = pair.Value;
                i++;
            }
            return array;
        }
    }
}