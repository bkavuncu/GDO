// This code was written by Senaka Fernando
//

using System;
using System.ComponentModel.Composition;
using Microsoft.AspNet.SignalR;

using GDO.Core.Modules;

namespace GDO.Modules.DataAnalysis
{
    [Export(typeof(IModuleHub))]
    public class DataAnalysisModuleHub : Hub, IModuleHub
    {
        public Type ModuleType { get; set; } = typeof(DataAnalysisModule);

        public string Name { get; set; } = "DataAnalysis";

        public void JoinGroup(string moduleName)
        {
            Groups.Add(Context.ConnectionId, "" + moduleName);
        }

        public void ExitGroup(string moduleName)
        {
            Groups.Remove(Context.ConnectionId, "" + moduleName);
        }
    }
}