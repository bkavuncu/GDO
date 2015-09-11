using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Services.Protocols;

namespace GDO.Apps.SmartCity.Core.Styles
{
    public class FillStyle : Core.Style
    {
        public string Color { get; set; }

        new public void Init(string color)
        {
            Color = color;
            Prepare();
        }
        new public void Prepare()
        {
            AddtoEditables(() => Color);
            ClassName = this.GetType().Name;
        }

        new public void Modify(string color)
        {
            Color = color;
        }
    }
}