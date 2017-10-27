using System;
using System.Threading;
using System.Web.Http;
using GDO.Core.Apps;
using GDO.Core.Scenarios;
using log4net;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

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

        #region maintainence Mode

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

        #endregion

        #region scripting / scenarios 

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
            Log.Info($"GDO API - about to run script step " + script);
            string errors;
            var res = ScenarioRunner.RunScriptStep(scriptElement, out errors);
            if (res) {
                Log.Info($"GDO API - Successfully Ran script step " + script);
            } else {
                Log.Error($"GDO API - Failed Ran script step " + script + "errors = " + errors);
            }

            return res;
        }

        #endregion

        #region Section -  Create and close 
        /// <summary>
        /// Creates the section - works from (0,0) is the top left 
        /// </summary>
        /// <param name="colStart">The col start.</param>
        /// <param name="rowStart">The row start 0 is the top row</param>
        /// <param name="width">The width.</param>
        /// <param name="height">The height.</param>
        /// <returns>id of the section created</returns>
        [HttpGet]
        [Route("api/Section/Create")]//?colStart={colStart}&rowStart={rowStart}&width={width}&height={height}
        public int CreateSection(int colStart, int rowStart, int width, int height) {
            var hub = GDOAPISingleton.Instance.Hub;
            if (hub == null) return -1;
            Log.Info($"GDO API - creating section colStart={colStart},  rowStart={rowStart},  width={width},  height={height} ");
            int sectionid= hub.CreateSection(colStart, rowStart, colStart+width-1, rowStart+height-1);
            Log.Info($"GDO API - creating sected {sectionid} ");

            return sectionid;
        }

        [HttpGet]
        [Route("api/Section/Close")]//?id={id}
        public bool CloseSection(int id) {
            var hub = GDOAPISingleton.Instance.Hub;
            if (hub == null) return false;

            Log.Info($"GDO API - closing section {id} ");
            var res = hub.CloseSection(id);
            Log.Info($"GDO API - closed section {id} "+res);

            return res;
        }

        #endregion

        #region deploy and close app 

        #region Deploy App (named and posted config)

        /// <summary>
        /// Deploys an application, to a given section
        /// </summary>
        /// <param name="sectionId">The section id.</param>
        /// <param name="appName">Name of the app</param>
        /// <param name="config">The name of the configuration.</param>
        /// <returns>
        /// the instance id for the created app
        /// </returns>
        [HttpGet]
        [Route("api/Section/{sectionId}/DeployApp")]//?app={appName}&config={config}
        public int DeployApp(int sectionId, string appName, string config) {
            var hub = GDOAPISingleton.Instance.Hub;
            if (hub == null) return -1;

            Log.Info($"GDO API - about to deploy {appName} app to section {sectionId} with config {config}");
            
            int res = hub.DeployBaseApp(sectionId, appName, config);

            if (res >=0) {
                Log.Info($"GDO API - successfully deployed {appName} app to section {sectionId} with config {config}");
            } else {
                Log.Error($"GDO API - failed to deploy {appName} app to section {sectionId} with config {config}");
            }

            return res;
        }    

        [HttpPost]
        [Route("api/Section/{sectionId}/DeployApp")] //?app={appName}&config={config}
        public int DeployAppPostConfig(int sectionId, string appName, [FromBody] string config) {
            var hub = GDOAPISingleton.Instance.Hub;
            if (hub == null) return -1;

            Log.Info($"GDO API - about to deploy {appName} app to section {sectionId} with config {config}");

            IAppConfiguration appconfig = Cave.HydrateAppConfiguration(JObject.Parse(config), "posted");
            Log.Info($"GDO API - successfuly parsed config");

            int res = hub.DeployBaseApp(sectionId, appName, appconfig);

            if (res >= 0) {
                Log.Info($"GDO API - successfully deployed {appName} app to section {sectionId} with posted config - see above");
            } else {
                Log.Error($"GDO API - failed to deploy {appName} app to section {sectionId} with config - see above");
            }

            return res;
        }

        #endregion

        [HttpGet]
        [Route("api/Section/{sectionId}/SaveState")]
        public string SaveAppState(int sectionId) {
            var hub = GDOAPISingleton.Instance.Hub;
            if (hub == null) return "No Cave State";

            Log.Info($"GDO API - about to Save the state of {sectionId}");
            if (!Cave.Deployment.Instances.ContainsKey(sectionId)) {
                Log.Info($"GDO API - could not find the app running on section {sectionId}");
                return "bad sectionID";
            }
            try {
                var app = Cave.Deployment.Instances[sectionId];
                var config = app.GetConfiguration();
                string res = JsonConvert.SerializeObject(config);
                return res;
            } catch (Exception e) {
                Log.Error($"GDO API - failed to get state for section {sectionId} "+e);
                return "error saving state " + e;
            }

        }

        [HttpGet]
        [Route("api/Section/{sectionId}/CloseApp")]
        public bool CloseApp(int sectionId) {
            var hub = GDOAPISingleton.Instance.Hub;
            if (hub == null) return false;

            Log.Info($"GDO API - about to close the app on section {sectionId}");

            bool res = hub.CloseApp(sectionId);

            Log.Info($"GDO API - {(res ? "succesfully" : "Failed to ")} close an app on section {sectionId}");


            return res;
        }

        #endregion

        #region CaveState - load named cavestate

        /// <summary>
        /// Deploys the given state to the observatory 
        /// </summary>
        /// <param name="stateName">Name of the state.</param>
        /// <returns>success</returns>
        [HttpGet]
        [Route("api/CaveState/Deploy")]//?stateName={stateName}
        public bool DeployState(string stateName) {
            var hub = GDOAPISingleton.Instance.Hub;
            if (hub == null) return false;

            Log.Info($"GDO API - about to deploy CaveState {stateName}");
            hub.ClearCave();
            Thread.Sleep(1000);
            hub.RestoreCaveState(stateName);
            Log.Info($"GDO API - successfully deployed CaveState {stateName}");

            return true;
        }

        #endregion



        /* TODO
         * DONE+tested make statichtml app save state   
        // ability to send an app config in the post section 
        // close App
        // save a state of an app

        // create section and deploy 
        // close app and close section
        // send to console 
        
        
        // save state of whole cave 
        // ability to load a whole script via post 

        // ability to deploy state within a script 

        */
    }
}