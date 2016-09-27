using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Utility;
using Newtonsoft.Json;

namespace GDO.Apps.Maps.Core
{
    public class Data : Base
    {


        public Data() : base()
        {
            ClassName.Value = this.GetType().Name;

        }
    }
}