using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using GDO.Core;
using GDO.Core.Apps;

using GDO.Utility;
using Microsoft.AspNet.SignalR;

namespace GDO.Apps.Telefonica
{
    [Export(typeof(IAppHub))]
    public class TelefonicaAppHub : Hub, IBaseAppHub
    {
        public string Name { get; set; } = "Telefonica";
        public int P2PMode { get; set; } = (int)Cave.P2PModes.None;
        public Type InstanceType { get; set; } = new TelefonicaApp().GetType();
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
                    ((TelefonicaApp)Cave.Apps["Telefonica"].Instances[instanceId]).SetMapPosition(topLeft, center, bottomRight, resolution, width, height, zoom);
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
            int instanceId = Utilities.GetFirstKey(Cave.Apps["Telefonica"].Instances);
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.receiveTimeStep(instanceId, (((TelefonicaApp)Cave.Apps["Telefonica"].Instances[instanceId]).TimeStep));
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
                    ((TelefonicaApp) Cave.Apps["Telefonica"].Instances[instanceId]).Blur = blur;
                    ((TelefonicaApp)Cave.Apps["Telefonica"].Instances[instanceId]).Radius = radius;
                    ((TelefonicaApp)Cave.Apps["Telefonica"].Instances[instanceId]).Opacity = opacity;
                    ((TelefonicaApp)Cave.Apps["Telefonica"].Instances[instanceId]).StationWidth = station;
                    ((TelefonicaApp)Cave.Apps["Telefonica"].Instances[instanceId]).Dataserie = dataseries;
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
                    int blur = ((TelefonicaApp)Cave.Apps["Telefonica"].Instances[instanceId]).Blur;
                    int radius = ((TelefonicaApp)Cave.Apps["Telefonica"].Instances[instanceId]).Radius;
                    float opacity = ((TelefonicaApp)Cave.Apps["Telefonica"].Instances[instanceId]).Opacity;
                    int station = ((TelefonicaApp)Cave.Apps["Telefonica"].Instances[instanceId]).StationWidth;
                    string dataseries = ((TelefonicaApp)Cave.Apps["Telefonica"].Instances[instanceId]).Dataserie;
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
            int instanceId = Utilities.GetFirstKey(Cave.Apps["Telefonica"].Instances);
            try
            {
                if (((TelefonicaApp) Cave.Apps["Telefonica"].Instances[instanceId]).IsAnimating == false)
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
            int instanceId = Utilities.GetFirstKey(Cave.Apps["Telefonica"].Instances);
            try
            {
                if (((TelefonicaApp) Cave.Apps["Telefonica"].Instances[instanceId]).IsAnimating == false)
                {
                    ((TelefonicaApp) Cave.Apps["Telefonica"].Instances[instanceId]).IsAnimating = true;
                    while (((TelefonicaApp) Cave.Apps["Telefonica"].Instances[instanceId]).IsAnimating)
                    {
                        System.Threading.Thread.Sleep(
                            ((TelefonicaApp) Cave.Apps["Telefonica"].Instances[instanceId]).WaitTime);
                        if (((TelefonicaApp) Cave.Apps["Telefonica"].Instances[instanceId]).TimeStep >= 285)
                        {
                            ((TelefonicaApp) Cave.Apps["Telefonica"].Instances[instanceId]).TimeStep = 0;
                        }
                        foreach (KeyValuePair<int, IAppInstance> instanceKeyValuePair in Cave.Instances)
                        {
                            if (instanceKeyValuePair.Value.AppName == "Telefonica")
                            {
                                Clients.Group("" + instanceKeyValuePair.Value.Id).receiveTimeStep(
                                    ((TelefonicaApp)Cave.Apps["Telefonica"].Instances[instanceId]).TimeStep);
                            }
                        }
                        ((TelefonicaApp)Cave.Apps["Telefonica"].Instances[instanceId]).TimeStep++;
                    }
                }
                else
                {
                    ((TelefonicaApp) Cave.Apps["Telefonica"].Instances[instanceId]).IsAnimating = false;
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
                    ((TelefonicaApp)Cave.Apps["Telefonica"].Instances[instanceId]).BingLayer =
                        !((TelefonicaApp)Cave.Apps["Telefonica"].Instances[instanceId]).BingLayer;
                    
                    Clients.Group("" + instanceId).setBingLayerVisible(instanceId, ((TelefonicaApp)Cave.Apps["Telefonica"].Instances[instanceId]).BingLayer);
                    Clients.Caller.setBingLayerVisible(instanceId, ((TelefonicaApp)Cave.Apps["Telefonica"].Instances[instanceId]).BingLayer);
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
                    ((TelefonicaApp) Cave.Apps["Telefonica"].Instances[instanceId]).CartoDBLayer =
                        !((TelefonicaApp) Cave.Apps["Telefonica"].Instances[instanceId]).CartoDBLayer;

                    Clients.Group("" + instanceId).setCartoDBLayerVisible(instanceId, ((TelefonicaApp)Cave.Apps["Telefonica"].Instances[instanceId]).CartoDBLayer);
                    Clients.Caller.setCartoDBLayerVisible(instanceId, ((TelefonicaApp)Cave.Apps["Telefonica"].Instances[instanceId]).CartoDBLayer);
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
                    ((TelefonicaApp) Cave.Apps["Telefonica"].Instances[instanceId]).OpenCycleLayer =
                        !((TelefonicaApp) Cave.Apps["Telefonica"].Instances[instanceId]).OpenCycleLayer;

                    Clients.Group("" + instanceId).setOpenCycleLayerVisible(instanceId, ((TelefonicaApp)Cave.Apps["Telefonica"].Instances[instanceId]).OpenCycleLayer);
                    Clients.Caller.setOpenCycleLayerVisible(instanceId, ((TelefonicaApp)Cave.Apps["Telefonica"].Instances[instanceId]).OpenCycleLayer);
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
                    ((TelefonicaApp) Cave.Apps["Telefonica"].Instances[instanceId]).StationLayer =
                        !((TelefonicaApp) Cave.Apps["Telefonica"].Instances[instanceId]).StationLayer;

                    Clients.Group("" + instanceId).setStationLayerVisible(instanceId, ((TelefonicaApp)Cave.Apps["Telefonica"].Instances[instanceId]).StationLayer);
                    Clients.Caller.setStationLayerVisible(instanceId, ((TelefonicaApp)Cave.Apps["Telefonica"].Instances[instanceId]).StationLayer);
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
                    ((TelefonicaApp)Cave.Apps["Telefonica"].Instances[instanceId]).HeatmapLayer = 
                        !((TelefonicaApp)Cave.Apps["Telefonica"].Instances[instanceId]).HeatmapLayer;

                    Clients.Group("" + instanceId).setHeatmapLayerVisible(instanceId, ((TelefonicaApp)Cave.Apps["Telefonica"].Instances[instanceId]).HeatmapLayer);
                    Clients.Caller.setHeatmapLayerVisible(instanceId, ((TelefonicaApp)Cave.Apps["Telefonica"].Instances[instanceId]).HeatmapLayer);
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
                    switch (((TelefonicaApp)Cave.Apps["Telefonica"].Instances[instanceId]).Dataserie)
                    {
                        case "entries":
                            ((TelefonicaApp)Cave.Apps["Telefonica"].Instances[instanceId]).Dataserie = "entries";
                            break;
                        case "exits":
                            ((TelefonicaApp)Cave.Apps["Telefonica"].Instances[instanceId]).Dataserie = "exits";
                            break;
                        case "emptiness":
                            ((TelefonicaApp)Cave.Apps["Telefonica"].Instances[instanceId]).Dataserie = "emptiness";
                            break;
                    }*/
                    /*
                    if (((TelefonicaApp)Cave.Apps["Telefonica"].Instances[instanceId]).Dataserie)
                    {
                        ((TelefonicaApp)Cave.Apps["Telefonica"].Instances[instanceId]).Dataserie = false;
                    }
                    else
                    {
                        ((TelefonicaApp)Cave.Apps["Telefonica"].Instances[instanceId]).Dataserie = true;
                    }*/
 /*                   Clients.Group("" + instanceId).setEntry(instanceId, ((TelefonicaApp)Cave.Apps["Telefonica"].Instances[instanceId]).Dataserie);
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
                    Clients.Caller.setBingLayerVisible(instanceId, ((TelefonicaApp)Cave.Apps["Telefonica"].Instances[instanceId]).BingLayer);
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
                    Clients.Caller.setCartoDBLayerVisible(instanceId, ((TelefonicaApp)Cave.Apps["Telefonica"].Instances[instanceId]).CartoDBLayer);
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
                    Clients.Caller.setOpenCycleLayerVisible(instanceId, ((TelefonicaApp)Cave.Apps["Telefonica"].Instances[instanceId]).OpenCycleLayer);
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
                    Clients.Caller.setStationLayerVisible(instanceId, ((TelefonicaApp)Cave.Apps["Telefonica"].Instances[instanceId]).StationLayer);
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
                    Clients.Caller.setHeatmapLayerVisible(instanceId, ((TelefonicaApp)Cave.Apps["Telefonica"].Instances[instanceId]).HeatmapLayer);
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
                    ((TelefonicaApp)Cave.Apps["Telefonica"].Instances[instanceId]).Style = style;
                    Clients.Caller.receiveTelefonicatyle(instanceId, style);
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
                    MapPosition position = ((TelefonicaApp)Cave.Apps["Telefonica"].Instances[instanceId]).GetMapPosition();
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
                    string style = ((TelefonicaApp) Cave.Apps["Telefonica"].Instances[instanceId]).Style;
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
            Clients.Group("" + instanceId).receiveTelefonicatyle(instanceId, style);
        }

        public void Set3DMode(int instanceId, bool mode)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    ((TelefonicaApp)Cave.Apps["Telefonica"].Instances[instanceId]).mode = mode;
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
                    Clients.Caller.receive3DMode(instanceId, ((TelefonicaApp)Cave.Apps["Telefonica"].Instances[instanceId]).mode);
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
