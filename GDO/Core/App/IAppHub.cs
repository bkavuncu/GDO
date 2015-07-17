﻿using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using System.ComponentModel.Composition;
using System.ComponentModel.Composition.Hosting;
using System.ComponentModel.Composition.Registration;
using GDO.Core;
using Microsoft.AspNet.SignalR.Hubs;


namespace GDO.Core
{
    //[InheritedExport]
    public interface IAppHub : IHub
    {
        string Name { get; set; }
    }
}
