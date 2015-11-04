using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.Linq;
using System.Web;
using System.Web.UI.WebControls.WebParts;
using GDO.Core;
using GDO.Utility;
using Microsoft.AspNet.SignalR;

namespace GDO.Apps.Maps
{
    [Export(typeof(IAppHub))]
    public class MapsAppHub : Hub, IAppHub
    {
        public string Name { get; set; } = "Maps";
        public int P2PMode { get; set; } = (int)Cave.P2PModes.None;
        public Type InstanceType { get; set; } = new MapsApp().GetType();
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
                    ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]).SetMapPosition(topLeft, center, bottomRight, resolution, width, height, zoom);
                    Clients.Caller.receiveMapPosition(instanceId, topLeft, center, bottomRight, resolution, width, height, zoom);
                    BroadcastMapPosition(instanceId, topLeft, center, bottomRight, resolution, width, height, zoom);
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
                    ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]).SetLayerVisible(id);
                    Clients.Caller.setLayerVisible(instanceId, id);
                    Clients.Group("" + instanceId).setLayerVisible(instanceId, id);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void RequestLayerVisible(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    int id = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]).GetLayerVisible();
                    if (id >= 0)
                    {
                        Clients.Caller.setLayerVisible(instanceId, id);
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
                            MapPosition position = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]).GetMapPosition();
                            Clients.Caller.receiveInitialMapPosition(instanceId, position.Center, position.Resolution, position.Zoom);
                    }
                    else
                    {
                        //if (((MapsApp)Cave.Apps["Maps"].Instances[instanceId]).IsInitialized)
                        //{
                            MapPosition position = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]).GetMapPosition();
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

        public void BroadcastMapPosition(int instanceId, string[] topLeft, string[] center, string[] bottomRight, string resolution, int width, int height, int zoom)
        {
            Clients.Group("" + instanceId).receiveMapPosition(instanceId, topLeft, center, bottomRight, resolution, width, height, zoom);
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
