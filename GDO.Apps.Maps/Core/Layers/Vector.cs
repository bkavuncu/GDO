﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.Maps.Core.Layers
{
    public class Vector : Layer
    {
        public Style Style{ get; set; }

        new public void Init(Style style)
        {
            Style = style;
        }
    }
}