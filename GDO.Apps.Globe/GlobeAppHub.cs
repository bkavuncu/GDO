using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.Diagnostics;
using System.Linq;
using GDO.Core;
using GDO.Core.Apps;
using Microsoft.AspNet.SignalR;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace GDO.Apps.Globe
{
    [Export(typeof(IAppHub))]
    public class GlobeAppHub : Hub, IBaseAppHub
    {
        public string Name { get; set; } = "Globe";
        public int P2PMode { get; set; } = (int)Cave.P2PModes.None;
        public Type InstanceType { get; set; } = new GlobeApp().GetType();

        public void JoinGroup(string groupId)
        {
            Groups.Add(Context.ConnectionId, "" + groupId);
        }

        public void ExitGroup(string groupId)
        {
            Groups.Remove(Context.ConnectionId, "" + groupId);
        }

        public void BroadcastMarkerUpdates(int instanceId, List<Marker> markers)
        {
            Clients.Caller.setMessage(instanceId, "Server broadcasting update for " + markers.Count + " markers");
            string serialisedMarkers = JsonConvert.SerializeObject(markers);
            Clients.Group("" + instanceId).receiveMarkerVisibility(instanceId, serialisedMarkers);
            Clients.Caller.receiveMarkerVisibility(instanceId, serialisedMarkers);
        }

        public void GetInit(int instanceId)
        {
            try
            {
                string markers =
                    JsonConvert.SerializeObject(
                        ((GlobeApp) Cave.Apps["Globe"].Instances[instanceId]).GlobeMarkers.Select(d => d.Value).ToList());
                Clients.Caller.receiveMarkers(instanceId, markers);
                Clients.Group("" + instanceId).receiveMarkers(instanceId, markers);
                BroadcastMarkerUpdates(instanceId,
                    ((GlobeApp) Cave.Apps["Globe"].Instances[instanceId]).GlobeMarkers.Select(d => d.Value).ToList()
                );
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        public void SetScalingMode(int instanceId, int mode)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Group("" + instanceId).setScalingMode(instanceId, mode);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void SetMarkerVisibility(int instanceId, string markerId, bool isVisible)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Debug.WriteLine(isVisible);
                    BroadcastMarkerUpdates(instanceId, new List<Marker>()
                    {
                        ((GlobeApp) Cave.Apps["Globe"].Instances[instanceId])
                        .SetMarkerState(markerId,isVisible)
                    });
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }
        
        public void ShowAll(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    BroadcastMarkerUpdates(instanceId,
                        ((GlobeApp)Cave.Apps["Globe"].Instances[instanceId]).ShowAll());
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void HideAll(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    BroadcastMarkerUpdates(instanceId,
                        ((GlobeApp)Cave.Apps["Globe"].Instances[instanceId]).HideAll());
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void ProcessMarkers(int instanceId, string fileId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setMessage(instanceId, "Getting markers from file: " + fileId);
                    string markers = ((GlobeApp)Cave.Apps["Globe"].Instances[instanceId]).ProcessMarkers(instanceId, fileId);
                    Clients.Group("" + instanceId).receiveMarkers(instanceId, markers);
                    Clients.Caller.receiveMarkers(instanceId, markers);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void Pan(int instanceId, int x, int y)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    ((GlobeApp)Cave.Apps["Globe"].Instances[instanceId]).Pan(x,y);
                    Clients.Group("" + instanceId).pan(instanceId, x, y);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void Zoom(int instanceId, int i)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    ((GlobeApp)Cave.Apps["Globe"].Instances[instanceId]).Zoom(i);
                    Clients.Group("" + instanceId).zoom(instanceId, i);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void Tilt(int instanceId, int i)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    ((GlobeApp)Cave.Apps["Globe"].Instances[instanceId]).Tilt(i);
                    Clients.Group("" + instanceId).tilt(instanceId, i);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateState(int instanceId, float lat, float lng, float zoom)
        {
            Debug.WriteLine("Received viewpoint state: " + lat + " " + lng + " " + zoom);
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    ((GlobeApp)Cave.Apps["Globe"].Instances[instanceId]).UpdateState(lat, lng, zoom);
                    Clients.Group("" + instanceId).receiveState(instanceId, lat, lng, zoom);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }


    }
}