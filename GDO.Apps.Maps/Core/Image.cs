using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core
{
    public class Image : Base
    {
        public Image(int id, string name, int type) : base(id, name, type)
        {
            ClassName.Value = this.GetType().Name;
        }
    }
}