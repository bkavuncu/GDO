using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using GDO.Apps.Maps.Core;
using GDO.Apps.Maps.Core.Layers;
using GDO.Core;
using GDO.Utility;
using Image = GDO.Apps.Maps.Core.Sources.ImageSource;

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

        public int AddLayer<T> (string name, int type, int sourceId, float brightness, float contrast, float saturation, float hue,
            float opacity, int zIndex, bool visible, int minResolution, int maxResolution) where T : Layer, new()
        {

            try
            {
                int layerId = Layers.GetAvailableSlot();
                T layer = new T();
                layer.Modify(layerId, name, type, Sources.GetValue<Source>(sourceId), brightness, contrast, saturation, hue, opacity,
                    zIndex, visible, minResolution, maxResolution);
                Layers.Add<T>(layerId, layer);
                return layerId;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return -1;
            }
        }

        public bool ModifyLayer(int id, string name, int type, int sourceId, float brightness, float contrast, float saturation, float hue,
            float opacity, int zIndex, bool visible, int minResolution, int maxResolution)
        {
            try
            {
                Layers.GetValue<Core.Layer>(id).Modify(id, name, type, Sources.GetValue<Source>(sourceId), brightness, contrast, saturation,
                    hue, opacity, zIndex, visible, minResolution, maxResolution);
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
            Layer layer = Layers.GetValue<Layer>(layerId);
            if (layer != null)
            {
                string serializedLayer = Newtonsoft.Json.JsonConvert.SerializeObject(Layers.GetValue<Layer>(layerId));
                return serializedLayer;
            }
            else
            {
                return null;
            }
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

        public int AddSource<T>(string name, int type) where T : Source, new()
        {
            try
            {
                int sourceId = Sources.GetAvailableSlot();
                T source = new T();
                source.Modify(sourceId, name, type);
                Sources.Add<T>(sourceId, source);
                return sourceId;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return -1;
            }
        }

        public bool ModifySource(int id, string name, int type)
        {
            try
            {
                Sources.GetValue<Core.Source>(id).Modify(id, name, type);
                return true;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return false;
            }
        }

        public string GetSource(int sourceId)
        {
            Source source = Sources.GetValue<Source>(sourceId);
            if (source != null)
            {
                string serializedSource = Newtonsoft.Json.JsonConvert.SerializeObject(Sources.GetValue<Source>(sourceId));
                return serializedSource;
            }
            else
            {
                return null;
            }
        }

        public bool RemoveSource(int sourceId)
        {
            try
            {
                Sources.Remove(sourceId);
                return true;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return false;
            }
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