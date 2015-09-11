using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.SmartCity.Core
{
    public class Interaction : Base
    {

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