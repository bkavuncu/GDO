using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core
{
    public class Interaction
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int Type { get; set; }

        public Interaction()
        {

        }
        public void Modify(int id, string name, int type)
        {
            Id = id;
            Name = name;
            Type = type;
        }
    }
}