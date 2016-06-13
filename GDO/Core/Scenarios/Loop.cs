using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Web;

namespace GDO.Core.Scenarios
{
    public class Loop : Element
    {
        public int Min { get; set; }
        public int Max { get; set; }
        public string Name { get; set; }
        public List<Element> Elements { get; set; }
        public new bool IsLoop = true;

        public Loop(int index, string function, int timeout) : base(index, function, timeout)
        {

        }
    }
}