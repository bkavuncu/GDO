using System.Collections.Generic;

namespace GDO.Core.Scenarios
{
    public class Scenario
    {
        public string Name { get; set; }
        public int CurrentElement { get; set; }
        public List<Element> Elements { get; set; }
    }
}