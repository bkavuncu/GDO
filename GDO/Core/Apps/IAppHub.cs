using System;
using Microsoft.AspNet.SignalR.Hubs;

namespace GDO.Core.Apps
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
        void JoinGroup(string groupId);
        void ExitGroup(string groupId);
    }
}
