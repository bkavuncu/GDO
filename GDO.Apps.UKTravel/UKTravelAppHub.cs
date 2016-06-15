using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using GDO.Core;
using GDO.Core.Apps;

using GDO.Utility;
using Microsoft.AspNet.SignalR;

namespace GDO.Apps.UKTravel
{
    [Export(typeof(IAppHub))]
    public class UKTravelAppHub : Hub, IBaseAppHub
    {
        public string Name { get; set; } = "UKTravel";
        public int P2PMode { get; set; } = (int)Cave.P2PModes.None;
        public Type InstanceType { get; set; } = new UKTravelApp().GetType();
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
                    ((UKTravelApp)Cave.Apps["UKTravel"].Instances[instanceId]).SetMapPosition(topLeft, center, bottomRight, resolution, width, height, zoom);
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
            int instanceId = Utilities.GetFirstKey(Cave.Apps["UKTravel"].Instances);
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.receiveTimeStep(instanceId, (((UKTravelApp)Cave.Apps["UKTravel"].Instances[instanceId]).TimeStep));
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
                    ((UKTravelApp) Cave.Apps["UKTravel"].Instances[instanceId]).Blur = blur;
                    ((UKTravelApp)Cave.Apps["UKTravel"].Instances[instanceId]).Radius = radius;
                    ((UKTravelApp)Cave.Apps["UKTravel"].Instances[instanceId]).Opacity = opacity;
                    ((UKTravelApp)Cave.Apps["UKTravel"].Instances[instanceId]).StationWidth = station;
                    ((UKTravelApp)Cave.Apps["UKTravel"].Instances[instanceId]).Dataserie = dataseries;
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
                    int blur = ((UKTravelApp)Cave.Apps["UKTravel"].Instances[instanceId]).Blur;
                    int radius = ((UKTravelApp)Cave.Apps["UKTravel"].Instances[instanceId]).Radius;
                    float opacity = ((UKTravelApp)Cave.Apps["UKTravel"].Instances[instanceId]).Opacity;
                    int station = ((UKTravelApp)Cave.Apps["UKTravel"].Instances[instanceId]).StationWidth;
                    string dataseries = ((UKTravelApp)Cave.Apps["UKTravel"].Instances[instanceId]).Dataserie;
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
            int instanceId = Utilities.GetFirstKey(Cave.Apps["UKTravel"].Instances);
            try
            {
                if (((UKTravelApp) Cave.Apps["UKTravel"].Instances[instanceId]).IsAnimating == false)
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
            int MAX_TIMESTEP = 17;
            int instanceId = Utilities.GetFirstKey(Cave.Apps["UKTravel"].Instances);
            try
            {
                if (((UKTravelApp) Cave.Apps["UKTravel"].Instances[instanceId]).IsAnimating == false)
                {
                    ((UKTravelApp) Cave.Apps["UKTravel"].Instances[instanceId]).IsAnimating = true;
                    while (((UKTravelApp) Cave.Apps["UKTravel"].Instances[instanceId]).IsAnimating)
                    {
                        System.Threading.Thread.Sleep(
                            ((UKTravelApp) Cave.Apps["UKTravel"].Instances[instanceId]).WaitTime);
                        if (((UKTravelApp) Cave.Apps["UKTravel"].Instances[instanceId]).TimeStep >= MAX_TIMESTEP)
                        {
                            ((UKTravelApp) Cave.Apps["UKTravel"].Instances[instanceId]).TimeStep = 0;
                        }
                        foreach (KeyValuePair<int, IAppInstance> instanceKeyValuePair in Cave.Instances)
                        {
                            if (instanceKeyValuePair.Value.AppName == "UKTravel")
                            {
                                Clients.Group("" + instanceKeyValuePair.Value.Id).receiveTimeStep(
                                    ((UKTravelApp)Cave.Apps["UKTravel"].Instances[instanceId]).TimeStep);
                            }
                        }
                        ((UKTravelApp)Cave.Apps["UKTravel"].Instances[instanceId]).TimeStep++;
                    }
                }
                else
                {
                    ((UKTravelApp) Cave.Apps["UKTravel"].Instances[instanceId]).IsAnimating = false;
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
                    ((UKTravelApp)Cave.Apps["UKTravel"].Instances[instanceId]).BingLayer =
                        !((UKTravelApp)Cave.Apps["UKTravel"].Instances[instanceId]).BingLayer;
                    
                    Clients.Group("" + instanceId).setBingLayerVisible(instanceId, ((UKTravelApp)Cave.Apps["UKTravel"].Instances[instanceId]).BingLayer);
                    Clients.Caller.setBingLayerVisible(instanceId, ((UKTravelApp)Cave.Apps["UKTravel"].Instances[instanceId]).BingLayer);
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
                    ((UKTravelApp) Cave.Apps["UKTravel"].Instances[instanceId]).CartoDBLayer =
                        !((UKTravelApp) Cave.Apps["UKTravel"].Instances[instanceId]).CartoDBLayer;

                    Clients.Group("" + instanceId).setCartoDBLayerVisible(instanceId, ((UKTravelApp)Cave.Apps["UKTravel"].Instances[instanceId]).CartoDBLayer);
                    Clients.Caller.setCartoDBLayerVisible(instanceId, ((UKTravelApp)Cave.Apps["UKTravel"].Instances[instanceId]).CartoDBLayer);
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
                    ((UKTravelApp) Cave.Apps["UKTravel"].Instances[instanceId]).OpenCycleLayer =
                        !((UKTravelApp) Cave.Apps["UKTravel"].Instances[instanceId]).OpenCycleLayer;

                    Clients.Group("" + instanceId).setOpenCycleLayerVisible(instanceId, ((UKTravelApp)Cave.Apps["UKTravel"].Instances[instanceId]).OpenCycleLayer);
                    Clients.Caller.setOpenCycleLayerVisible(instanceId, ((UKTravelApp)Cave.Apps["UKTravel"].Instances[instanceId]).OpenCycleLayer);
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
                    ((UKTravelApp) Cave.Apps["UKTravel"].Instances[instanceId]).StationLayer =
                        !((UKTravelApp) Cave.Apps["UKTravel"].Instances[instanceId]).StationLayer;

                    Clients.Group("" + instanceId).setStationLayerVisible(instanceId, ((UKTravelApp)Cave.Apps["UKTravel"].Instances[instanceId]).StationLayer);
                    Clients.Caller.setStationLayerVisible(instanceId, ((UKTravelApp)Cave.Apps["UKTravel"].Instances[instanceId]).StationLayer);
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
                    ((UKTravelApp)Cave.Apps["UKTravel"].Instances[instanceId]).HeatmapLayer = 
                        !((UKTravelApp)Cave.Apps["UKTravel"].Instances[instanceId]).HeatmapLayer;

                    Clients.Group("" + instanceId).setHeatmapLayerVisible(instanceId, ((UKTravelApp)Cave.Apps["UKTravel"].Instances[instanceId]).HeatmapLayer);
                    Clients.Caller.setHeatmapLayerVisible(instanceId, ((UKTravelApp)Cave.Apps["UKTravel"].Instances[instanceId]).HeatmapLayer);
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
                    switch (((UKTravelApp)Cave.Apps["UKTravel"].Instances[instanceId]).Dataserie)
                    {
                        case "entries":
                            ((UKTravelApp)Cave.Apps["UKTravel"].Instances[instanceId]).Dataserie = "entries";
                            break;
                        case "exits":
                            ((UKTravelApp)Cave.Apps["UKTravel"].Instances[instanceId]).Dataserie = "exits";
                            break;
                        case "emptiness":
                            ((UKTravelApp)Cave.Apps["UKTravel"].Instances[instanceId]).Dataserie = "emptiness";
                            break;
                    }*/
                    /*
                    if (((UKTravelApp)Cave.Apps["UKTravel"].Instances[instanceId]).Dataserie)
                    {
                        ((UKTravelApp)Cave.Apps["UKTravel"].Instances[instanceId]).Dataserie = false;
                    }
                    else
                    {
                        ((UKTravelApp)Cave.Apps["UKTravel"].Instances[instanceId]).Dataserie = true;
                    }*/
 /*                   Clients.Group("" + instanceId).setEntry(instanceId, ((UKTravelApp)Cave.Apps["UKTravel"].Instances[instanceId]).Dataserie);
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
                    Clients.Caller.setBingLayerVisible(instanceId, ((UKTravelApp)Cave.Apps["UKTravel"].Instances[instanceId]).BingLayer);
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
                    Clients.Caller.setCartoDBLayerVisible(instanceId, ((UKTravelApp)Cave.Apps["UKTravel"].Instances[instanceId]).CartoDBLayer);
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
                    Clients.Caller.setOpenCycleLayerVisible(instanceId, ((UKTravelApp)Cave.Apps["UKTravel"].Instances[instanceId]).OpenCycleLayer);
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
                    Clients.Caller.setStationLayerVisible(instanceId, ((UKTravelApp)Cave.Apps["UKTravel"].Instances[instanceId]).StationLayer);
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
                    Clients.Caller.setHeatmapLayerVisible(instanceId, ((UKTravelApp)Cave.Apps["UKTravel"].Instances[instanceId]).HeatmapLayer);
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
                    ((UKTravelApp)Cave.Apps["UKTravel"].Instances[instanceId]).Style = style;
                    Clients.Caller.receiveUKTravelStyle(instanceId, style);
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
                    MapPosition position = ((UKTravelApp)Cave.Apps["UKTravel"].Instances[instanceId]).GetMapPosition();
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
                    string style = ((UKTravelApp) Cave.Apps["UKTravel"].Instances[instanceId]).Style;
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
            Clients.Group("" + instanceId).receiveUKTravelStyle(instanceId, style);
        }

        public void Set3DMode(int instanceId, bool mode)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    ((UKTravelApp)Cave.Apps["UKTravel"].Instances[instanceId]).mode = mode;
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
                    Clients.Caller.receive3DMode(instanceId, ((UKTravelApp)Cave.Apps["UKTravel"].Instances[instanceId]).mode);
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
