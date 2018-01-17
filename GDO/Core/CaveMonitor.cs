using System;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading;
using log4net;

namespace GDO.Core {
    /*
     * goal is to reboot browsers that have crashed 
     * check this once per minute using the get cave status calls so that if no browsers are connected then we don't check
     * we check this IsConnectedToCaveServer property which also checks for disconn'd signalR 
     * if we find a dead one we trigger a reboot of the browsers on that machine (so need some de-dupe)
     */
    public sealed class MonitorSingleton {
        public static bool Enabled = false;

        private static readonly Lazy<MonitorSingleton> lazy =
            new Lazy<MonitorSingleton>(() => new MonitorSingleton());

        public static MonitorSingleton Instance { get { return lazy.Value; } }

        public SemaphoreSlim Semaphore = new SemaphoreSlim(1, 1);

        private MonitorSingleton() {
        }

        public DateTime LastupdateTime { get; set; } = DateTime.Now;

        public static bool MayProceed() {
            return DateTime.Now.Subtract(MonitorSingleton.Instance.LastupdateTime).TotalMinutes > 1.0;
        }
    }

    public static class CaveMonitor {
        private static ILog Log { get; set; } = LogManager.GetLogger(typeof(CaveMonitor));

        public static void ScanNodeHealth() {
            if (!MonitorSingleton.Enabled) return;

            if (MonitorSingleton.MayProceed()) {
                MonitorSingleton.Instance.LastupdateTime = DateTime.Now;
                if (MonitorSingleton.Instance.Semaphore.Wait(10)) {
                    Log.Info("CaveMonitor - testing state");

                    var deadnodes = Cave.Layout.Nodes.Where(n => !n.Value.IsConnectedToCaveServer).ToList();
                    var deadscreens = deadnodes.Select(n =>
                            ((n.Key > 16 && n.Key <= 32) || 
                             (n.Key > 32 && n.Key <= 64)) ? n.Key - 16 : n.Key)// select only lower screen
                        .Distinct()
                        .ToList();
                    var hostname = Dns.GetHostName().ToLower();
                    Log.Info("CaveMonitor - i found " + deadnodes.Count + " dead nodes");

                    if (hostname.Contains("prod")) {// prod/preprod only

                        if (deadscreens.Count < 10) {
                            // dont do anything if the gdo is off or in debug mode
                            Log.Info("CaveMonitor - about to reset browsers");
                            foreach (var screen in deadscreens) {
                                try {


                                    string url =
                                        "http://dsimanagement.doc.ic.ac.uk/api/WindowsNodes/ReLaunchBrowsers?server=" +
                                        (hostname.Contains("pre") ? "PreProd" : "Prod") + "&screens=" + screen;

                                    Log.Info("CaveMonitor - requesting reboot of  " + screen);
                                    var request = (HttpWebRequest) WebRequest.Create(url);

                                    var response = (HttpWebResponse) request.GetResponse();
                                    var responseString = new StreamReader(response.GetResponseStream()).ReadToEnd();

                                    Log.Info("CaveMonitor - requesting reboot of  " + screen + " responce " +
                                             responseString);
                                }
                                catch (Exception e) {
                                    Log.Info("CaveMonitor Error on relaunching screen " + screen + "error was " + e);
                                }
                            }
                        }
                        else {
                            Log.Info("CaveMonitor - too many dead browsers i am on strike");
                        }

                    }

                    MonitorSingleton.Instance.Semaphore.Release();
                }
                
            }
        }

       
    }
}