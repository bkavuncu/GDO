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

        public void Init()
        {
            this.Name = "EyeTracking";
        }

        public string SerializeJSON()
        {
            return JsonConvert.SerializeObject(this);
        }
    }
}