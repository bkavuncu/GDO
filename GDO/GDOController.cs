using System;
using System.Collections.Concurrent;
using System.Linq;
using System.Web.Http;
using GDO.Core;
using log4net;

namespace GDO
{

    public sealed class GDOAPISingleton {

        public CaveHub Hub;
    

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
        public string ClearCave()
        {
            //Cave.ClearCave();
            // IHubContext<CaveHub> cavehub = GlobalHost.ConnectionManager.GetHubContext<CaveHub>("CaveHub");
            // cavehub.Clients.All.SetMaintenanceMode(true);
            //cavehub.ClearCave();

            GDOAPISingleton.Instance.Hub.ClearCave();

            return GDOAPISingleton.Instance.Hub == null ? "hub Conected " : "hub not connected";
           
        }
    }
}