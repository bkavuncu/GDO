﻿using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Web.Http;
using GDO.Apps.SigmaGraph.Domain;
using GDO.Core;

namespace GDO.Apps.SigmaGraph.HTTPServer
{
    public class PartialGraphImagesController : ApiController
    {
        /// <summary>
        /// Saves the image represented by model to disk and updates the control
        /// UI to show the image. If writing to disk fails, this method will
        /// wait 100ms and try to write to disk again. There is no limit to the
        /// number of attempts.
        /// </summary>
        /// <param name="model">the model containing the image details</param>
        [Route("Web/SigmaGraph/images")]
        public void Post([FromBody]ImageModel model)
        {
            string imagePathForServer = "Web/SigmaGraph/images/" + model.Name;
            string imagePathForClient = "SigmaGraph/images/" + model.Name;
            var clients = Cave.Deployment.Apps["SigmaGraph"].Hub.Clients;
            int retries = 0;
            while (retries<5) {
                retries++;
                try
                {
                    File.WriteAllText(imagePathForServer, model.Image);
                    clients.All.updateImagesToPlot(imagePathForClient);
                    break;
                }
                catch (IOException)
                {
                    Thread.Sleep(100);// back off for file locks 
                }
            }
        }

        [Route("Web/SigmaGraph/getquads")]
        public List<string> GetQuads(int appId, int screenid) {//todo is gdo.controlId == appId? 

            ConcurrentDictionary<int, ZoomArea> zoomdict;
            if (!SigmaGraphAppHub.ScreenFoci.TryGetValue(appId, out zoomdict)) {
                return new List<string> {"could not find app id " + appId};
            }

            ZoomArea zoomArea;
            if (!zoomdict.TryGetValue(screenid, out zoomArea)) {
                return new List<string> {"could not find zoom area for screen id " + screenid+" make sure it is running"};
            }

            return SigmaGraphAppHub.GetFilesWithin(appId, zoomArea);            
        }
    }
}