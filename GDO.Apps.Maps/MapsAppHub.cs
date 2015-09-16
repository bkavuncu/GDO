using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.Linq;
using System.Net;
using System.Web;
using GDO.Apps.Maps.Core;
using GDO.Core;
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

        public void Set3DMode(int instanceId, bool mode)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]).Mode = mode;
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
                    Clients.Caller.receive3DMode(instanceId, ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]).Mode);
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

        public void RequestMap(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {

                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void ModifyMap(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {

                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        //Layer

        public void AddLayer(int instanceId, string name, int type, int sourceId, float brightness, float contrast, float saturation, float hue, float opacity, int zIndex, bool visible, int minResolution, int maxResolution, string[] gradient, int radius, int shadow,
            int weight, int preload, int styleId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                int layerId = -1;
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    switch (type)
                    {
                        case (int)LayerTypes.Base:
                            layerId = maps.AddLayer<Core.Layer>(name, (int)LayerTypes.Base, sourceId, brightness, contrast, saturation, hue, opacity, zIndex, visible, minResolution, maxResolution);
                            break;
                        case (int)LayerTypes.Heatmap:
                            layerId = maps.AddLayer<Core.Layers.Heatmap>(name, (int)LayerTypes.Heatmap, sourceId, brightness, contrast, saturation, hue, opacity, zIndex, visible, minResolution, maxResolution); 
                            if (layerId >= 0)
                            {
                                maps.Layers.GetValue<Core.Layers.Heatmap>(layerId).Modify(gradient, radius, shadow, weight);
                            }
                            break;
                        case (int)LayerTypes.Image:
                            layerId = maps.AddLayer<Core.Layers.Image>(name, (int)LayerTypes.Image, sourceId, brightness, contrast, saturation, hue, opacity, zIndex, visible, minResolution, maxResolution);
                            if (layerId >= 0)
                            {
                                maps.Layers.GetValue<Core.Layers.Image>(layerId).Modify();
                            }
                            break;
                        case (int)LayerTypes.Vector:
                            layerId = maps.AddLayer<Core.Layers.Vector>(name, (int)LayerTypes.Vector, sourceId, brightness, contrast, saturation, hue, opacity, zIndex, visible, minResolution, maxResolution);
                            if (layerId >= 0)
                            {
                                maps.Layers.GetValue<Core.Layers.Vector>(layerId).Modify(maps.Styles.GetValue<Style>(styleId));
                            }
                            break;
                        case (int)LayerTypes.Tile:
                            layerId = maps.AddLayer<Core.Layers.Tile>(name, (int)LayerTypes.Tile, sourceId, brightness, contrast, saturation, hue, opacity, zIndex, visible, minResolution, maxResolution);
                            if (layerId >= 0)
                            {
                                maps.Layers.GetValue<Core.Layers.Tile>(layerId).Modify(preload);
                            }
                            break;
                        case (int)LayerTypes.None:
                            break;
                        default:
                            break;
                    }
                    if (layerId >= 0)
                    {
                        BroadcastLayer(instanceId, layerId);
                    }  
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void ModifyLayer(int instanceId, int layerId, string name, int type, int sourceId, float brightness, float contrast, float saturation, float hue, float opacity, int zIndex, bool visible, int minResolution, int maxResolution, string[] gradient, int radius, int shadow,
            int weight, int preload, int styleId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]);
                    maps.ModifyLayer(layerId, name, type, sourceId, brightness, contrast, saturation, hue, opacity,
                        zIndex, visible, minResolution, maxResolution);
                    switch (type)
                    {
                        case (int) LayerTypes.Base:
                            break;
                        case (int) LayerTypes.Heatmap:
                            maps.Layers.GetValue<Core.Layers.Heatmap>(layerId).Modify(gradient, radius, shadow, weight);
                            break;
                        case (int) LayerTypes.Image:
                            maps.Layers.GetValue<Core.Layers.Image>(layerId).Modify();
                            break;
                        case (int) LayerTypes.Vector:
                            maps.Layers.GetValue<Core.Layers.Vector>(layerId).Modify(maps.Styles.GetValue<Style>(styleId));
                            break;
                        case (int) LayerTypes.Tile:
                            maps.Layers.GetValue<Core.Layers.Tile>(layerId).Modify(preload);
                            break;
                        case (int) LayerTypes.None:
                            break;
                        default:
                            break;
                    }
                    BroadcastLayer(instanceId,layerId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void RequestLayer(int instanceId, int layerId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    string serializedLayer = maps.GetLayer(layerId);
                    if (serializedLayer != null)
                    {
                        Clients.Caller.receiveLayer(instanceId, layerId, serializedLayer, true);
                    }
                    else
                    {
                        Clients.Caller.receiveLayer(instanceId, layerId, "", false);
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void BroadcastLayer(int instanceId, int layerId)
        {
            try
            {
                MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                string serializedLayer = maps.GetLayer(layerId);
                if (serializedLayer != null)
                {
                    Clients.All.receiveLayer(instanceId, layerId, serializedLayer, true);
                }
                else
                {
                    Clients.All.receiveLayer(instanceId, layerId, "", false);
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        public void RemoveLayer(int instanceId, int layerId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    maps.RemoveLayer(layerId);
                    BroadcastLayer(instanceId, layerId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        //View

        public void AddView(int instanceId, double[] topLeft, double[] center, double[] bottomRight, float resolution, int zoom, int minResolution, int maxResolution, int minZoom, int maxZoom, string projection, float rotation)
        {
            lock (Cave.AppLocks[instanceId])
            {
                int viewId = -1;
                try
                {
                    Position position = new Position(topLeft,center,bottomRight,resolution,zoom);
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    viewId = maps.AddView(position, minResolution, maxResolution, minZoom, maxZoom, projection, rotation);
                    if (viewId >= 0)
                    {
                        BroadcastView(instanceId, viewId);
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void ModifyView(int instanceId, int viewId, double[] topLeft, double[] center, double[] bottomRight, float resolution, int zoom, int minResolution, int maxResolution, int minZoom, int maxZoom, string projection, float rotation)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    View view = maps.Views.GetValue<View>(viewId);
                    Position position = new Position(topLeft, center, bottomRight, resolution, zoom);
                    bool result = maps.ModifyView(viewId, position, minResolution, maxResolution, minZoom, maxZoom, projection, rotation);
                    if (result)
                    {
                        BroadcastView(instanceId, viewId);
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void RequestView(int instanceId, int viewId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    string serializedView = maps.GetView(viewId);
                    if (serializedView != null)
                    {
                        Clients.Caller.receiveview(instanceId, viewId, serializedView, true);
                    }
                    else
                    {
                        Clients.Caller.receiveview(instanceId, viewId, "", false);
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void BroadcastView(int instanceId, int viewId)
        {
            MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
            string serializedView = maps.GetView(viewId);
            if (serializedView != null)
            {
                Clients.All.receiveView(instanceId, viewId, serializedView, true);
            }
            else
            {
                Clients.All.receiveLayer(instanceId, viewId, "", false);
            }
        }

        public void RemoveView(int instanceId, int viewId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    maps.RemoveView(viewId);
                    BroadcastView(instanceId, viewId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        //Interaction

        public void AddInteraction(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {

                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void ModifyInteraction(int instanceId, int interactionId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {

                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void RequestInteraction(int instanceId, int interactionId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {

                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void RemoveInteraction(int instanceId, int interactionId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {

                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        //Source

        public void AddSource(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {

                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void ModifySource(int instanceId, int sourceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {

                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void RequestSource(int instanceId, int sourceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {

                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void BroadcastSource(int instanceId, int sourceId)
        {

        }

        public void RemoveSource(int instanceId, int sourceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {

                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        //Control

        public void AddControl(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {

                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void ModifyControl(int instanceId, int controlId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {

                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void RequestControl(int instanceId, int controlId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {

                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void RemoveControl(int instanceId, int controlId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {

                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        //Style

        public void AddStyle(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {

                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void ModifyStyle(int instanceId, int styleId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {

                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void RequestStyle(int instanceId, int styleId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {

                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void BroadcastStyle(int instanceId, int styleId)
        {

        }

        public void RemoveStyle(int instanceId, int styleId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {

                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }
    }
}