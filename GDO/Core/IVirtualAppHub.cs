using System;
using System.Collections.Generic;
using Microsoft.AspNet.SignalR.Hubs;


namespace GDO.Core
{
    //[InheritedExport]
    /// <summary>
    /// Virtual App Hub Interface
    /// </summary>
    public interface IVirtualAppHub : IAppHub
    {
        List<string> SupportedApps { get; set; }
    }
}
