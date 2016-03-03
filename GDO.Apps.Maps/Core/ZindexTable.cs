using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core
{
    public class ZindexTable
    {
        public Dictionary<int, int> ZindexDictionary { get; set; }

        public void Init()
        {
            ZindexDictionary = new Dictionary<int, int>();
        }

        public void AddLayer(int layerId)
        {
            foreach (KeyValuePair<int, int> index in ZindexDictionary)
            {
                ZindexDictionary[index.Key] = index.Value + 1;
            }
            ZindexDictionary.Add(layerId, 0);
        }

        public void RemoveLayer(int layerId)
        {
            int zIndex = ZindexDictionary[layerId];
            foreach (KeyValuePair<int, int> index in ZindexDictionary)
            {
                if (ZindexDictionary[index.Key] > zIndex)
                {
                    ZindexDictionary[index.Key] = index.Value - 1;
                }
                ZindexDictionary.Remove(layerId);
            }
        }

        public void UpLayer(int layerId)
        {
            int zIndex = ZindexDictionary[layerId];
            foreach (KeyValuePair<int, int> index in ZindexDictionary)
            {
                if (ZindexDictionary[index.Key] == zIndex - 1)
                {
                    ZindexDictionary[layerId] = zIndex - 1;
                    ZindexDictionary[index.Key] = zIndex;
                }
                ZindexDictionary.Remove(layerId);
            }
        }

        public void DownLayer(int layerId)
        {
            int zIndex = ZindexDictionary[layerId];
            foreach (KeyValuePair<int, int> index in ZindexDictionary)
            {
                if (ZindexDictionary[index.Key] == zIndex + 1)
                {
                    ZindexDictionary[layerId] = zIndex + 1;
                    ZindexDictionary[index.Key] = zIndex;
                }
                ZindexDictionary.Remove(layerId);
            }
        }
    }
}