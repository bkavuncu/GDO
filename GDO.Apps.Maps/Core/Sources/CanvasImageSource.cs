using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Utility;

namespace GDO.Apps.Maps.Core.Sources
{
    public class CanvasImageSource : Source
    {
        public FloatRangeParameter Ratio { get; set; }
        public StringParameter CanvasFunction { get; set; }

        public CanvasImageSource()
        {
            ClassName.Value = this.GetType().Name;

            Ratio = new FloatRangeParameter
            {
                Name = "Ratio",
                Description = "Ratio. 1 means canvases are the size of the map viewport, 2 means twice the width and height of the map viewport, and so on. Must be 1 or higher.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Float,
                IsEditable = false,
                IsVisible = true,
                DefaultValue = (float)1.5,
                MinValue = (float)0,
                MaxValue = (float)5,
            };
            CanvasFunction = new StringParameter
            {
                Name = "Canvas Function",
                Description = "Canvas function. The function returning the canvas element used by the source as an image. The arguments passed to the function are: {ol.Extent} the image extent, {number} the image resolution, {number} the device pixel ratio, {ol.Size} the image size, and {ol.proj.Projection} the image projection. The canvas returned by this function is cached by the source. If the value returned by the function is later changed then dispatchChangeEvent should be called on the source for the source to invalidate the current cached image.",
                Priority = (int)GDO.Utility.Priorities.Required,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.TextArea,
                IsEditable = false,
                IsVisible = true,
            };
        }
    }
}