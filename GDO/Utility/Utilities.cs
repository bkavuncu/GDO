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
}