using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core.Layers
{
    public class VectorLayer : Layer
    {
        public int StyleId { get; set; }
        public int? RenderBuffer { get; set; }
        public bool? UpdateWhileAnimating { get; set; }
        public bool? UpdateWhileInteracting { get; set; }

        new public void Init(int styleId, int renderBuffer, bool updateWhileAnimating, bool updateWhileInteracting)
        {
            StyleId = styleId;
            RenderBuffer = renderBuffer;
            UpdateWhileAnimating = updateWhileAnimating;
            UpdateWhileInteracting = updateWhileInteracting;

            Prepare();
        }
        new public void Prepare()
        {
            base.Prepare();
            ClassName = this.GetType().Name;
            AddtoEditables(() => StyleId);
        }


        new public void Modify(int styleId)
        {
            StyleId = styleId;
        }
    }
}