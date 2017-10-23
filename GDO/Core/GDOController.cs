using System.Web.Http;
using GDO.Core.Scenarios;
using log4net;
using Newtonsoft.Json;

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


        //[Route("api/Section/Create?lowerleft={lowerLeft}&uppoerRight={upperRight}")]
        //public int CreateSectionByScreenID(int lowerLeft, int upperRight) {

        [HttpGet]
        [Route("api/Section/Create?colStart={colStart}&rowStart={rowStart}&width={width}&height={height}")]
        public int CreateSection(int colStart, int rowStart, int width, int height) {
            var hub = GDOAPISingleton.Instance.Hub;
            if (hub == null) return -1;
            Log.Info($"GDO API - creating section colStart={colStart},  rowStart={rowStart},  width={width},  height={height} ");
            int sectionid= hub.CreateSection(colStart, rowStart, colStart+width, rowStart+height);
            Log.Info($"GDO API - creating sected {sectionid} ");

            return sectionid;
        }

        [HttpGet]
        [Route("api/Section/Close?id={id}")]
        public bool CloseSection(int id) {
            var hub = GDOAPISingleton.Instance.Hub;
            if (hub == null) return false;

            Log.Info($"GDO API - closing section {id} ");
            var res = hub.CloseSection(id);
            Log.Info($"GDO API - closed section {id} "+res);

            return res;
        }

        /// <summary>
        /// Runs the step.
        /// {
        ///  "IsLoop": false,
        ///  "Id": 2,
        ///  "Mod": "gdo.net.app.Images.server",
        ///  "Func": "findDigits",
        ///  "Params": [ "0,\"00002\"" ],
        ///  "DefaultWait": 0.0
        ///},
        /// </summary>
        /// <param name="scriptElement">The script element.</param>
        /// <returns></returns>
        [HttpPost]
        [Route("api/Script/RunStep")]
        public bool RunStep([FromBody] Element scriptElement) {
            var hub = GDOAPISingleton.Instance.Hub;
            if (hub == null) return false;

            var script = JsonConvert.SerializeObject(scriptElement);
            Log.Info($"GDO API - about to run script step "+script);
            string errors;
            var res = ScenarioRunner.RunScriptStep(scriptElement ,out errors);
            if (res) {
                Log.Info($"GDO API - Successfully Ran script step " + script);
            }
            else {
                Log.Error($"GDO API - Failed Ran script step " + script+ "errors = "+errors);
            }

            return res;
        }


    }
}