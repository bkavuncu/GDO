using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Apps.Maps.Core;

namespace GDO.Apps.Maps.Formats
{
    public class KMLFormat : Format
    {
        public bool ExtractStyles { get; set; }
        public Style[] DefaultStyle { get; set; }

        new public void Modify(Style[] defaultStyle, bool etractStyles)
        {
            DefaultStyle = defaultStyle;
            ExtractStyles = etractStyles;
        }
    }
}