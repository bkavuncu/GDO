using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace GDO.Apps.SigmaGraph.HTTPServer
{
    public class PartialGraphImagesController : ApiController
    {
        [Route("Web/SigmaGraph/images")]
        public void Post([FromBody]ImageModel model)
        {
            string path = "Web/SigmaGraph/images/" + model.Name;
            File.WriteAllText(path, model.Image);
        }
    }
}