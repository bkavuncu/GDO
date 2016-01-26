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
        public void RequestQRCodeMode()
        {
            lock (Cave.ModuleLocks["EyeTracking"])
            {
                try
                {
                    Clients.Caller.updateQRCodeMode(((EyeTrackingModule)Cave.Modules["EyeTracking"]).QRCodeMode);

                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }
        public void SetQRCodeMode(bool mode)
        {
            lock (Cave.ModuleLocks["EyeTracking"])
            {
                try
                {
                    ((EyeTrackingModule) Cave.Modules["EyeTracking"]).QRCodeMode = mode;
                    Clients.All.updateQRCodeMode(mode);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }
    }
}