using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Collections.Concurrent;
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
            for (int i = 0; i < Cave.Cols * Cave.Rows; i++)
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
    }
}