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
            var mappings = configuration["mappings"].ToDictionary(
                x => x["context"].ToString(), x => x["url"].ToString());
            var url  = configuration["baseurl"].ToString();
            var config = Utilities.GetProxyServerConfig(url);
            new[] { new RouteHandler(url, mappings) }.ForEach(x => config.MessageHandlers.Add(x));
            new HttpSelfHostServer(config).OpenAsync().Wait();
        }   
    }
}