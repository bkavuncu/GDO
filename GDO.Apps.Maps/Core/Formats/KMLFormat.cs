using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Apps.Maps.Core;
using GDO.Utility;

namespace GDO.Apps.Maps.Core.Formats
{
    public class KMLFormat : Format
    {
        public BooleanParameter ExtractStyles { get; set; }
        public IntegerArrayParameter DefaultStyleIds { get; set; }

        new public void Init(int[]defaultStyleIds, bool extractStyles)
        {
            DefaultStyleIds.Values = defaultStyleIds;
            ExtractStyles.Value = extractStyles;
            Prepare();
        }
        new public void Prepare()
        {
            base.Prepare();
            ClassName.Value = this.GetType().Name;

            ExtractStyles = new BooleanParameter
            {
                Name = "Extract Styles",
                Description = "Extract Styles from KML",
                Priority = (int)GDO.Utility.Priorities.Low,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Boolean,
                Value = true,
                IsEditable = false,
                IsVisible = true
            };

            DefaultStyleIds = new IntegerArrayParameter
            {
                Name = "Default Styles",
                Description = "Style Ids",
                Priority = (int)GDO.Utility.Priorities.Low,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Array,
                IsEditable = false,
                IsVisible = true
            };
        }

        new public void Modify()
        {
        }
    }
}