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
    }
}