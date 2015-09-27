using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Services.Protocols;

namespace GDO.Apps.Maps.Core.Styles
{
    public class FillStyle : Core.Style
    {
        public string Color { get; set; }

        new public void Init(string color)
        {
            Color = color;
            AddtoEditables(() => Color);
        }
        new public void Modify(string color)
        {
            Color = color;
        }
    }
}