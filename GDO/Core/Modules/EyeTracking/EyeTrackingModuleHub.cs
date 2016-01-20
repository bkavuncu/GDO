using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;

namespace GDO.Core.Modules.EyeTracking
{
    public class EyeTrackingModuleHub : Hub, IModuleHub
    {
        public string Name { get; set; } = "EyeTracking";
    }
}