using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Utility;

namespace GDO.Apps.Maps.Core
{
    public class Map
    {
        public Dictionary<int,Layer> Layers { get; set; }
        public Dictionary<int,Interaction> Interactions { get; set; }
        public Dictionary<int,Control> Controls { get; set; }
        public View View { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }

        public Map(Layer[] layers, Interaction[] interactions, Control[] controls, View view, int width, int height)
        {
            foreach (Layer layer in layers)
            {
                Layers.Add(layer.Id,layer);
            }
            foreach (Interaction interaction in interactions)
            {
                Interactions.Add(interaction.Id,interaction);
            }
            foreach (Control control in controls)
            {
                Controls.Add(control.Id,control);
            }
            View = view;
            Width = width;
            Height = height;
        }
    }
}