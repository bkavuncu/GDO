using System;
using System.Collections.Generic;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using GDO.Apps.Maps.Core;
using GDO.Apps.Maps.Core.Layers;
using GDO.Core;
using GDO.Utility;

namespace GDO.Apps.Maps
{
    public class MapsApp : IAppInstance
    {
        public int Id { get; set; }
        public string AppName { get; set; }
        public Section Section { get; set; }
        public AppConfiguration Configuration { get; set; }
        public GenericDictionary<Layer> Layers { get; set; }
        public GenericDictionary<View> Views { get; set; }
        public GenericDictionary<Interaction> Interactions { get; set; }
        public GenericDictionary<Source> Sources { get; set; }
        public GenericDictionary<Control> Controls { get; set; }
        public GenericDictionary<Style> Styles { get; set; }
        public bool IsInitialized = false;
        public bool Mode { get; set; }

        public void init(int instanceId, string appName, Section section, AppConfiguration configuration)
        {

        }

        //Layer

        public int AddLayer<T> (string name, int type, int sourceId, float brightness, float contrast, float saturation, float hue, float opacity, int zIndex, bool visible, int minResolution, int maxResolution) where T : Layer, new()
        {

            try
            {
                int layerId = Layers.GetAvailableSlot();
                T layer = new T();
                layer.Init(layerId, name, type, Sources.GetValue<Source>(sourceId), brightness, contrast, saturation, hue, opacity, zIndex, visible, minResolution, maxResolution);
                Layers.Add<T>(layerId, layer);
                return layerId;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return -1;
            }
        }

        public int AddHeatmap(string name, int sourceId, float brightness, float contrast, float saturation, float hue,
            float opacity, int zIndex, bool visible, int minResolution, int maxResolution, string[] gradient, int radius, int shadow,
            int weight)
        {
            try
            {
                int layerId = AddLayer<Heatmap>(name, (int)LayerTypes.Heatmap, sourceId, brightness, contrast, saturation, hue, opacity, zIndex, visible, minResolution, maxResolution);
                if (layerId >= 0)
                {
                    Layers.GetValue<Heatmap>(layerId).Init(gradient, radius, shadow, weight);
                }
                return layerId;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return -1;
            }
        }

        public bool ModifyLayer(int id, string name, int index, int type, int sourceId, float brightness, float contrast, float saturation, float hue, float opacity, int zIndex, bool visible, int minResolution, int maxResolution)
        {
            try
            {
                //TODO
                return true;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return false;
            }
        }

        public string GetLayer(int layerId)
        {
            string serializedLayer = Newtonsoft.Json.JsonConvert.SerializeObject(Layers.GetValue<Layer>(layerId));
            return serializedLayer;
        }

        public bool RemoveLayer(int layerId)
        {
            try
            {
                Layers.Remove(layerId);
                return true;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return false;
            }
        }

        //View

        public int AddView(Position position, int minResolution, int maxResolution, int minZoom, int maxZoom, string projection, float rotation)
        {
            try
            {
                int viewId = Views.GetAvailableSlot();
                View view = new View(viewId,position,minResolution,maxResolution,minZoom,maxZoom,projection,rotation);
                Views.Add<View>(viewId, view);
                return viewId;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return -1;
            }
        }

        public bool ModifyView(int id, Position position, int minResolution, int maxResolution, int minZoom, int maxZoom, string projection, float rotation)
        {
            try
            {
                View view = Views.GetValue<View>(id);
                view = new View(id, position, minResolution, maxResolution, minZoom, maxZoom, projection, rotation);
                return true;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return false;
            }
        }

        public string GetView(int viewId)
        {
            string serializedView = Newtonsoft.Json.JsonConvert.SerializeObject(Views.GetValue<View>(viewId));
            return serializedView;
        }

        public bool RemoveView(int viewId)
        {
            try
            {
                Views.Remove(viewId);
                return true;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return false;
            }
        }

        //Interaction

        public int AddInteraction()
        {

            return -1;
        }

        public bool ModifyInteraction(int interactionId)
        {

            return false;
        }

        public string GetInteraction(int interactionId)
        {
            return "";
        }

        public bool RemoveInteraction(int interactionId)
        {

            return false;
        }

        //Source

        public int AddSource()
        {

            return -1;
        }

        public bool ModifySource(int sourceId)
        {

            return false;
        }

        public string GetSource(int sourceId)
        {
            return "";
        }

        public bool RemoveSource(int sourceId)
        {

            return false;
        }

        //Control

        public int AddControl()
        {

            return -1;
        }

        public bool ModifyControl(int controlId)
        {

            return false;
        }

        public string GetControl(int controlId)
        {
            return "";
        }

        public bool RemoveControl(int controlId)
        {

            return false;
        }

        //Style

        public int AddStyle()
        {

            return -1;
        }

        public bool ModifyStyle(int styleId)
        {

            return false;
        }

        public string GetStyle(int styleId)
        {
            return "";
        }

        public bool RemoveStyle(int styleId)
        {

            return false;
        }
    }
}