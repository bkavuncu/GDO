using System;
using System.Collections.Generic;
using Microsoft.AspNet.SignalR.Hubs;


namespace GDO.Core
{
    public interface IModuleHub : IHub
    {
        string Name { get; set; }
        Type ModuleType { get; set; }
        void JoinGroup(string moduleName);
        void ExitGroup(string moduleName);
    }
}
