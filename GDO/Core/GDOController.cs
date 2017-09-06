using System.Web.Http;
using GDO.Core.Scenarios;
using log4net;

namespace GDO.Core
{
    public class GDOController : ApiController
    {
        private static readonly ILog Log = LogManager.GetLogger(typeof(GDOController));

        // http://localhost:12332/api/gdo/
        // GET api/<controller>/5
        [HttpGet]
        [Route("api/GDO/ClearCave")]
        public string ClearCave()
        {
            //Cave.ClearCave();
            // IHubContext<CaveHub> cavehub = GlobalHost.ConnectionManager.GetHubContext<CaveHub>("CaveHub");
            // cavehub.Clients.All.SetMaintenanceMode(true);
            //cavehub.ClearCave();


            var hub = GDOAPISingleton.Instance.Hub;
            if (hub == null) return "hub not initialise launch a client to set";
            hub.ClearCave();

            return "Cave Cleared ";

        }

        [HttpGet]
        [Route("api/GDO/MaintainenceModeClear")]
        public string MaintainenceModeClear() {
            

            var hub = GDOAPISingleton.Instance.Hub;
            if (hub == null) return "hub not initialise launch a client to set";
            hub.SetMaintenanceMode(false);

            return "Turned off maintainence mode";
        }

        [HttpGet]
        [Route("api/GDO/MaintainenceModeSet")]
        public string MaintainenceModeSet() {
            var hub = GDOAPISingleton.Instance.Hub;
            if (hub == null) return "hub not initialise launch a client to set";
            hub.SetMaintenanceMode(false);

            return "Turned on maintainence mode";
        }

        [HttpGet]
        [Route("api/GDO/Scenario/{name}")]
        public string RunScenario(string name) {
            var hub = GDOAPISingleton.Instance.Hub;
            if (hub == null) return "hub not initialise launch a client to set";

            ClearCave();

            return ScenarioRunner.RunScript(name);
        }
     
    }
}