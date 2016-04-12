using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Utility;

namespace GDO.Apps.Maps.Core.Sources
{
    public enum LoadingStrategies
    {
        All = 0,
        BBox = 1,
        Tile = 2
    };

    public class VectorSource : Source
    {
        public int FormatId { get; set; }
        public string Url { get; set; }
        public int? LoadingStrategy { get; set; }
        public bool? UseSpatialIndex { get; set; }

        new public void Init(int formatId, string url, int loadingStrategy, bool useSpatialIndex)
        {
            FormatId = formatId;
            Url = url;
            LoadingStrategy = loadingStrategy;
            UseSpatialIndex = useSpatialIndex;

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

        //TODO add feature functions
    }
}