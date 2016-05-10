using System;
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

        new public void Init(int styleId, int renderBuffer, bool updateWhileAnimating, bool updateWhileInteracting)
        {
            Prepare();
            StyleId.Value = styleId;
            RenderBuffer.Value = renderBuffer;
            UpdateWhileAnimating.Value = updateWhileAnimating;
            UpdateWhileInteracting.Value = updateWhileInteracting;
        }
        new public void Prepare()
        {
            base.Prepare();
            ClassName.Value = this.GetType().Name;

            StyleId = new LinkParameter
            {
                Name = "Style Id",
                Description = "Id of the Style for the Layer",
                Priority = (int)GDO.Utility.Priorities.High,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Datalist,
                IsEditable = true,
                IsVisible = true,
                LinkedParameter = "Style"
            };

            RenderBuffer = new NullableIntegerParameter()
            {
                Name = "Render Buffer",
                Description = "Size of the buffer around viewport to be rendered",
                Priority = (int)GDO.Utility.Priorities.Low,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Number,
                IsEditable = false,
                IsVisible = true,
            };

            UpdateWhileAnimating = new BooleanParameter
            {
                Name = "Update while Animating",
                Description = "Update while Animating",
                Priority = (int) GDO.Utility.Priorities.Low,
                VisualisationType = (int) GDO.Utility.VisualisationTypes.Boolean,
                IsEditable = false,
                IsVisible = true,
                Value = false
            };

            UpdateWhileInteracting = new BooleanParameter
            {
                Name = "Update while Interacting",
                Description = "Update while Interacting",
                Priority = (int)GDO.Utility.Priorities.Low,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Boolean,
                IsEditable = false,
                IsVisible = true,
                Value = false
            };

        }


        new public void Modify(int styleId)
        {
            StyleId.Value = styleId;
        }
    }
}