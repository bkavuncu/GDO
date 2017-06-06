using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using GDO.Core;
using GDO.Core.Apps;
using GDO.Utility;
using Microsoft.AspNet.SignalR;

namespace GDO.Apps.Leeds
{
    [Export(typeof(IAppHub))]
    public class LeedsAppHub : Hub, IBaseAppHub
    {
        public string Name { get; set; } = "Leeds";
        public int P2PMode { get; set; } = (int)Cave.P2PModes.None;
        public Type InstanceType { get; set; } = new LeedsApp().GetType();
        public void JoinGroup(string groupId)
        {
            Cave.Deployment.Apps[Name].Hub.Clients = Clients;
            Groups.Add(Context.ConnectionId, "" + groupId);
        }
        public void ExitGroup(string groupId)
        {
            Groups.Remove(Context.ConnectionId, "" + groupId);
        }

        public void UploadMapPosition(int instanceId, string[] topLeft, string[] center, string[] bottomRight, string resolution, int width, int height,  int zoom)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    ((LeedsApp)Cave.Deployment.Apps["Leeds"].Instances[instanceId]).SetMapPosition(topLeft, center, bottomRight, resolution, width, height, zoom);
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
            int instanceId = Utilities.GetFirstKey(Cave.Deployment.Apps["Leeds"].Instances);
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.receiveTimeStep(instanceId, (((LeedsApp)Cave.Deployment.Apps["Leeds"].Instances[instanceId]).TimeStep));
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
                    ((LeedsApp) Cave.Deployment.Apps["Leeds"].Instances[instanceId]).Blur = blur;
                    ((LeedsApp)Cave.Deployment.Apps["Leeds"].Instances[instanceId]).Radius = radius;
                    ((LeedsApp)Cave.Deployment.Apps["Leeds"].Instances[instanceId]).Opacity = opacity;
                    ((LeedsApp)Cave.Deployment.Apps["Leeds"].Instances[instanceId]).StationWidth = station;
                    ((LeedsApp)Cave.Deployment.Apps["Leeds"].Instances[instanceId]).Dataserie = dataseries;
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
                    int blur = ((LeedsApp)Cave.Deployment.Apps["Leeds"].Instances[instanceId]).Blur;
                    int radius = ((LeedsApp)Cave.Deployment.Apps["Leeds"].Instances[instanceId]).Radius;
                    float opacity = ((LeedsApp)Cave.Deployment.Apps["Leeds"].Instances[instanceId]).Opacity;
                    int station = ((LeedsApp)Cave.Deployment.Apps["Leeds"].Instances[instanceId]).StationWidth;
                    string dataseries = ((LeedsApp)Cave.Deployment.Apps["Leeds"].Instances[instanceId]).Dataserie;
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
            int instanceId = Utilities.GetFirstKey(Cave.Deployment.Apps["Leeds"].Instances);
            try
            {
                if (((LeedsApp) Cave.Deployment.Apps["Leeds"].Instances[instanceId]).IsAnimating == false)
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
            int instanceId = Utilities.GetFirstKey(Cave.Deployment.Apps["Leeds"].Instances);
            try
            {
                if (((LeedsApp) Cave.Deployment.Apps["Leeds"].Instances[instanceId]).IsAnimating == false)
                {
                    ((LeedsApp) Cave.Deployment.Apps["Leeds"].Instances[instanceId]).IsAnimating = true;
                    while (((LeedsApp) Cave.Deployment.Apps["Leeds"].Instances[instanceId]).IsAnimating)
                    {
                        System.Threading.Thread.Sleep(
                            ((LeedsApp) Cave.Deployment.Apps["Leeds"].Instances[instanceId]).WaitTime);
                        if (((LeedsApp) Cave.Deployment.Apps["Leeds"].Instances[instanceId]).TimeStep >= 8523)
                        {
                            ((LeedsApp) Cave.Deployment.Apps["Leeds"].Instances[instanceId]).TimeStep = 0;
                        }
                        foreach (KeyValuePair<int, IAppInstance> instanceKeyValuePair in Cave.Deployment.Instances)
                        {
                            if (instanceKeyValuePair.Value.AppName == "Leeds")
                            {
                                Clients.Group("" + instanceKeyValuePair.Value.Id).receiveTimeStep(
                                    ((LeedsApp)Cave.Deployment.Apps["Leeds"].Instances[instanceId]).TimeStep);
                            }
                        }
                        ((LeedsApp)Cave.Deployment.Apps["Leeds"].Instances[instanceId]).TimeStep++;
                    }
                }
                else
                {
                    ((LeedsApp) Cave.Deployment.Apps["Leeds"].Instances[instanceId]).IsAnimating = false;
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
                    ((LeedsApp)Cave.Deployment.Apps["Leeds"].Instances[instanceId]).BingLayer =
                        !((LeedsApp)Cave.Deployment.Apps["Leeds"].Instances[instanceId]).BingLayer;
                    
                    Clients.Group("" + instanceId).setBingLayerVisible(instanceId, ((LeedsApp)Cave.Deployment.Apps["Leeds"].Instances[instanceId]).BingLayer);
                    Clients.Caller.setBingLayerVisible(instanceId, ((LeedsApp)Cave.Deployment.Apps["Leeds"].Instances[instanceId]).BingLayer);
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
                    ((LeedsApp) Cave.Deployment.Apps["Leeds"].Instances[instanceId]).CartoDBLayer =
                        !((LeedsApp) Cave.Deployment.Apps["Leeds"].Instances[instanceId]).CartoDBLayer;

                    Clients.Group("" + instanceId).setCartoDBLayerVisible(instanceId, ((LeedsApp)Cave.Deployment.Apps["Leeds"].Instances[instanceId]).CartoDBLayer);
                    Clients.Caller.setCartoDBLayerVisible(instanceId, ((LeedsApp)Cave.Deployment.Apps["Leeds"].Instances[instanceId]).CartoDBLayer);
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
                    ((LeedsApp) Cave.Deployment.Apps["Leeds"].Instances[instanceId]).OpenCycleLayer =
                        !((LeedsApp) Cave.Deployment.Apps["Leeds"].Instances[instanceId]).OpenCycleLayer;

                    Clients.Group("" + instanceId).setOpenCycleLayerVisible(instanceId, ((LeedsApp)Cave.Deployment.Apps["Leeds"].Instances[instanceId]).OpenCycleLayer);
                    Clients.Caller.setOpenCycleLayerVisible(instanceId, ((LeedsApp)Cave.Deployment.Apps["Leeds"].Instances[instanceId]).OpenCycleLayer);
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
                    ((LeedsApp)Cave.Deployment.Apps["Leeds"].Instances[instanceId]).StamenLayer =
                        !((LeedsApp)Cave.Deployment.Apps["Leeds"].Instances[instanceId]).StamenLayer;

                    Clients.Group("" + instanceId).setStamenLayerVisible(instanceId, ((LeedsApp)Cave.Deployment.Apps["Leeds"].Instances[instanceId]).StamenLayer);
                    Clients.Caller.setStamenLayerVisible(instanceId, ((LeedsApp)Cave.Deployment.Apps["Leeds"].Instances[instanceId]).StamenLayer);
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
                    ((LeedsApp) Cave.Deployment.Apps["Leeds"].Instances[instanceId]).StationLayer =
                        !((LeedsApp) Cave.Deployment.Apps["Leeds"].Instances[instanceId]).StationLayer;

                    Clients.Group("" + instanceId).setStationLayerVisible(instanceId, ((LeedsApp)Cave.Deployment.Apps["Leeds"].Instances[instanceId]).StationLayer);
                    Clients.Caller.setStationLayerVisible(instanceId, ((LeedsApp)Cave.Deployment.Apps["Leeds"].Instances[instanceId]).StationLayer);
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
                    ((LeedsApp)Cave.Deployment.Apps["Leeds"].Instances[instanceId]).HeatmapLayer = 
                        !((LeedsApp)Cave.Deployment.Apps["Leeds"].Instances[instanceId]).HeatmapLayer;

                    Clients.Group("" + instanceId).setHeatmapLayerVisible(instanceId, ((LeedsApp)Cave.Deployment.Apps["Leeds"].Instances[instanceId]).HeatmapLayer);
                    Clients.Caller.setHeatmapLayerVisible(instanceId, ((LeedsApp)Cave.Deployment.Apps["Leeds"].Instances[instanceId]).HeatmapLayer);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

 /*       public void SetEntry(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    switch (((LeedsApp)Cave.Deployment.Apps["Leeds"].Instances[instanceId]).Dataserie)
                    {
                        case "entries":
                            ((LeedsApp)Cave.Deployment.Apps["Leeds"].Instances[instanceId]).Dataserie = "entries";
                            break;
                        case "exits":
                            ((LeedsApp)Cave.Deployment.Apps["Leeds"].Instances[instanceId]).Dataserie = "exits";
                            break;
                        case "emptiness":
                            ((LeedsApp)Cave.Deployment.Apps["Leeds"].Instances[instanceId]).Dataserie = "emptiness";
                            break;
                    }*/
                    /*
                    if (((LeedsApp)Cave.Deployment.Apps["Leeds"].Instances[instanceId]).Dataserie)
                    {
                        ((LeedsApp)Cave.Deployment.Apps["Leeds"].Instances[instanceId]).Dataserie = false;
                    }
                    else
                    {
                        ((LeedsApp)Cave.Deployment.Apps["Leeds"].Instances[instanceId]).Dataserie = true;
                    }*/
 /*                   Clients.Group("" + instanceId).setEntry(instanceId, ((LeedsApp)Cave.Deployment.Apps["Leeds"].Instances[instanceId]).Dataserie);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        } */

        public void RequestBingLayerVisible(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setBingLayerVisible(instanceId, ((LeedsApp)Cave.Deployment.Apps["Leeds"].Instances[instanceId]).BingLayer);
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
                    Clients.Caller.setCartoDBLayerVisible(instanceId, ((LeedsApp)Cave.Deployment.Apps["Leeds"].Instances[instanceId]).CartoDBLayer);
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
                    Clients.Caller.setOpenCycleLayerVisible(instanceId, ((LeedsApp)Cave.Deployment.Apps["Leeds"].Instances[instanceId]).OpenCycleLayer);
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
                    Clients.Caller.setStamenVisible(instanceId, ((LeedsApp)Cave.Deployment.Apps["Leeds"].Instances[instanceId]).StamenLayer);
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
                    Clients.Caller.setStationLayerVisible(instanceId, ((LeedsApp)Cave.Deployment.Apps["Leeds"].Instances[instanceId]).StationLayer);
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
                    Clients.Caller.setHeatmapLayerVisible(instanceId, ((LeedsApp)Cave.Deployment.Apps["Leeds"].Instances[instanceId]).HeatmapLayer);
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
                    ((LeedsApp)Cave.Deployment.Apps["Leeds"].Instances[instanceId]).Style = style;
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
                    MapPosition position = ((LeedsApp)Cave.Deployment.Apps["Leeds"].Instances[instanceId]).GetMapPosition();
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
                    string style = ((LeedsApp) Cave.Deployment.Apps["Leeds"].Instances[instanceId]).Style;
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
                    ((LeedsApp)Cave.Deployment.Apps["Leeds"].Instances[instanceId]).mode = mode;
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
                    Clients.Caller.receive3DMode(instanceId, ((LeedsApp)Cave.Deployment.Apps["Leeds"].Instances[instanceId]).mode);
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
