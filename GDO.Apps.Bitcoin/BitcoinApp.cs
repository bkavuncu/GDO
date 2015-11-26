using System;
using GDO.Core;

namespace GDO.Apps.Bitcoin
{
    public class BitcoinApp : IBaseAppInstance
    {
        public int Id { get; set; }
        public string AppName { get; set; }
        public Section Section { get; set; }
        public AppConfiguration Configuration { get; set; }
        public bool IntegrationMode { get; set; }
        public IVirtualAppInstance ParentApp { get; set; }
        public void Init()
        {
        }
    }
}