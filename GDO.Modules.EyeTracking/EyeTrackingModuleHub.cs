using System;
using System.ComponentModel.Composition;
using GDO.Core;
using Microsoft.AspNet.SignalR;
using Newtonsoft.Json.Linq;

namespace GDO.Modules.EyeTracking
{
    [Export(typeof (IModuleHub))]
    public class EyeTrackingModuleHub : Hub, IModuleHub
    {
        public string Name { get; set; } = "EyeTracking";
        public Type ModuleType { get; set; } = new EyeTrackingModule().GetType();

        public void JoinGroup(string moduleName)
        {
            Groups.Add(Context.ConnectionId, "" + moduleName);
        }

        public void ExitGroup(string moduleName)
        {
            Groups.Remove(Context.ConnectionId, "" + moduleName);
        }
    }
}