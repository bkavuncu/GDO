using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.Linq;
using System.Web;
using GDO.Core;
using Microsoft.AspNet.SignalR;

namespace GDO.Apps.ShanghaiMetro
{
    [Export(typeof(IAppHub))]
    public class ShanghaiMetroAppHub : Hub, IAppHub
    {
        public string Name { get; set; } = "ShanghaiMetro";
        public int P2PMode { get; set; } = (int)Cave.P2PModes.None;
        public Type InstanceType { get; set; } = new ShanghaiMetroApp().GetType();
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
                    ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).SetMapPosition(topLeft, center, bottomRight, resolution, width, height, zoom);
                    Clients.Caller.receiveMapPosition(instanceId, topLeft, center, bottomRight, resolution, width, height, zoom);
                    BroadcastMapPosition(instanceId, topLeft, center, bottomRight, resolution, width, height, zoom);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void RequestTimeStep(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.receiveTimeStep(instanceId, ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).TimeStep);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void Animate(int instanceId)
        {
            try
            {
                if (((ShanghaiMetroApp) Cave.Apps["ShanghaiMetro"].Instances[instanceId]).IsAnimating == false)
                {
                    ((ShanghaiMetroApp) Cave.Apps["ShanghaiMetro"].Instances[instanceId]).IsAnimating = true;
                    while (((ShanghaiMetroApp) Cave.Apps["ShanghaiMetro"].Instances[instanceId]).IsAnimating)
                    {
                        System.Threading.Thread.Sleep(
                            ((ShanghaiMetroApp) Cave.Apps["ShanghaiMetro"].Instances[instanceId]).WaitTime);
                        if (((ShanghaiMetroApp) Cave.Apps["ShanghaiMetro"].Instances[instanceId]).TimeStep >= 540)
                        {
                            ((ShanghaiMetroApp) Cave.Apps["ShanghaiMetro"].Instances[instanceId]).TimeStep = 0;
                        }
                        Clients.Group("" + instanceId)
                            .receiveTimeStep(instanceId,
                                ((ShanghaiMetroApp) Cave.Apps["ShanghaiMetro"].Instances[instanceId]).TimeStep);
                        ((ShanghaiMetroApp) Cave.Apps["ShanghaiMetro"].Instances[instanceId]).TimeStep++;
                    }
                }
                else
                {
                    ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).IsAnimating = false;
                }
                
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        public void SetBingLayerVisible(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    if (((ShanghaiMetroApp) Cave.Apps["ShanghaiMetro"].Instances[instanceId]).BingLayer)
                    {
                        ((ShanghaiMetroApp) Cave.Apps["ShanghaiMetro"].Instances[instanceId]).BingLayer = false;
                    }
                    else
                    {
                        ((ShanghaiMetroApp) Cave.Apps["ShanghaiMetro"].Instances[instanceId]).BingLayer = true;
                    }
                    Clients.Group("" + instanceId).setBingLayerVisible(instanceId, ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).BingLayer);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void SetStamenLayerVisible(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    if (((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).StamenLayer)
                    {
                        ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).StamenLayer = false;
                    }
                    else
                    {
                        ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).StamenLayer = true;
                    }
                    Clients.Group("" + instanceId).setStamenLayerVisible(instanceId, ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).StamenLayer);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void SetStationLayerVisible(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    if (((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).StationLayer)
                    {
                        ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).StationLayer = false;
                    }
                    else
                    {
                        ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).StationLayer = true;
                    }
                    Clients.Group("" + instanceId).setStationLayerVisible(instanceId, ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).StationLayer);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void SetLineLayerVisible(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    if (((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).LineLayer)
                    {
                        ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).LineLayer = false;
                    }
                    else
                    {
                        ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).LineLayer = true;
                    }
                    Clients.Group("" + instanceId).setLineLayerVisible(instanceId, ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).LineLayer);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void SetEntryHeatmapLayerVisible(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    if (((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).EntryHeatmapLayer)
                    {
                        ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).EntryHeatmapLayer = false;
                    }
                    else
                    {
                        ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).EntryHeatmapLayer = true;
                    }
                    Clients.Group("" + instanceId).setEntryHeatmapLayerVisible(instanceId, ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).EntryHeatmapLayer);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }
        public void SetExitHeatmapLayerVisible(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    if (((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).ExitHeatmapLayer)
                    {
                        ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).ExitHeatmapLayer = false;
                    }
                    else
                    {
                        ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).ExitHeatmapLayer = true;
                    }
                    Clients.Group("" + instanceId).setExitHeatmapLayerVisible(instanceId, ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).ExitHeatmapLayer);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }
        public void SetCongestionHeatmapLayerVisible(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    if (((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).CongestionHeatmapLayer)
                    {
                        ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).CongestionHeatmapLayer = false;
                    }
                    else
                    {
                        ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).CongestionHeatmapLayer = true;
                    }
                    Clients.Group("" + instanceId).setCongestionHeatmapLayerVisible(instanceId, ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).CongestionHeatmapLayer);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void RequestBingLayerVisible(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setBingLayerVisible(instanceId, ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).BingLayer);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void RequestStamenLayerVisible(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setStamenLayerVisible(instanceId, ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).StamenLayer);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void RequestStationLayerVisible(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setStationLayerVisible(instanceId, ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).StationLayer);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void RequestLineLayerVisible(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setLineLayerVisible(instanceId, ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).LineLayer);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void RequestEntryHeatmapLayerVisible(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setEntryHeatmapLayerVisible(instanceId, ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).EntryHeatmapLayer);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void RequestExitHeatmapLayerVisible(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setExitHeatmapLayerVisible(instanceId, ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).ExitHeatmapLayer);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void RequestCongestionHeatmapLayerVisible(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setCongestionHeatmapLayerVisible(instanceId, ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).CongestionHeatmapLayer);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }


        public void UploadMapStyle(int instanceId, string style)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).Style = style;
                    Clients.Caller.receiveShanghaiMetrotyle(instanceId, style);
                    BroadcastMapStyle(instanceId, style);
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
                            MapPosition position = ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).GetMapPosition();
                            Clients.Caller.receiveInitialMapPosition(instanceId, position.Center, position.Resolution, position.Zoom);
                    }
                    else
                    {
                        if (((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).IsInitialized)
                        {
                            MapPosition position = ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).GetMapPosition();
                            Clients.Caller.receiveMapPosition(instanceId, position.TopLeft, position.Center, position.BottomRight, position.Resolution, position.Width, position.Height, position.Zoom);
                        }
                    }

                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }
        public void RequestMapStyle(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    string style = ((ShanghaiMetroApp) Cave.Apps["ShanghaiMetro"].Instances[instanceId]).Style;
                     Clients.Caller.receiveMapStyle(instanceId, style);
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
        public void BroadcastMapStyle(int instanceId, string style)
        {
            Clients.Group("" + instanceId).receiveShanghaiMetrotyle(instanceId, style);
        }

        public void Set3DMode(int instanceId, bool mode)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).mode = mode;
                    Clients.Group("" + instanceId).receive3DMode(instanceId, mode);
                    Clients.Caller.receive3DMode(instanceId, mode);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }

            }
        }

        public void Request3DMode(int instanceId, bool control)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.receive3DMode(instanceId, ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).mode);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
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