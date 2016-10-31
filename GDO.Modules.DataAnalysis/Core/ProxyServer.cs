// This code was written by Senaka Fernando
//

using System.Collections.Generic;
using System.Net.Http;
using System.ServiceModel;
using System.Web.Http.SelfHost;

namespace GDO.Modules.DataAnalysis.Core
{
    public class ProxyServer
    {
        public string URL { get; set; }

        public void Init(List<DelegatingHandler> handlers)
        {
            var config = new HttpSelfHostConfiguration(URL)
            {
                TransferMode = TransferMode.Streamed
            };
            handlers.ForEach(x => config.MessageHandlers.Add(x));
            new HttpSelfHostServer(config).OpenAsync().Wait();
        }   
    }
}