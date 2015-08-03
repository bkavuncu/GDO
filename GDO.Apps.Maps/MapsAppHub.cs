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

        public void UploadMapPosition(int instanceId, string longtitude, string latitude, string resolution, int zoom)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]).SetGlobalMapPosition(Convert.ToDouble(longtitude), Convert.ToDouble(latitude), Convert.ToDouble(resolution),zoom);
                    BroadcastMapUpdates(instanceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void RequestMapUpdate(int instanceId, int sectionCol, int sectionRow)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    if (((MapsApp) Cave.Apps["Maps"].Instances[instanceId]).initialUpload)
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
            
            ;
        }

        public void BroadcastMapUpdates(int instanceId)
        {
            Clients.Group("" + instanceId).receiveMapUpdateNotification(instanceId);
            //Clients.All.receiveMapUpdateNotification(instanceId);
        }
    }
}