using System.Collections.Generic;
using System.Web.Http;
using GDO.Core;
using Microsoft.AspNet.SignalR;

namespace GDO
{
    public class GDOController : ApiController
    {
        // GET api/<controller>
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // http://localhost:12332/api/gdo/0
        // GET api/<controller>/5
        public string Get(int id)
        {
            //Cave.ClearCave();
            IHubContext cavehub = GlobalHost.ConnectionManager.GetHubContext<CaveHub>();
            //cavehub.ClearCave();
            return "Thank you Senaka! " +id;
        }

        // POST api/<controller>
        public void Post([FromBody]string value)
        {
        }

        // PUT api/<controller>/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/<controller>/5
        public void Delete(int id)
        {
        }
    }
}