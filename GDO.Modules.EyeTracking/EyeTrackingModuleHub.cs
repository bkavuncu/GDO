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
        public void RequestReferenceMode()
        {
            lock (Cave.ModuleLocks["EyeTracking"])
            {
                try
                {
                    Clients.Caller.updateReferenceMode(((EyeTrackingModule)Cave.Modules["EyeTracking"]).ReferenceMode);

                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }
        public void SetReferenceMode(bool mode)
        {
            lock (Cave.ModuleLocks["EyeTracking"])
            {
                try
                {
                    ((EyeTrackingModule) Cave.Modules["EyeTracking"]).ReferenceMode = mode;
                    Clients.All.updateReferenceMode(mode);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }
        public void RequestCursorMode()
        {
            lock (Cave.ModuleLocks["EyeTracking"])
            {
                try
                {
                    Clients.Caller.updateCursorMode(((EyeTrackingModule)Cave.Modules["EyeTracking"]).CursorMode);

                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }
        public void SetCursorMode(bool mode)
        {
            lock (Cave.ModuleLocks["EyeTracking"])
            {
                try
                {
                    ((EyeTrackingModule)Cave.Modules["EyeTracking"]).CursorMode = mode;
                    Clients.All.updateCursorMode(mode);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }
        public void RequestReferenceSize()
        {
            lock (Cave.ModuleLocks["EyeTracking"])
            {
                try
                {
                    Clients.Caller.updateReferenceSize(((EyeTrackingModule)Cave.Modules["EyeTracking"]).ReferenceSize);

                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }
        public void SetReferenceSize(int size)
        {
            lock (Cave.ModuleLocks["EyeTracking"])
            {
                try
                {
                    ((EyeTrackingModule)Cave.Modules["EyeTracking"]).ReferenceSize = size;
                    Clients.All.updateReferenceSize(size);
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