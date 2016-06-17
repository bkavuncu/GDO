using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Utility;
using Newtonsoft.Json;

namespace GDO.Apps.Maps.Core
{
    public class Animation : Base
    {


        public Animation() : base()
        {
            ClassName.Value = this.GetType().Name;

        }
    }
}