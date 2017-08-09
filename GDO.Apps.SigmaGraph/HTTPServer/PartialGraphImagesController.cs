using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Web.Http;
using GDO.Core;
using Microsoft.AspNet.SignalR;

namespace GDO.Apps.SigmaGraph.HTTPServer
{
    public class PartialGraphImagesController : ApiController
    {
        [Route("Web/SigmaGraph/images")]
        public void Post([FromBody]ImageModel model)
        {
            string imagePathForServer = "Web/SigmaGraph/images/" + model.Name;
            string imagePathForClient = "SigmaGraph/images/" + model.Name;
            var clients = Cave.Apps["SigmaGraph"].Hub.Clients;
            while (true)
            {
                try
                {
                    File.WriteAllText(imagePathForServer, model.Image);
                    clients.All.updateImagesToPlot(imagePathForClient);
                    break;
                }
                catch (IOException)
                {
                    Thread.Sleep(100);
                }
            }
        }
    }
}