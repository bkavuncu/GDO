using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.Linq;
using System.Web;
using GDO.Core;
using Microsoft.AspNet.SignalR;

namespace GDO.Apps.Maps
{
    [Export(typeof(IAppHub))]
    public class MapsAppHub : Hub, IAppHub
    {
        public string Name { get; set; } = "Maps";
        public int P2PMode { get; set; } = (int)Cave.P2PModes.Neighbours;
        public Type InstanceType { get; set; } = new MapsApp().GetType();
        public void JoinGroup(int instanceId)
        {
            Groups.Add(Context.ConnectionId, "" + instanceId);
        }
        public void ExitGroup(int instanceId)
        {
            Groups.Remove(Context.ConnectionId, "" + instanceId);
        }

        public void UploadGlobalMapPosition(int instanceId, string[] longtitudes, string[] latitudes, string resolution, int width, int height,  int zoom)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]).SetGlobalMapPosition(longtitudes, latitudes, resolution,width, height,zoom);
                    BroadcastGlobalMapPosition(instanceId, longtitudes, latitudes, resolution, width, height, zoom);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void RequestGlobalMapPosition(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapPosition global = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]).GetGlobalMapPosition();
                    if (global != null)
                    {
                        Clients.Caller.receiveGlobalMapPosition(instanceId, global.Longtitudes, global.Latitudes, global.Resolution, global.Width, global.Height, global.Zoom);
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }
        public void BroadcastGlobalMapPosition(int instanceId, string[] longtitudes, string[] latitudes, string resolution, int width, int height, int zoom)
        {
            Clients.Group("" + instanceId).receiveGlobalMapPosition(instanceId, longtitudes, latitudes, resolution, width, height, zoom);
        }

        /*public void BroadcastMapUpdates(int instanceId)
        {
            Clients.Group("" + instanceId).receiveMapUpdateNotification(instanceId);
        }*/

        /*public void RequestMapUpdate(int instanceId, int sectionCol, int sectionRow)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    if (((MapsApp)Cave.Apps["Maps"].Instances[instanceId]).initialUpload)
                    {
                        MapPosition local = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]).GetLocalMapPosition(sectionCol, sectionRow);
                        Clients.Caller.receiveMapUpdate(instanceId, local.Longtitude, local.Latitude, local.Resolution, local.Zoom);
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }*/
    }
}