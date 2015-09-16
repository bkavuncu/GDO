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
        new public void Modify(string culture, string key, string imagerySet)
        {
            Culture = culture;
            Key = key;
            ImagerySet = imagerySet;
        }
    }
}