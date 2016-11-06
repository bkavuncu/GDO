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
            new ProxyServer().Init(Utilities.GetModuleConfigurations()["Default"]);
        }
    }
}