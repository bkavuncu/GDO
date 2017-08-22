using System.IO;
using System.Threading;
using System.Web.Http;
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