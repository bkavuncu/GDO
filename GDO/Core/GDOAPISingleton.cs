using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using GDO.Core.Apps;
using log4net;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;

namespace GDO.Core {
    /// <summary>
    /// This class exists to hold references to the Hubs and provide access to them 
    /// </summary>
    public sealed class GDOAPISingleton {
        private static readonly ILog Logger = LogManager.GetLogger(typeof(GDOAPISingleton));

        public CaveHub Hub;

        public static IAppHub GetAppHubForAppInstance(string name, int instanceId) {

            try {
                GDOHub gdoHub = CreateHub(name);
                string appName = Cave.GetAppName(instanceId);
                var appHub = Cave.Deployment.Apps[appName].Instances[instanceId].App.Hub;
                var gdoapphub = appHub as GDOHub;
                gdoHub.SetStateFrom(gdoapphub);

                return (IAppHub) gdoHub;
            }
            catch (Exception e) {
                Logger.Error($"failed to find hub {name} instance {instanceId} "+e);
                return null;
            }
        }

        public static IAppHub GetGDOHub(string name) {
            GDOHub gdoHub = CreateHub(name);
            gdoHub.SetStateFrom(GDOAPISingleton.Instance.Hub);
            return (IAppHub) gdoHub;
            
            //hd.ResolveHub(name) ??

            //  var hubContext = GlobalHost.ConnectionManager.GetHubContext(name+"AppHub");
            // hubContext = GlobalHost.ConnectionManager.GetHubContext(name );
            //           return hubContext;

            //GlobalHost.DependencyResolver.ResolveAll()
            //  Type t = hubtypes[name];
            //
            //
            //  MethodInfo method = GlobalHost.ConnectionManager.GetType().GetMethod("GetHubContext");
            //  MethodInfo generic = method.MakeGenericMethod(t);
            //  return (IAppHub) generic.Invoke(GlobalHost.ConnectionManager,null );

        }

        private static GDOHub CreateHub(string name) {
            Dictionary<string, Type> hubtypes = GetHubList();
            if (!hubtypes.ContainsKey(name)) {
                return null;
            }

            DefaultHubManager hd = new DefaultHubManager(GlobalHost.DependencyResolver);
            var appHub = (IAppHub) hd.ResolveHub(name + "AppHub");
            var gdoHub = appHub as GDOHub;
            if (gdoHub == null) {
                Logger.Error(" " + appHub.GetType() + " does not extend from GDOHub - cannot call scripts");
                throw new Exception("Hub classes must extend from GDOHub");
            }
            return gdoHub;
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
}