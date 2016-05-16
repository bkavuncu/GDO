﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Utility;

namespace GDO.Apps.Maps.Core.Layers
{
    public class VectorLayer : Layer
    {
        public LinkParameter StyleId { get; set; }
        public NullableIntegerParameter RenderBuffer { get; set; }
        public BooleanParameter UpdateWhileAnimating { get; set; }
        public BooleanParameter UpdateWhileInteracting { get; set; }

        public VectorLayer(int id, string name, int type, int sourceId) : base(id, name, type, sourceId)
        {
            ClassName.Value = this.GetType().Name;

            StyleId = new LinkParameter
            {
                Name = "Style Id",
                Description = "Id of the Style for the Layer",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Datalist,
                IsEditable = true,
                IsVisible = true,
                LinkedParameter = "Style"
            };

            RenderBuffer = new NullableIntegerParameter()
            {
                Name = "Render Buffer",
                Description = "The buffer around the viewport extent used by the renderer when getting features from the vector source for the rendering or hit-detection. Recommended value: the size of the largest symbol, line width or label. Default is 100 pixels.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Number,
                IsEditable = false,
                IsVisible = true,
            };

            UpdateWhileAnimating = new BooleanParameter
            {
                Name = "Update while Animating",
                Description = "When set to true, feature batches will be recreated during animations. This means that no vectors will be shown clipped, but the setting will have a performance impact for large amounts of vector data. When set to false, batches will be recreated when no animation is active.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Boolean,
                IsEditable = false,
                IsVisible = true,
                Default = false
            };

            UpdateWhileInteracting = new BooleanParameter
            {
                Name = "Update while Interacting",
                Description = "When set to true, feature batches will be recreated during interactions.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Boolean,
                IsEditable = false,
                IsVisible = true,
                Default = false
            };
        }
    }
}