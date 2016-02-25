using System.Collections.Generic;

namespace GDO.Core.Scenarios
{
    public class Element
    {
        public int Index { get; set; }
        public string Module { get; set; }
        public string Function { get; set; }
        public List<Parameter> Parameters { get; set; }
        public int Timeout { get; set; }
        public bool IsLoop = false;
    }
}