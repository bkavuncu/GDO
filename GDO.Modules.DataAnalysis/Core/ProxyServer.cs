// This code was written by Senaka Fernando
//

using GDO.Modules.DataAnalysis.Core.Handlers.Message;
using Newtonsoft.Json.Linq;
using System.Linq;
using System.Web.Http.SelfHost;

namespace GDO.Modules.DataAnalysis.Core
{
    public class ProxyServer
    {
        public void Init(JObject configuration)
        {
            // If the server must not be started remove "baseurl"
            var url = configuration["baseurl"];
            if (url != null)
            {
                // If there are no mappings, specify as "mappings": []
                var mappings = configuration["mappings"].ToDictionary(
                    x => x["context"].ToString(), x => x["url"].ToString());
                var config = Utilities.GetProxyServerConfig(url.ToString());
                new[] { new RouteHandler(url.ToString(), mappings) }.ForEach(x => config.MessageHandlers.Add(x));
                new HttpSelfHostServer(config).OpenAsync().Wait();
            }
            
        }   
    }
}