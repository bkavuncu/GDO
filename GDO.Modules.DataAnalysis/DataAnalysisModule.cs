// This code was written by Senaka Fernando
//

using GDO.Core.Modules;
using GDO.Modules.DataAnalysis.Core;

namespace GDO.Modules.DataAnalysis
{
    public class DataAnalysisModule : IModule
    {
        public string Name { get; set; }

        public void Init()
        {
            Name = "DataAnalysis";
            new ProxyServer() { URL = "http://localhost:12432" }.Init();
        }
    }
}