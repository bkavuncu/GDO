using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core
{
    public class Control : Base
    {

        public Control()
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