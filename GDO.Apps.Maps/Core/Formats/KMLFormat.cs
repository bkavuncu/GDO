using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Apps.Maps.Core;

namespace GDO.Apps.Maps.Core.Formats
{
    public class KMLFormat : Format
    {
        public bool ExtractStyles { get; set; }
        public int[] DefaultStyleIds { get; set; }

        new public void Init(int[]defaultStyleIds, bool extractStyles)
        {
            DefaultStyleIds = defaultStyleIds;
            ExtractStyles = extractStyles;
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