using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Utility;

namespace GDO.Apps.Maps.Core.Sources
{
    public class VectorSource : Source
    {
        public GenericDictionary<Feature> Features { get; set; }
        //TODO Maybe something more simple for JSON to pick easily or customized function



        public bool UseSpatialIndex { get; set; }
    }
}