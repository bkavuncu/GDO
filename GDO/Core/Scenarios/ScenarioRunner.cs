using System;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading;
using System.Web;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace GDO.Core.Scenarios {
    public static class ScenarioRunner {
        /// <summary>
        /// enables running of scenarios on the Serverside.
        /// </summary>
        /// <param name="name">The name.</param>
        /// <returns></returns>
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

                var script = scenariojson["Elements"].Select(e => e.ToObject<Element>());

                
                foreach (var scriptStep in script) {
                    string errors;
                    if (!RunScriptStep(scriptStep, out errors)) return errors;
                }
                return "Successfully ran script" + name;

            }
            catch (Exception e) {
                return "error " + e;                
            }
        }

        /// <summary>
        /// Runs the script step.
        /// </summary>
        /// <param name="scriptStep">The script step.</param>
        /// <param name="errors">The errors.</param>
        /// <returns>true if executed succesffuly </returns>
        public static bool RunScriptStep(Element scriptStep, out string errors) {
            errors = null;
            if (scriptStep.Func == "goToControlPage") {
                return false;
            }
            if (scriptStep.IsLoop) {
                {
                    errors = "we dont support Loops yet";
                    return false;
                }
            }

            try {
                object hub = FindHub(scriptStep.Mod); // voodoo here
                Type type = hub.GetType();
                MethodInfo mi = type.GetMethod(scriptStep.Func,
                    BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance);


                if (mi == null) {
                    {
                        errors = "no such method " + scriptStep;
                        return false;
                    }
                }


                var parameters = scriptStep.ParseParams();

                var res = mi.Invoke(hub, parameters); // here be dragons! 

                if (Math.Abs(scriptStep.DefaultWait) > 0.01) {
                    Thread.Sleep((int) (scriptStep.DefaultWait * 1000));
                }
            }
            catch (Exception e) {
                {
                    errors = "Exception executing script step " + scriptStep + e;
                    return false;
                }
            }
            return true;
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
}