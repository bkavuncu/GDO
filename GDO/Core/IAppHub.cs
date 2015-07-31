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
using Microsoft.AspNet.SignalR.Hubs;


namespace GDO.Core
{
    //[InheritedExport]
    /// <summary>
    /// App Hub Interface
    /// </summary>
    public interface IAppHub : IHub
    {
        string Name { get; set; }
        int P2PMode { get; set; }
        Type InstanceType { get; set; }
        void JoinGroup(int instanceId);
        void ExitGroup(int instanceId);
    }
}
