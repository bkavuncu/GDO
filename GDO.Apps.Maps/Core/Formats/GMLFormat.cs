using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Apps.Maps.Core;

namespace GDO.Apps.Maps.Core.Formats
{
    public class GMLFormat : Format
    {
        public int GMLVersion { get; set; }
        public string[] FeatureNS { get; set; }
        public string[] FeatureType { get; set; }
        public string SrsName { get; set; }
        public bool Surface { get; set; }
        public bool Curve { get; set; }
        public bool MultiCurve { get; set; }
        public bool MultiSurface { get; set; }
        public string SchemaLocation { get; set; }

        new public void Init(int gmlVersion, string[] featureNS, string[] featureType, string srsName, bool surface,
            bool curve, bool multiCurve, bool multiSurface, string schemaLocation)
        {
            GMLVersion = gmlVersion;
            FeatureNS = featureNS;
            FeatureType = featureType;
            SrsName = srsName;
            Surface = surface;
            Curve = curve;
            MultiCurve = multiCurve;
            MultiSurface = multiSurface;
            SchemaLocation = schemaLocation;
            Prepare();
        }
        new public void Prepare()
        {
            base.Prepare();
            ClassName = this.GetType().Name;
        }

        new public void Modify()
        {
        }
    }
}