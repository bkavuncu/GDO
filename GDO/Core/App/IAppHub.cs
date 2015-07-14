using System;
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


namespace GDO.Core
{
    [InheritedExport]
    public interface IAppHub
    {
        string Name { get; set; }
    }
}
