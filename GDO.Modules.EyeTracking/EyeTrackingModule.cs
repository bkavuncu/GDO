using System;
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

        public void Init()
        {
            this.Name = "EyeTracking";
            this.ReferenceMode = false;
            this.CursorMode = false;
            this.ReferenceSize = 35;
        }

        public string SerializeJSON()
        {
            return JsonConvert.SerializeObject(this);
        }
    }
}