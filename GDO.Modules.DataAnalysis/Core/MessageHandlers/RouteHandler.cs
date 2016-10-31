// This code was written by Senaka Fernando
//

using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.ServiceModel.Channels;
using System.Threading;
using System.Threading.Tasks;

namespace GDO.Modules.DataAnalysis.Core.MessageHandlers
{
    public class RouteHandler : DelegatingHandler
    {
        private Dictionary<string, string> Mappings { get; set; }
        private string URL { get; set; }

        public RouteHandler(string url, Dictionary<string, string> mappings)
        {
            Mappings = new Dictionary<string, string>(mappings);
            URL = url;
        }

        private Uri GetRequestURI(Uri uri)
        {
            var s = uri.ToString();
            Mappings.Keys.ToList().ForEach(x => s = s.Replace(URL + x, Mappings[x]));
            return new Uri(s);
        }

        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            request.Headers.Add("X-Forwarded-For", request.GetClientIp());
            if (request.Method == HttpMethod.Get || request.Method == HttpMethod.Trace) request.Content = null;
            request.RequestUri = GetRequestURI(request.RequestUri);
            request.Headers.AcceptEncoding.Clear();
            var responseMessage = await new HttpClient().SendAsync(request, HttpCompletionOption.ResponseHeadersRead);
            responseMessage.Headers.TransferEncodingChunked = null; //throws an error on calls to WebApi results
            if (request.Method == HttpMethod.Head) responseMessage.Content = null;
            return responseMessage;
        }
    }

    public static class HttpRequestMessageExtension
    {
        public static string GetClientIp(this HttpRequestMessage request)
        {
            return request.Properties.ContainsKey("MS_HttpContext") ?
                ((dynamic)request.Properties["MS_HttpContext"]).Request.UserHostAddress as string :
                ((RemoteEndpointMessageProperty)request.Properties[RemoteEndpointMessageProperty.Name]).Address;
        }
    }
}