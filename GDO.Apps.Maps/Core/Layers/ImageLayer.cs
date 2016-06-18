using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Utility;

namespace GDO.Apps.Maps.Core.Layers
{
    public class ImageLayer : Layer
    {
        public LinkParameter Source { get; set; }

        public ImageLayer()
        {
            ClassName.Value = this.GetType().Name;
            ObjectType.Value = "ol.layer.Image";
            Description.Value = "Server-rendered images that are available for arbitrary extents and resolutions.";

            Source = new LinkParameter
            {
                Name = "Source",
                PropertyName = "source",
                Description = "The source for this layer",
                Priority = (int)GDO.Utility.Priorities.Required,
                IsEditable = false,
                IsVisible = true,
                LinkedParameter = "sources",
                ObjectTypes = new string[1] { "ol.source.ImageStatic" } ,
            };
        }
    }
}