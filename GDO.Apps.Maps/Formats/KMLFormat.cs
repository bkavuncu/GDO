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
        public List<Style> DefaultStyle { get; set; }

        new public void Init(List<Style> defaultStyle, bool extractStyles)
        {
            DefaultStyle = defaultStyle;
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