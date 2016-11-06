// This code was written by Senaka Fernando
//

using GDO.Modules.DataAnalysis.Core.Handlers.Message;
using System.Collections.Generic;
using System.Net.Http;
using System.Web.Http.SelfHost;

namespace GDO.Modules.DataAnalysis.Core
{
    public class ProxyServer
    {
        public string URL { get; set; }

        public void Init()
        {
            var handlers = new List<DelegatingHandler> {
                new RouteHandler(URL, new Dictionary<string, string>() {
                    { "/twitter", "http://146.169.32.192:5000" },
                    { "/mongo", "http://10.0.2.2:8080" }
                }) };
            var config = Utilities.GetProxyServerConfig(URL);
            handlers.ForEach(x => config.MessageHandlers.Add(x));
            new HttpSelfHostServer(config).OpenAsync().Wait();
        }   
    }
}