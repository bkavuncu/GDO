using System.Collections.Generic;

namespace GDO.Core.Scenarios
{
    public class Scenario
    {
        public string Name { get; set; }
        public int CurrentElement { get; set; }
        public List<Element> Elements { get; set; }

        public Scenario(string name)
        {
            Name = name;
            CurrentElement = 0;
            Elements = new List<Element>();
        }
    }
}