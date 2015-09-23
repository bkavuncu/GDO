using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core.Layers
{
    public class VectorLayer : Layer
    {
        public Style Style { get; set; }
        public int RenderBuffer { get; set; }
        public bool UpdateWhileAnimating { get; set; }
        public bool UpdateWhileInteracting { get; set; }

        new public void Modify(Style style, int renderBuffer, bool updateWhileAnimating, bool updateWhileInteracting)
        {
            Style = style;
            RenderBuffer = renderBuffer;
            UpdateWhileAnimating = updateWhileAnimating;
            UpdateWhileInteracting = updateWhileInteracting;
        }
    }
}