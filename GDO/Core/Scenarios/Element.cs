using System.Collections.Generic;

namespace GDO.Core.Scenarios
{
    public class Element
    {
        public int Id { get; set; }
        public string Mod { get; set; }
        public string Func { get; set; }
        public List<string> Params { get; set; }
        public int Wait { get; set; }
        public bool IsLoop = false;

        public Element(int index, string function, int timeout)
        {
            Params = new List<string>();
        }
    }
}