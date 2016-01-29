using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Core;
using Newtonsoft.Json;

namespace GDO.Modules.EyeTracking
{
    public class EyeTrackingModule : IModule
    {
        public string Name { get; set; }
        public bool ReferenceMode { get; set; }
        public bool CursorMode { get; set; }
        public int ReferenceSize { get; set; }
        public int CacheSize { get; set; }
        public int NumUsers { get; set; } = 4;
        public ConcurrentDictionary<int,TrackData>[]  User{ get; set; }

        public void Init()
        {
            this.Name = "EyeTracking";
            this.ReferenceMode = false;
            this.CursorMode = false;
            this.ReferenceSize = 21;
            this.CacheSize = 1000;
            User = new ConcurrentDictionary<int, TrackData>[NumUsers+1];
            for (int i = 1; i < NumUsers + 1; i++)
            {
                User[i] = new ConcurrentDictionary<int, TrackData>();
            }
        }

        public string SerializeJSON()
        {
            return JsonConvert.SerializeObject(this);
        }

        public class TrackData
        {
            public int TimeStamp { get; set; }
            public int UserId { get; set; }
            public int NodeId { get; set; }
            public int X { get; set; }
            public int Y { get; set; }
            public int Angle { get; set; }
            public int Distance { get; set; }
            public string SerializeJSON()
            {
                return JsonConvert.SerializeObject(this);
            }
        }
    }
}