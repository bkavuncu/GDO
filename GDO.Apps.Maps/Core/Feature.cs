using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core
{
    public class Feature
    {
        public Geometry Geometry { get; set; }
        public Style Style { get; set; }
    }
}