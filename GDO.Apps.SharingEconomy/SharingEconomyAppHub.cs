using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using GDO.Core;
using GDO.Core.Apps;
using GDO.Utility;
using Microsoft.AspNet.SignalR;

namespace GDO.Apps.SharingEconomy
{
    [Export(typeof(IAppHub))]
    public class SharingEconomyAppHub : Hub, IBaseAppHub
    {
        public string Name { get; set; } = "SharingEconomy";
        public int P2PMode { get; set; } = (int)Cave.P2PModes.None;
        public Type InstanceType { get; set; } = new SharingEconomyApp().GetType();
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
                    ((SharingEconomyApp)Cave.Apps["SharingEconomy"].Instances[instanceId]).SetMapPosition(topLeft, center, bottomRight, resolution, width, height, zoom);
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
            int instanceId = Utilities.GetFirstKey(Cave.Apps["SharingEconomy"].Instances);
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.receiveTimeStep(instanceId, (((SharingEconomyApp)Cave.Apps["SharingEconomy"].Instances[instanceId]).TimeStep));
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void SetProperties(int instanceId, int blur, int radius, float opacity, int station, string dataseries)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    ((SharingEconomyApp) Cave.Apps["SharingEconomy"].Instances[instanceId]).Blur = blur;
                    ((SharingEconomyApp)Cave.Apps["SharingEconomy"].Instances[instanceId]).Radius = radius;
                    ((SharingEconomyApp)Cave.Apps["SharingEconomy"].Instances[instanceId]).Opacity = opacity;
                    ((SharingEconomyApp)Cave.Apps["SharingEconomy"].Instances[instanceId]).StationWidth = station;
                    ((SharingEconomyApp)Cave.Apps["SharingEconomy"].Instances[instanceId]).Dataserie = dataseries;
                    Clients.Group("" + instanceId).receiveProperties(instanceId, blur, radius, opacity, station, dataseries);
                    Clients.Caller.receiveProperties(instanceId, blur, radius, opacity, station, dataseries);
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
                    int blur = ((SharingEconomyApp)Cave.Apps["SharingEconomy"].Instances[instanceId]).Blur;
                    int radius = ((SharingEconomyApp)Cave.Apps["SharingEconomy"].Instances[instanceId]).Radius;
                    float opacity = ((SharingEconomyApp)Cave.Apps["SharingEconomy"].Instances[instanceId]).Opacity;
                    int station = ((SharingEconomyApp)Cave.Apps["SharingEconomy"].Instances[instanceId]).StationWidth;
                    string dataseries = ((SharingEconomyApp)Cave.Apps["SharingEconomy"].Instances[instanceId]).Dataserie;
                    Clients.Caller.receiveProperties(instanceId, blur, radius, opacity, station, dataseries);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void StartAnimation()
        {
            int instanceId = Utilities.GetFirstKey(Cave.Apps["SharingEconomy"].Instances);
            try
            {
                if (((SharingEconomyApp) Cave.Apps["SharingEconomy"].Instances[instanceId]).IsAnimating == false)
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
            int instanceId = Utilities.GetFirstKey(Cave.Apps["SharingEconomy"].Instances);
            try
            {
                if (((SharingEconomyApp) Cave.Apps["SharingEconomy"].Instances[instanceId]).IsAnimating == false)
                {
                    ((SharingEconomyApp) Cave.Apps["SharingEconomy"].Instances[instanceId]).IsAnimating = true;
                    while (((SharingEconomyApp) Cave.Apps["SharingEconomy"].Instances[instanceId]).IsAnimating)
                    {
                        System.Threading.Thread.Sleep(
                            ((SharingEconomyApp) Cave.Apps["SharingEconomy"].Instances[instanceId]).WaitTime);
                        if (((SharingEconomyApp) Cave.Apps["SharingEconomy"].Instances[instanceId]).TimeStep >= 5)
                        {
                            ((SharingEconomyApp) Cave.Apps["SharingEconomy"].Instances[instanceId]).TimeStep = 0;
                        }
                        foreach (KeyValuePair<int, IAppInstance> instanceKeyValuePair in Cave.Instances)
                        {
                            if (instanceKeyValuePair.Value.AppName == "SharingEconomy")
                            {
                                Clients.Group("" + instanceKeyValuePair.Value.Id).receiveTimeStep(
                                    ((SharingEconomyApp)Cave.Apps["SharingEconomy"].Instances[instanceId]).TimeStep);
                            }
                        }
                        ((SharingEconomyApp)Cave.Apps["SharingEconomy"].Instances[instanceId]).TimeStep++;
                    }
                }
                else
                {
                    ((SharingEconomyApp) Cave.Apps["SharingEconomy"].Instances[instanceId]).IsAnimating = false;
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
                    //change its value with !
                    ((SharingEconomyApp)Cave.Apps["SharingEconomy"].Instances[instanceId]).BingLayer =
                        !((SharingEconomyApp)Cave.Apps["SharingEconomy"].Instances[instanceId]).BingLayer;
                    
                    Clients.Group("" + instanceId).setBingLayerVisible(instanceId, ((SharingEconomyApp)Cave.Apps["SharingEconomy"].Instances[instanceId]).BingLayer);
                    Clients.Caller.setBingLayerVisible(instanceId, ((SharingEconomyApp)Cave.Apps["SharingEconomy"].Instances[instanceId]).BingLayer);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void SetCartoDBLayerVisible(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    //change its value with !
                    ((SharingEconomyApp) Cave.Apps["SharingEconomy"].Instances[instanceId]).CartoDBLayer =
                        !((SharingEconomyApp) Cave.Apps["SharingEconomy"].Instances[instanceId]).CartoDBLayer;

                    Clients.Group("" + instanceId).setCartoDBLayerVisible(instanceId, ((SharingEconomyApp)Cave.Apps["SharingEconomy"].Instances[instanceId]).CartoDBLayer);
                    Clients.Caller.setCartoDBLayerVisible(instanceId, ((SharingEconomyApp)Cave.Apps["SharingEconomy"].Instances[instanceId]).CartoDBLayer);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }
        public void SetOpenCycleLayerVisible(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    //change its value with !
                    ((SharingEconomyApp) Cave.Apps["SharingEconomy"].Instances[instanceId]).OpenCycleLayer =
                        !((SharingEconomyApp) Cave.Apps["SharingEconomy"].Instances[instanceId]).OpenCycleLayer;

                    Clients.Group("" + instanceId).setOpenCycleLayerVisible(instanceId, ((SharingEconomyApp)Cave.Apps["SharingEconomy"].Instances[instanceId]).OpenCycleLayer);
                    Clients.Caller.setOpenCycleLayerVisible(instanceId, ((SharingEconomyApp)Cave.Apps["SharingEconomy"].Instances[instanceId]).OpenCycleLayer);
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
                    //change its value with !
                    ((SharingEconomyApp)Cave.Apps["SharingEconomy"].Instances[instanceId]).StamenLayer =
                        !((SharingEconomyApp)Cave.Apps["SharingEconomy"].Instances[instanceId]).StamenLayer;

                    Clients.Group("" + instanceId).setStamenLayerVisible(instanceId, ((SharingEconomyApp)Cave.Apps["SharingEconomy"].Instances[instanceId]).StamenLayer);
                    Clients.Caller.setStamenLayerVisible(instanceId, ((SharingEconomyApp)Cave.Apps["SharingEconomy"].Instances[instanceId]).StamenLayer);
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
                    //change its value with !
                    ((SharingEconomyApp) Cave.Apps["SharingEconomy"].Instances[instanceId]).StationLayer =
                        !((SharingEconomyApp) Cave.Apps["SharingEconomy"].Instances[instanceId]).StationLayer;

                    Clients.Group("" + instanceId).setStationLayerVisible(instanceId, ((SharingEconomyApp)Cave.Apps["SharingEconomy"].Instances[instanceId]).StationLayer);
                    Clients.Caller.setStationLayerVisible(instanceId, ((SharingEconomyApp)Cave.Apps["SharingEconomy"].Instances[instanceId]).StationLayer);
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
                    //change its value with !
                    ((SharingEconomyApp)Cave.Apps["SharingEconomy"].Instances[instanceId]).HeatmapLayer = 
                        !((SharingEconomyApp)Cave.Apps["SharingEconomy"].Instances[instanceId]).HeatmapLayer;

                    Clients.Group("" + instanceId).setHeatmapLayerVisible(instanceId, ((SharingEconomyApp)Cave.Apps["SharingEconomy"].Instances[instanceId]).HeatmapLayer);
                    Clients.Caller.setHeatmapLayerVisible(instanceId, ((SharingEconomyApp)Cave.Apps["SharingEconomy"].Instances[instanceId]).HeatmapLayer);
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
                    Clients.Caller.setBingLayerVisible(instanceId, ((SharingEconomyApp)Cave.Apps["SharingEconomy"].Instances[instanceId]).BingLayer);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void RequestCartoDBLayerVisible(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setCartoDBLayerVisible(instanceId, ((SharingEconomyApp)Cave.Apps["SharingEconomy"].Instances[instanceId]).CartoDBLayer);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }
        public void RequestOpenCycleLayerVisible(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setOpenCycleLayerVisible(instanceId, ((SharingEconomyApp)Cave.Apps["SharingEconomy"].Instances[instanceId]).OpenCycleLayer);
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
                    Clients.Caller.setStamenVisible(instanceId, ((SharingEconomyApp)Cave.Apps["SharingEconomy"].Instances[instanceId]).StamenLayer);
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
                    Clients.Caller.setStationLayerVisible(instanceId, ((SharingEconomyApp)Cave.Apps["SharingEconomy"].Instances[instanceId]).StationLayer);
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
                    Clients.Caller.setHeatmapLayerVisible(instanceId, ((SharingEconomyApp)Cave.Apps["SharingEconomy"].Instances[instanceId]).HeatmapLayer);
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
                    ((SharingEconomyApp)Cave.Apps["SharingEconomy"].Instances[instanceId]).Style = style;
                    Clients.Caller.receiveLeedstyle(instanceId, style);
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
                    MapPosition position = ((SharingEconomyApp)Cave.Apps["SharingEconomy"].Instances[instanceId]).GetMapPosition();
                    if (control)
                    {
                        Clients.Caller.receiveInitialMapPosition(instanceId, position.Center, position.Resolution, position.Zoom);
                    }
                    else
                    {
                        Clients.Caller.receiveMapPosition(instanceId, position.TopLeft, position.Center, position.BottomRight, position.Resolution, position.Width, position.Height, position.Zoom);
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
                    string style = ((SharingEconomyApp) Cave.Apps["SharingEconomy"].Instances[instanceId]).Style;
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
            Clients.Group("" + instanceId).receiveLeedstyle(instanceId, style);
        }

        public void Set3DMode(int instanceId, bool mode)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    ((SharingEconomyApp)Cave.Apps["SharingEconomy"].Instances[instanceId]).mode = mode;
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
                    Clients.Caller.receive3DMode(instanceId, ((SharingEconomyApp)Cave.Apps["SharingEconomy"].Instances[instanceId]).mode);
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
