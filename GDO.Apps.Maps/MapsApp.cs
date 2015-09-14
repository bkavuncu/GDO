using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using GDO.Apps.Maps.Core;
using GDO.Core;

namespace GDO.Apps.Maps
{
    public class MapsApp : IAppInstance
    {
        public int Id { get; set; }
        public string AppName { get; set; }
        public Section Section { get; set; }
        public AppConfiguration Configuration { get; set; }
        public Dictionary<int, Layer> Layers { get; set; }
        public Dictionary<int, View> Views { get; set; }
        public Dictionary<int, Interaction> Interactions { get; set; }
        public Dictionary<int, Source> Sources { get; set; }
        public Dictionary<int, Control> Controls { get; set; }
        public Dictionary<int, Style> Styles { get; set; }
        public bool IsInitialized = false;
        public bool Mode { get; set; }

        public void init(int instanceId, string appName, Section section, AppConfiguration configuration)
        {

        }

        //Layer

        public int AddLayer()
        {

            return -1;
        }

        public bool ModifyLayer(int layerId)
        {

            return false;
        }

        public string GetLayer(int layerId)
        {
            return "";
        }

        public bool RemoveLayer(int layerId)
        {

            return false;
        }

        //View

        public int AddView()
        {

            return -1;
        }

        public bool ModifyView(int viewId)
        {

            return false;
        }

        public string GetView(int viewId)
        {
            return "";
        }

        public bool RemoveView(int viewId)
        {

            return false;
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