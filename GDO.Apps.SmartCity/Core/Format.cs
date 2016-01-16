﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.SmartCity.Core
{
    public enum FormatTypes
    {
        None = -1,
        Base = 0,
        EsriJSON = 1,
        Feature = 2,
        GeoJSON = 3,
        GML = 4,
        GML2 = 5,
        GML3 = 6,
        GMLBase = 7,
        GPX = 8,
        IGC = 9,
        JSONFeature = 10,
        KML = 11,
        OSMXML = 12,
        Polyline = 13,
        TextFeature = 14,
        TopoJSON = 15,
        WFS = 16,
        WKT = 17,
        WMSCapabilities = 18,
        WMSGetFeatureInfo = 19,
        WMTSCapabilities = 20,
        XML = 21,
        XMLFeature = 22
    };
    public class Format : Base
    {

        public Format()
        {

        }
        public void Init(int id, string name, int type)
        {
            Id = id;
            Name = name;
            Type = type;

            Prepare();
        }
        new public void Prepare()
        {
            ClassName = this.GetType().Name;

            AddtoEditables(() => Id);
            AddtoEditables(() => Name);
            AddtoEditables(() => Type);
        }

        public void Modify(int id, string name, int type)
        {
            Id = id;
            Name = name;
            Type = type;
        }
    }
}