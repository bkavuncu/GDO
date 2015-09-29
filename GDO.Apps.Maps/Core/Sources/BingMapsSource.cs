using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core.Sources
{
    public class BingMapsSource : Source
    {
        public string Culture { get; set; }
        public string Key { get; set; }
        public string ImagerySet { get; set; }
        public int? MaxZoom { get; set; }
        new public void Init(string culture, string key, string imagerySet, int maxZoom)
        {
            Culture = culture;
            Key = key;
            ImagerySet = imagerySet;
            MaxZoom = maxZoom;

            Prepare();
        }
        new public void Prepare()
        {
            ClassName = this.GetType().Name;
        }

        new public void Modify()
        {

        }
    }
}