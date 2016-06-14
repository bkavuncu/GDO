﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Utility;

namespace GDO.Apps.Maps.Core.Layers
{
    public class VectorLayer : Layer
    {
        public LinkParameter Source { get; set; }
        public LinkParameter Style { get; set; }
        public NullableIntegerParameter RenderBuffer { get; set; }
        public BooleanParameter UpdateWhileAnimating { get; set; }
        public BooleanParameter UpdateWhileInteracting { get; set; }

        public VectorLayer()
        {
            ClassName.Value = this.GetType().Name;
            ObjectType.Value = "ol.layer.Vector";

            Source = new LinkParameter
            {
                Name = "Source",
                PropertyName = "source",
                Description = "The source for this layer",
                Priority = (int)GDO.Utility.Priorities.Required,
                IsEditable = false,
                IsVisible = true,
                LinkedParameter = "sources",
                ObjectType = "ol.source.Vector",
            };

            Style = new LinkParameter
            {
                Name = "Style",
                PropertyName = "style",
                Description = "Layer style",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = true,
                LinkedParameter = "styles",
                ObjectType = "ol.style.Style"
            };

            RenderBuffer = new NullableIntegerParameter
            {
                Name = "Render Buffer",
                PropertyName = "renderBuffer",
                Description = "The buffer around the viewport extent used by the renderer when getting features from the vector source for the rendering or hit-detection. Recommended value: the size of the largest symbol, line width or label. Default is 100 pixels.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true,
                Increment = 1,
            };

            UpdateWhileAnimating = new BooleanParameter
            {
                Name = "Update while Animating",
                PropertyName = "updateWhileAnimating",
                Description = "When set to true, feature batches will be recreated during animations. This means that no vectors will be shown clipped, but the setting will have a performance impact for large amounts of vector data. When set to false, batches will be recreated when no animation is active.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true,
                DefaultValue = false
            };

            UpdateWhileInteracting = new BooleanParameter
            {
                Name = "Update while Interacting",
                PropertyName = "updateWhileInteracting",
                Description = "When set to true, feature batches will be recreated during interactions.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true,
                DefaultValue = false
            };
        }
    }
}