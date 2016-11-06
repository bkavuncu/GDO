// This code was written by Senaka Fernando
//

using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

namespace GDO.Modules.DataAnalysis.Core.Handlers.Message
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
            var requestedURI = GetRequestURI(request.RequestUri);
            if (requestedURI.ToString().Equals(request.RequestUri.ToString()))
            {
                return await base.SendAsync(request, cancellationToken).ContinueWith((task) =>
                {
                    HttpResponseMessage response = task.Result;
                    
                    // Below line is required for CORS support required by Browsers.
                    response.Headers.Add("Access-Control-Allow-Origin", "*");

                    return response;
                });
            }
            request.Headers.Add("X-Forwarded-For", request.GetClientIp());
            if (request.Method == HttpMethod.Get || request.Method == HttpMethod.Trace) request.Content = null;
            request.RequestUri = requestedURI;
            request.Headers.AcceptEncoding.Clear();
            var responseMessage = await new HttpClient().SendAsync(request, HttpCompletionOption.ResponseHeadersRead);
            
            // Below lines are required for:
            //     1. Dealing with an error reported by WebAPIs
            //     2. CORS support required by Browsers
            //     3. Head messages sent by Browsers
            responseMessage.Headers.TransferEncodingChunked = null;
            responseMessage.Headers.Add("Access-Control-Allow-Origin", "*");
            if (request.Method == HttpMethod.Head) responseMessage.Content = null;

            return responseMessage;
        }
    }
}