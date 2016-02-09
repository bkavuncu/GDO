using System;
using System.ComponentModel.Composition;
using System.Linq;
using System.Threading;
using GDO.Core;
using Microsoft.AspNet.SignalR;
using Newtonsoft.Json;
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
        //Request Marker input node id
        public void RequestMarkerMode()
        {
            lock (Cave.ModuleLocks["EyeTracking"])
            {
                try
                {
                    Clients.Caller.updateMarkerMode(((EyeTrackingModule)Cave.Modules["EyeTracking"]).MarkerMode);

                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }
        public void SetMarkerMode(bool mode)
        {
            lock (Cave.ModuleLocks["EyeTracking"])
            {
                try
                {
                    ((EyeTrackingModule) Cave.Modules["EyeTracking"]).MarkerMode = mode;
                    Clients.All.updateMarkerMode(mode);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }
        public void RequestMarkers()
        {
            lock (Cave.ModuleLocks["EyeTracking"])
            {
                try
                {
                    Clients.Caller.receiveMarkers(((EyeTrackingModule)Cave.Modules["EyeTracking"]).SerializeMarkers());

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
        public void RequestMarkerSize()
        {
            lock (Cave.ModuleLocks["EyeTracking"])
            {
                try
                {
                    Clients.Caller.updateMarkerSize(((EyeTrackingModule)Cave.Modules["EyeTracking"]).MarkerSize);

                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }
        public void SetMarkerSize(int size)
        {
            lock (Cave.ModuleLocks["EyeTracking"])
            {
                try
                {
                    ((EyeTrackingModule)Cave.Modules["EyeTracking"]).MarkerSize = size;
                    Clients.All.updateMarkerSize(size);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }
        public void RequestCursorSize()
        {
            lock (Cave.ModuleLocks["EyeTracking"])
            {
                try
                {
                    Clients.Caller.updateCursorSize(((EyeTrackingModule)Cave.Modules["EyeTracking"]).CursorSize);

                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }
        public void SetCursorSize(int size)
        {
            lock (Cave.ModuleLocks["EyeTracking"])
            {
                try
                {
                    ((EyeTrackingModule)Cave.Modules["EyeTracking"]).CursorSize = size;
                    Clients.All.updateCursorSize(size);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }
        public void RequestCacheSize()
        {
            lock (Cave.ModuleLocks["EyeTracking"])
            {
                try
                {
                    Clients.Caller.updateCacheSize(((EyeTrackingModule)Cave.Modules["EyeTracking"]).CacheSize);

                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }
        public void SetCacheSize(int size)
        {
            lock (Cave.ModuleLocks["EyeTracking"])
            {
                try
                {
                    ((EyeTrackingModule)Cave.Modules["EyeTracking"]).CacheSize = size;
                    Clients.All.updateCacheSize(size);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }


        /*public void UploadData(string serializedData)
        {
            lock (Cave.ModuleLocks["EyeTracking"])
            {
                try
                {
                    EyeTrackingModule.TrackData deserializedData = JsonConvert.DeserializeObject<EyeTrackingModule.TrackData>(serializedData);
                    if (((EyeTrackingModule) Cave.Modules["EyeTracking"]).User[deserializedData.UserId].Count >
                        ((EyeTrackingModule) Cave.Modules["EyeTracking"]).CacheSize)
                    {
                        EyeTrackingModule.TrackData remove;
                        ((EyeTrackingModule)Cave.Modules["EyeTracking"]).User[deserializedData.UserId].TryRemove(((EyeTrackingModule)Cave.Modules["EyeTracking"]).User[deserializedData.UserId].Keys.First(),out remove);
                    }
                    ((EyeTrackingModule)Cave.Modules["EyeTracking"]).User[deserializedData.UserId].TryAdd(deserializedData.TimeStamp, deserializedData); ;
                    BroadcastData(serializedData);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }*/

        private void BroadcastData(string serializedData)
        {
            try
            {
                Clients.All.receiveData(serializedData);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                Clients.Caller.setMessage(e.GetType().ToString());
            }
        }

        public void RequestConnectionStatus(int userId)
        {
            lock (Cave.ModuleLocks["EyeTracking"])
            {
                try
                {
                    Clients.Caller.receiveConnectionStatus(userId, ((EyeTrackingModule)Cave.Modules["EyeTracking"]).Users[userId].IsConnected, ((EyeTrackingModule)Cave.Modules["EyeTracking"]).Users[userId].IsReceiving);

                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }
        public void SetConnectionStatus(int userId, bool status, string ip, int port)
        {
            lock (Cave.ModuleLocks["EyeTracking"])
            {
                try
                {
                    if (status)
                    {
                        ((EyeTrackingModule)Cave.Modules["EyeTracking"]).Users[userId].IP = ip;
                        ((EyeTrackingModule)Cave.Modules["EyeTracking"]).Users[userId].Port = port;
                        ((EyeTrackingModule) Cave.Modules["EyeTracking"]).Users[userId].Thread = new Thread(((EyeTrackingModule)Cave.Modules["EyeTracking"]).Users[userId].StartTCPClient);
                        ((EyeTrackingModule)Cave.Modules["EyeTracking"]).Users[userId].Thread.Start();
                    }
                    else
                    {
                        ((EyeTrackingModule)Cave.Modules["EyeTracking"]).Users[userId].StopTCPClient();
                    }
                    System.Threading.Thread.Sleep(700);
                    BroadcastConnectionStatus(userId, ((EyeTrackingModule)Cave.Modules["EyeTracking"]).Users[userId].IsConnected, ((EyeTrackingModule)Cave.Modules["EyeTracking"]).Users[userId].IsReceiving);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }

        private void BroadcastConnectionStatus(int userId, bool connectionStatus, bool streamStatus)
        {
            try
            {
                Clients.All.receiveConnectionStatus(userId, connectionStatus, streamStatus);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                Clients.Caller.setMessage(e.GetType().ToString());
            }
        }
    }
}