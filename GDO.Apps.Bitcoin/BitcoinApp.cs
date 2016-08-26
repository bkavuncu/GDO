using System;
using GDO.Core;
using GDO.Core.Apps;
using Microsoft.AspNet.SignalR;

namespace GDO.Apps.Bitcoin
{
    public class BitcoinApp : IBaseAppInstance
    {
        public int Id { get; set; }
        public string AppName { get; set; }
        public App App { get; set; }
        public Section Section { get; set; }
        public AppConfiguration Configuration { get; set; }
        public bool IntegrationMode { get; set; }
        public ICompositeAppInstance ParentApp { get; set; }
        public void Init()
        {
        }
    }
}