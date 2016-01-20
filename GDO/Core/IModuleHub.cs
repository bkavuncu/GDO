using System;
using System.Collections.Generic;
using Microsoft.AspNet.SignalR.Hubs;


namespace GDO.Core
{
    public interface IModuleHub : IHub
    {
        string Name { get; set; }
    }
}
