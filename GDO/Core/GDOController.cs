using System.Web.Http;
using GDO.Core.Scenarios;
using log4net;

namespace GDO.Core
{
    public class GDOController : ApiController {
        private static readonly ILog Log = LogManager.GetLogger(typeof(GDOController));

        // http://localhost:12332/api/gdo/
        // GET api/<controller>/5
        [HttpGet]
        [Route("api/GDO/ClearCave")]
        public string ClearCave() {
            //Cave.ClearCave();
            // IHubContext<CaveHub> cavehub = GlobalHost.ConnectionManager.GetHubContext<CaveHub>("CaveHub");
            // cavehub.Clients.All.SetMaintenanceMode(true);
            //cavehub.ClearCave();


            var hub = GDOAPISingleton.Instance.Hub;
            if (hub == null) return "hub not initialise launch a client to set";

            Log.Info("GDO API - Clearing Cave");

            hub.ClearCave();

            Log.Info("GDO API - Cleared Cave");

            return "Cave Cleared ";

        }

        [HttpGet]
        [Route("api/GDO/MaintainenceModeClear")]
        public string MaintainenceModeClear() {
            var hub = GDOAPISingleton.Instance.Hub;
            if (hub == null) return "hub not initialise launch a client to set";
            hub.SetMaintenanceMode(false);

            Log.Info("GDO API - Turned Off Maintainence Mode");

            return "Turned off maintainence mode";
        }

        [HttpGet]
        [Route("api/GDO/MaintainenceModeSet")]
        public string MaintainenceModeSet() {
            var hub = GDOAPISingleton.Instance.Hub;
            if (hub == null) return "hub not initialise launch a client to set";
            hub.SetMaintenanceMode(true);

            Log.Info("GDO API - Turned On Maintainence Mode");

            return "Turned on maintainence mode";
        }

        [HttpGet]
        [Route("api/GDO/Scenario/{name}")]
        public string RunScenario(string name) {
            var hub = GDOAPISingleton.Instance.Hub;
            if (hub == null) return "hub not initialise launch a client to set";

            Log.Info("GDO API - Clearing Cave to load Script "+name);

            ClearCave();

            var result = ScenarioRunner.RunScript(name);

            Log.Info("GDO API - Just Ran Scenario Script " + name + " result was " + result);

            return result;
        }

        [HttpGet]
        //[Route("api/Section/Create?lowerleft={lowerLeft}&uppoerRight={upperRight}")]
        //public int CreateSectionByScreenID(int lowerLeft, int upperRight) {
        
        [Route("api/Section/Create?colStart={colStart}&rowStart={rowStart}&width={width}&height={height}")]
        public int CreateSection(int colStart, int rowStart, int width, int height) {
            var hub = GDOAPISingleton.Instance.Hub;
            if (hub == null) return -1;
            Log.Info($"GDO API - creating section colStart={colStart},  rowStart={rowStart},  width={width},  height={height} ");
            int sectionid= hub.CreateSection(colStart, rowStart, colStart+width, rowStart+height);
            Log.Info($"GDO API - creating sected {sectionid} ");

            return sectionid;
        }
    }
}