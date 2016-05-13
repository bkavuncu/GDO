using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Services.Protocols;
using GDO.Utility;

namespace GDO.Apps.Maps.Core.Styles
{
    public class FillStyle : Core.Style
    {
        public StringParameter Color { get; set; }

        new public void Init(string color)
        {
            Prepare();
            Color.Value = color;
        }
        new public void Prepare()
        {
            base.Prepare();
            ClassName.Value = this.GetType().Name;

            Color = new StringParameter
            {
                Name = "Color",
                Description = "Color",
                Priority = (int)GDO.Utility.Priorities.Normal,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Color,
                IsEditable = true,
                IsVisible = true
            };
        }

        new public void Modify(string color)
        {
            Color.Value = color;
        }
    }
}