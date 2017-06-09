using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading;
using System.Web;
using System.Web.Http;
using GDO.Core;
using GDO.Core.Apps;
using log4net;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace GDO
{

    public sealed class GDOAPISingleton {
     
        public CaveHub Hub;

        public static IAppHub GetHub(string name) {
            var hubtypes = GetHubList();
            if (!hubtypes.ContainsKey(name)) {
                return null;
            }


                      //  var hubContext = GlobalHost.ConnectionManager.GetHubContext(name+"AppHub");

             //hubContext = GlobalHost.ConnectionManager.GetHubContext(name );

            //           return hubContext;

            //GlobalHost.DependencyResolver.ResolveAll()
            DefaultHubManager hd = new DefaultHubManager(GlobalHost.DependencyResolver);
            var appHub = (IAppHub) (  hd.ResolveHub(name+"AppHub"));
            var gdoHub = (appHub as GDOHub);
            gdoHub.SetStateFrom(GDOAPISingleton.Instance.Hub);
            return appHub;//hd.ResolveHub(name) ??
            Type t = hubtypes[name];


            MethodInfo method = GlobalHost.ConnectionManager.GetType().GetMethod("GetHubContext");
            MethodInfo generic = method.MakeGenericMethod(t);
            return (IAppHub) generic.Invoke(GlobalHost.ConnectionManager,null );

        }

        public static Dictionary<string,Type> GetHubList() => Cave.Deployment.Apps.ToDictionary(app => app.Value.Hub.Name, app => app.Value.Hub.GetType());

        private static GDOAPISingleton _instance;
        private static readonly object Padlock = new object();

        public DateTime LastCommandSent = DateTime.Now;

        private ConcurrentQueue<string> _logMessages = new ConcurrentQueue<string>();
        private GDOAPISingleton() {
        }

        public static GDOAPISingleton Instance
        {
            get
            {
                lock (Padlock) {
                    return _instance ?? (_instance = new GDOAPISingleton());
                }
            }
        }

        public void Log(string message) {
            _logMessages.Enqueue(DateTime.Now + " : " + message);
        }
        public void ClearLog() {
            _logMessages = new ConcurrentQueue<string>();
        }

        public string GetLogMessages() {
            return _logMessages.ToArray().Aggregate("Log Messages " + _logMessages.Count, (acc, next) => acc + "\n" + next);
        }
    }

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

            return ScriptRunner.RunScript(name);
        }
     
    }

    public static class ScriptRunner {
        public static string RunScript(string name) {
            try {

                var scenariosFolder = HttpContext.Current.Server.MapPath("~/Scenarios/");
                string[] scenariosfiles = Directory.GetFiles(scenariosFolder, "*.json");
                if (!scenariosfiles.Any()) {
                    return "no scenarios at " + scenariosFolder;
                }

                var scenariofile = scenariosfiles.FirstOrDefault(n => n.Contains(name + ".json"));
                if (scenariofile == null) {
                    return "Failed to find Scenario " + name+" list is "+ scenariosfiles.Aggregate("",(acc,next)=> acc+","+next);
                }

                JObject scenariojson = (JObject) JsonConvert.DeserializeObject(File.ReadAllText(scenariofile));

                var script = scenariojson["Elements"].Select(e => e.ToObject<ScriptStep>());

                

                foreach (var scriptStep in script) {
                    if (scriptStep.Func == "goToControlPage") {
                        continue;
                    }
                    if (scriptStep.IsLoop) {
                        return "we dont support Loops yet";
                    }

                    try {

                        object hub = FindHub(scriptStep.Mod); // voodoo here
                        Type type = hub.GetType();
                        MethodInfo mi = type.GetMethod(scriptStep.Func, BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance);


                        if (mi == null) {
                            return "no such method " + scriptStep;
                        }


                        var parameters = scriptStep.ParseParams();

                        var res = mi.Invoke(hub, parameters);// here be dragons! 

                        if (Math.Abs(scriptStep.DefaultWait) > 0.01) {
                            Thread.Sleep((int) (scriptStep.DefaultWait * 1000));
                        }

                    }
                    catch (Exception e) {
                        return"Exception executing script step "+scriptStep + e;

                    }
                }
                return "Successfully ran script" + name;

            }
            catch (Exception e) {
                return "error " + e;                
            }
        }

        private static object FindHub(string module) {
            if (module == "gdo.net.server") return GDOAPISingleton.Instance.Hub;

            if (module.Contains("gdo.net.app.")) {
                string hubname = module.Replace(".server", "").Replace("gdo.net.app.", "");
           //     var hubs = GDOAPISingleton.Instance.GetHubList();

             //   if (hubs.ContainsKey(hubname)) {
               //     return hubs[hubname];
               // }

                return GDOAPISingleton.GetHub(hubname);
            }
            throw new ArgumentException("could not find module " + module);
        }
    }

    public class ScriptStep {
        public bool IsLoop { get; set; }
        public int Id { get; set; }
        public string Mod { get; set; }
        public string Func { get; set; }
        public List<string> Params { get; set; }
        public float DefaultWait { get; set; }

        /// <summary>
        /// Parses the parameters. e.g. 4,\"Imperial RTSC\"
        /// </summary>
        /// <returns></returns>
        public object[] ParseParams() {
            return
                this.Params.SelectMany(l => l.Split(new[] { "," }, StringSplitOptions.RemoveEmptyEntries))
                .Select<string, object>(
                    p => {
                        if (p.Contains("\"")) {
                            // its a string
                            return p.Replace("\"", "");// yes this will remove all "'s 
                        }
                        if (p.Contains(".")) {
                            // its a float
                            return float.Parse(p);
                        }
                        // its an int
                        return int.Parse(p);
                    })
                .ToArray();
        }

        public override string ToString() {
            return $"{nameof(IsLoop)}: {IsLoop}, {nameof(Id)}: {Id}, {nameof(Mod)}: {Mod}, {nameof(Func)}: {Func}, {nameof(Params)}: {Params.Aggregate("",(acc,next)=> acc+"|"+next)}, {nameof(DefaultWait)}: {DefaultWait}";
        }
    }
}