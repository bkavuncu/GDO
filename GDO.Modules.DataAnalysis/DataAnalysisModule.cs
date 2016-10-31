// This code was written by Senaka Fernando
//

using GDO.Core.Modules;
using GDO.Modules.DataAnalysis.Core;
using GDO.Modules.DataAnalysis.Core.MessageHandlers;
using System.Collections.Generic;
using System.Net.Http;

namespace GDO.Modules.DataAnalysis
{
    public class DataAnalysisModule : IModule
    {
        public string Name { get; set; }

        public void Init()
        {
            Name = "DataAnalysis";
            new ProxyServer() { URL = "http://localhost:12432" }.Init(new List<DelegatingHandler> {
                new RouteHandler("http://localhost:12432", 
                new Dictionary<string, string>() { { "/twitter", "http://146.169.32.192:5000" } }) });
        }
    }
}