using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.Linq;
using System.Web;
using GDO.Core;
using GDO.Core.Apps;

using GDO.Utility;
using Microsoft.AspNet.SignalR;

namespace GDO.Apps.BasicMaps
{
    [Export(typeof(IAppHub))]
    public class BasicMapsAppHub : Hub, IBaseAppHub
    {
        public string Name { get; set; } = "BasicMaps";
        public int P2PMode { get; set; } = (int)Cave.P2PModes.None;
        public Type InstanceType { get; set; } = new BasicMapsApp().GetType();
        public void JoinGroup(int instanceId)
        {
            Groups.Add(Context.ConnectionId, "" + instanceId);
        }
        public void ExitGroup(int instanceId)
        {
            Groups.Remove(Context.ConnectionId, "" + instanceId);
        }

        public void UploadMapPosition(int instanceId, string[] topLeft, string[] center, string[] bottomRight, string resolution, int width, int height,  int zoom)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    ((BasicMapsApp)Cave.Apps["BasicMaps"].Instances[instanceId]).SetMapPosition(topLeft, center, bottomRight, resolution, width, height, zoom);
                    Clients.Caller.receiveMapPosition(instanceId, topLeft, center, bottomRight, resolution, width, height, zoom);
                    BroadcastMapPosition(instanceId, topLeft, center, bottomRight, resolution, width, height, zoom);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UploadMarkerPosition(int instanceId, string[] pos)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    ((BasicMapsApp)Cave.Apps["BasicMaps"].Instances[instanceId]).SetMarkerPosition(pos);
                    Clients.Caller.receiveMarkerPosition(instanceId, pos);
                    BroadcastMarkerPosition(instanceId, pos);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void SetLayerVisible(int instanceId, int id)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    ((BasicMapsApp)Cave.Apps["BasicMaps"].Instances[instanceId]).SetLayerVisible(id);
                    Clients.Caller.setLayerVisible(instanceId, id);
                    Clients.Group("" + instanceId).setLayerVisible(instanceId, id);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void RequestLayersVisible(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    List<int> visible = ((BasicMapsApp)Cave.Apps["BasicMaps"].Instances[instanceId]).GetLayersVisible();
                    foreach (int layer in visible)
                    {
                        Clients.Caller.setLayerVisible(instanceId, layer);
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void RequestMapPosition(int instanceId, bool control)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    if (control)
                    {
                            MapPosition position = ((BasicMapsApp)Cave.Apps["BasicMaps"].Instances[instanceId]).GetMapPosition();
                            Clients.Caller.receiveInitialMapPosition(instanceId, position.Center, position.Resolution, position.Zoom);
                    }
                    else
                    {
                        //if (((MapsApp)Cave.Apps["BasicMaps"].Instances[instanceId]).IsInitialized)
                        //{
                            MapPosition position = ((BasicMapsApp)Cave.Apps["BasicMaps"].Instances[instanceId]).GetMapPosition();
                            Clients.Caller.receiveMapPosition(instanceId, position.TopLeft, position.Center, position.BottomRight, position.Resolution, position.Width, position.Height, position.Zoom);
                        //}
                    }

                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void RequestMarkerPosition(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    string[] position = ((BasicMapsApp)Cave.Apps["BasicMaps"].Instances[instanceId]).GetMarkerPosition();
                    Clients.Caller.receiveMarkerPosition(instanceId, position);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void BroadcastMapPosition(int instanceId, string[] topLeft, string[] center, string[] bottomRight, string resolution, int width, int height, int zoom)
        {
            Clients.Group("" + instanceId).receiveMapPosition(instanceId, topLeft, center, bottomRight, resolution, width, height, zoom);
        }

        public void BroadcastMarkerPosition(int instanceId, string[] pos)
        {
            Clients.Group("" + instanceId).receiveMarkerPosition(instanceId, pos);
        }

        public void UpdateResolution(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.updateResolution(instanceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }
    }
}
