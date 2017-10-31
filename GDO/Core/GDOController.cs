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

        #region run script step, make module call, run scenario, post and run scenario 
        /// <summary>
        /// Simplified method call 
        /// {
        ///  "Mod": "gdo.net.app.Images.server",
        ///  "Func": "findDigits",
        ///  "Params": [ "0,\"00002\"" ],
        ///},
        /// </summary>
        /// <param name="scriptElement">The script element.</param>
        /// <returns></returns>
        [HttpPost]
        [Route("api/Script/RunMethod")]
        public bool RunStep([FromBody] HubCall scriptElement) {
            var hub = GDOAPISingleton.Instance.Hub;
            if (hub == null) return false;

            var script = JsonConvert.SerializeObject(scriptElement);
            Log.Info($"GDO API - about to run script step " + script);
            string errors;
            var res = ScenarioRunner.RunScriptStep(new Element(scriptElement), out errors);
            if (res) {
                Log.Info($"GDO API - Successfully Ran script step " + script);
            } else {
                Log.Error($"GDO API - Failed Ran script step " + script + "errors = " + errors);
            }

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

        /// <summary>
        /// Runs the scenario previously saved onto the server
        /// </summary>
        /// <param name="name">The name of the script</param>
        /// <returns>status / errors</returns>
        [HttpGet]
        [Route("api/GDO/Scenario/{name}")]
        public string RunScenario(string name) {
            var hub = GDOAPISingleton.Instance.Hub;
            if (hub == null) return "hub not initialise launch a client to set";

            Log.Info("GDO API - Clearing Cave to load Script " + name);

            ClearCave();

            var result = ScenarioRunner.RunScript(name);

            Log.Info("GDO API - Just Ran Scenario Script " + name + " result was " + result);

            return result;
        }

        /// <summary>
        /// Runs the script posted  - check the Scenario class for format
        /// </summary>
        /// <param name="name">The name of the script</param>
        /// <param name="script">The script.</param>
        /// <returns>errors / status</returns>
        [HttpPost]
        [Route("api/GDO/Script/RunScript")]
        public string RunScript(string name, [FromBody] Scenario script) {

            var scriptstr = JsonConvert.SerializeObject(script);
            Log.Info($"GDO API - about to run posted script {name} {scriptstr}");

            var res = ScenarioRunner.RunScript(name, scriptstr);
            Log.Info($"GDO API - finished running script {name} - result was {res} ");

            return res;
        }

        #endregion

        #region Section -  Create and close and destroy
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

       /// <summary>
        /// Closes the section - note this assumes that the app running in the section is already closed!
        /// if you want to close app and the section in one call please call the destroy method
        /// </summary>
        /// <param name="id">The identifier.</param>
        /// <returns></returns>
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

        /// <summary>
        /// destroys the section by closing app and closing section
        /// </summary>
        /// <param name="id">The identifier of the section</param>
        /// <returns></returns>
        [HttpGet]
        [Route("api/Section/Destroy")] //?id={id}
        public bool SectionDestroy(int id) {
            var hub = GDOAPISingleton.Instance.Hub;
            if (hub == null) return false;

            Log.Info($"GDO API - destroying section {id} ");
            bool res = hub.CloseApp(id); 
            res= res && hub.CloseSection(id);
            // Option 1 - App and Instance Id as seperate arguments
            // Option 2 - You add a method to Cave hub to return a app id from given section id or vice versa, to close both with same id
            
            Log.Info($"GDO API - destoryed section {id} " + res);

            return res;
        }

        #endregion

        #region create section and deploy app

        /// <summary>
        /// Creates a section and deploys an app to it
        /// </summary>
        /// <param name="appName">Name of the application.</param>
        /// <param name="config">The configuration.</param>
        /// <param name="colStart">The col start.</param>
        /// <param name="rowStart">The row start.</param>
        /// <param name="width">The width.</param>
        /// <param name="height">The height.</param>
        /// <returns>id of the app</returns>
        [HttpGet]
        [Route("api/Section/CreateAndDeploy")] //??appName={}&config=,colStart={colStart}&rowStart={rowStart}&width={width}&height={height}
        public int CreateAndDeploy(string appName, string config, int colStart, int rowStart, int width, int height) {
            Log.Info("GDO API - Creating and deploying app");
            var sectionid = CreateSection(colStart, rowStart, width, height);
            int appid = DeployApp(sectionid, appName, config);
            return appid;
        }

        /// <summary>
        /// Creates a section and deploys an app to it using a posted config
        /// </summary>
        /// <param name="appName">Name of the application.</param>
        /// <param name="config">The configuration.</param>
        /// <param name="colStart">The col start.</param>
        /// <param name="rowStart">The row start.</param>
        /// <param name="width">The width.</param>
        /// <param name="height">The height.</param>
        /// <returns>id of the app</returns>

        [HttpPost]
        [Route("api/Section/CreateAndDeploy")] //??appName={}&config=,colStart={colStart}&rowStart={rowStart}&width={width}&height={height}
        public int CreateAndDeployPost(string appName, [FromBody] string config, int colStart, int rowStart, int width, int height) {
            Log.Info("GDO API - Creating and deploying app with posted body");
            var sectionid = CreateSection(colStart, rowStart, width, height);
            int appid = DeployAppPostConfig(sectionid, appName, config);
            return appid;
        }


        #endregion

        #region deploy and close app, save state, set state

        #region Deploy App (named and posted config), Set state

        /// <summary>
        /// Deploys an application, to a given section
        /// </summary>
        /// <param name="id">The section id.</param>
        /// <param name="appName">Name of the app</param>
        /// <param name="config">The name of the configuration.</param>
        /// <returns>
        /// the instance id for the created app
        /// </returns>
        [HttpGet]
        [Route("api/Section/{id}/DeployApp")]//?app={appName}&config={config}
        public int DeployApp(int id, string appName, string config) {
            var hub = GDOAPISingleton.Instance.Hub;
            if (hub == null) return -1;

            Log.Info($"GDO API - about to deploy {appName} app to section {id} with config {config}");
            
            int res = hub.DeployBaseApp(id, appName, config);

            if (res >=0) {
                Log.Info($"GDO API - successfully deployed {appName} app to section {id} with config {config}");
            } else {
                Log.Error($"GDO API - failed to deploy {appName} app to section {id} with config {config}");
            }

            return res;
        }    

        [HttpPost]
        [Route("api/Section/{id}/DeployApp")] //?app={appName}&config={config}
        public int DeployAppPostConfig(int id, string appName, [FromBody] string config) {
            var hub = GDOAPISingleton.Instance.Hub;
            if (hub == null) return -1;

            Log.Info($"GDO API - about to deploy {appName} app to section {id} with config {config}");

            IAppConfiguration appconfig = Cave.HydrateAppConfiguration(JObject.Parse(config), "posted");
            Log.Info($"GDO API - successfuly parsed config");

            int res = hub.DeployBaseApp(id, appName, appconfig);

            if (res >= 0) {
                Log.Info($"GDO API - successfully deployed {appName} app to section {id} with posted config - see above");
            } else {
                Log.Error($"GDO API - failed to deploy {appName} app to section {id} with config - see above");
            }

            return res;
        }

        #endregion

        [HttpGet]
        [Route("api/Section/{id}/SaveState")]
        public string SaveAppState(int id) {
            var hub = GDOAPISingleton.Instance.Hub;
            if (hub == null) return "No Cave State";

            Log.Info($"GDO API - about to Save the state of {id}");
            if (!Cave.Deployment.Instances.ContainsKey(id)) { // again wrong id or it should be api/App/{id}/*
                Log.Info($"GDO API - could not find the app running on section {id}");
                return "bad sectionID";
            }
            try {
                var app = Cave.Deployment.Instances[id]; // again wrong id or it should be api/App/{id}/*
                var config = app.GetConfiguration();
                string res = JsonConvert.SerializeObject(config);
                return res;
            } catch (Exception e) {
                Log.Error($"GDO API - failed to get state for section {id} "+e);
                return "error saving state " + e;
            }

        }
        
        /// <summary>
        /// Sets the state of the application in sectionId
        /// </summary>
        /// <param name="id">The section identifier.</param>
        /// <param name="config">The configuration - from body</param>
        /// <returns>success / failure</returns>
        [HttpPost]
        [Route("api/Section/{id}/SetState")]
        public bool SetAppState(int id,  [FromBody] string config) {
            var hub = GDOAPISingleton.Instance.Hub;
            if (hub == null) return false;

            Log.Info($"GDO API - about to deploy a posted app config to section {id} with config {config}");

            IAppConfiguration appconfig = Cave.HydrateAppConfiguration(JObject.Parse(config), "posted");
            Log.Info($"GDO API - successfuly parsed config");

            var app = Cave.Deployment.GetInstancebyID(id); // again wrong id or it should be api/App/{id}/*
            if (app == null) {
                Log.Error($"GDO API - could not find app with {id}");
                return false;
            }
           var res = app.SetConfiguration(appconfig);

            if (res) {
                Log.Error("GDO API - failed to set config");
            }
            else {
                Log.Info("GDO API - successfully set config");
            }

            return res;
        }


        [HttpGet]
        [Route("api/Section/{id}/CloseApp")]
        public bool CloseApp(int id) {
            var hub = GDOAPISingleton.Instance.Hub;
            if (hub == null) return false;

            Log.Info($"GDO API - about to close the app on section {id}");

            bool res = hub.CloseApp(id); // again wrong id or it should be api/App/{id}/*

            Log.Info($"GDO API - {(res ? "succesfully" : "Failed to ")} close an app on section {id}");


            return res;
        }

        #endregion

        #region CaveState - load named cavestate, save state, get state

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
            Thread.Sleep(100);
            hub.RestoreCaveState(stateName);
            Log.Info($"GDO API - successfully deployed CaveState {stateName}");

            return true;
        }

        [HttpGet]
        [Route("api/CaveState/Save")] //?stateName={stateName}
        public bool SaveState(string stateName) {

            var hub = GDOAPISingleton.Instance.Hub;
            if (hub == null) return false;

            Log.Info($"GDO API - about to save CaveState {stateName}");
            
            hub.SaveCaveState(stateName);
            
            Log.Info($"GDO API - successfully saved CaveState {stateName}");

            return true;
        }


        /// <summary>
        /// Returns the Json for the state with statename
        /// </summary>
        /// <param name="stateName">Name of the state.</param>
        /// <returns></returns>
        [HttpGet]
        [Route("api/CaveState/Get")] //?stateName={stateName}
        public string GetState(string stateName) {

            Log.Info($"GDO API - about to return CaveState {stateName}");

            var state = Cave.States[stateName];
            string res = JsonConvert.SerializeObject(state);
            return res;   
        }


        #endregion



        /* TODO test the following
         * DONE+tested make statichtml app save state   
        // DONE ability to send an app config in the post section 
        // DONE close App
        // DONE save a state of an app
        // DONE simplify the script step API 
                DONE superclass the scriptstep api 
        // DONE save state of whole cave 
        // DONE Get Cave State
        // DONE ability to load a whole script via post 
        // DONE set state
        // DONE close app and close section = destroy method
        // DONE create section and deploy 
           //  DONE  and via post
        // send to console 
              

        // ability to deploy state within a script << can be done with cavehub.RestoreCaveState

        */
    }
}
