using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.Linq;
using System.Web;
using GDO.Core;
using GDO.Utility;
using Microsoft.AspNet.SignalR;

namespace GDO.Apps.ShanghaiMetro
{
    [Export(typeof(IAppHub))]
    public class ShanghaiMetroAppHub : Hub, IBaseAppHub
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

        public void RequestTimeStep()
        {
            int instanceId = Utilities.GetFirstKey(Cave.Apps["ShanghaiMetro"].Instances);
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.receiveTimeStep(instanceId, (((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).TimeStep));
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void SetProperties(int instanceId, int blur, int radius, float opacity, int line, int station, bool entry)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    ((ShanghaiMetroApp) Cave.Apps["ShanghaiMetro"].Instances[instanceId]).Blur = blur;
                    ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).Radius = radius;
                    ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).Opacity = opacity;
                    ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).StationWidth = station;
                    ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).LineWidth = line;
                    ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).Entry = entry;
                    Clients.Group("" + instanceId).receiveProperties(instanceId, blur, radius, opacity, line,station, entry);
                    Clients.Caller.receiveProperties(instanceId, blur, radius, opacity, line, station, entry);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void RequestProperties(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    int blur = ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).Blur;
                    int radius = ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).Radius;
                    float opacity = ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).Opacity;
                    int station = ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).StationWidth;
                    int line = ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).LineWidth;
                    bool entry = ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).Entry;
                    Clients.Caller.receiveProperties(instanceId, blur, radius, opacity, line, station, entry);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void StartAnimation()
        {
            int instanceId = Utilities.GetFirstKey(Cave.Apps["ShanghaiMetro"].Instances);
            try
            {
                if (((ShanghaiMetroApp) Cave.Apps["ShanghaiMetro"].Instances[instanceId]).IsAnimating == false)
                {
                    Animate();
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        public void Animate()
        {
            int instanceId = Utilities.GetFirstKey(Cave.Apps["ShanghaiMetro"].Instances);
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
                        foreach (KeyValuePair<int, IAppInstance> instanceKeyValuePair in Cave.Instances)
                        {
                            if (instanceKeyValuePair.Value.AppName == "ShanghaiMetro")
                            {
                                Clients.Group("" + instanceKeyValuePair.Value.Id).receiveTimeStep(
                                    ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).TimeStep);
                            }
                        }
                        ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).TimeStep++;
                    }
                }
                else
                {
                    ((ShanghaiMetroApp) Cave.Apps["ShanghaiMetro"].Instances[instanceId]).IsAnimating = false;
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
                    Clients.Caller.setBingLayerVisible(instanceId, ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).BingLayer);
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
                    Clients.Caller.setStamenLayerVisible(instanceId, ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).StamenLayer);
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
                    Clients.Caller.setStationLayerVisible(instanceId, ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).StationLayer);
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
                    Clients.Caller.setLineLayerVisible(instanceId, ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).LineLayer);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void SetHeatmapLayerVisible(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    if (((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).HeatmapLayer)
                    {
                        ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).HeatmapLayer = false;
                    }
                    else
                    {
                        ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).HeatmapLayer = true;
                    }
                    Clients.Group("" + instanceId).setHeatmapLayerVisible(instanceId, ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).HeatmapLayer);
                    Clients.Caller.setHeatmapLayerVisible(instanceId, ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).HeatmapLayer);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void SetEntry(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    if (((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).Entry)
                    {
                        ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).Entry = false;
                    }
                    else
                    {
                        ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).Entry = true;
                    }
                    Clients.Group("" + instanceId).setEntry(instanceId, ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).Entry);
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

        public void RequestHeatmapLayerVisible(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setHeatmapLayerVisible(instanceId, ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).HeatmapLayer);
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
                        //if (((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).IsInitialized)
                        //{
                            MapPosition position = ((ShanghaiMetroApp)Cave.Apps["ShanghaiMetro"].Instances[instanceId]).GetMapPosition();
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
