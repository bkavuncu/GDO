using System;
using GDO.Core;
using GDO.Core.Apps;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace GDO.Apps.PresentationTool.Core
{
    public class Slide
    {
        public int Page { get; set; }
        public Dictionary<int, AppSection> Sections { get; set; }
        public Dictionary<int, string> Instances { get; set; }

        public Slide(Dictionary<int, AppSection> sections, Dictionary<int, string> instances)
        {
            Sections = sections;
            Instances = instances;
        }

        public string SerializeJSON()
        {
            return JsonConvert.SerializeObject(this);
        }
    }
}