﻿using System;
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

        // The recovery mechanism would not kick-in until 5 minutes after reboot.
        public DateTime LastupdateTime { get; set; } = DateTime.Now.AddMinutes(5);

        public static bool MayProceed() {
            return DateTime.Now.Subtract(MonitorSingleton.Instance.LastupdateTime).TotalSeconds > 10.0;
        }
    }

    public static class CaveMonitor {
        private static ILog Log { get; set; } = LogManager.GetLogger(typeof(CaveMonitor));

        public static void ScanNodeHealth() {
            if (MonitorSingleton.MayProceed()) {
                if (MonitorSingleton.Instance.Semaphore.Wait(10)) {
                    MonitorSingleton.Instance.LastupdateTime = DateTime.Now;

                    // Too many comments == lots of disk space, please uncomment only to Debug.
                    //Log.Info("CaveMonitor - testing state");

                    var hostname = Dns.GetHostName().ToLower();

                    if (hostname.Contains("prod")) {// prod/preprod only
                        var deadnodes = Cave.Layout.Nodes.Where(n => !n.Value.IsConnectedToCaveServer).ToList();
                        var deadscreens = deadnodes.Select(n =>
                                ((n.Key > 16 && n.Key <= 32) ||
                                 (n.Key > 48 && n.Key <= 64)) ? n.Key - 16 : n.Key)// select only lower screen
                            .Distinct()
                            .ToList();
                        if (deadscreens.Count > 0 && deadscreens.Count < 10) {
                            Log.Info("CaveMonitor - i found " + deadscreens.Count + " dead screens");
                            if (!MonitorSingleton.Enabled) {
                                // If this flag was not set, try again in 3 minutes. 
                                // If it was set and still there are node failures,
                                // it is not a start-up sequence.
                                MonitorSingleton.Instance.LastupdateTime = DateTime.Now.AddMinutes(3);
                                MonitorSingleton.Enabled = true;
                            } else {
                                MonitorSingleton.Instance.LastupdateTime = DateTime.Now.AddMinutes(5);

                                // dont do anything if the gdo is off or in debug mode
                                Log.Info("CaveMonitor - about to reset browsers");
                                foreach (var screen in deadscreens) {
                                    try {


                                        string url =
                                            "http://dsimanagement.dsi.ic.ac.uk/api/WindowsNodes/ReLaunchBrowsers?server=" +
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
                                MonitorSingleton.Enabled = false;
                            }
                        }

                        // Too many comments == lots of disk space, please uncomment only to Debug.
                        //else if (deadscreens.Count >= 10) {
                        //    Log.Info("CaveMonitor - too many dead browsers i am on strike");
                        //}

                    }

                    MonitorSingleton.Instance.Semaphore.Release();
                }
                
            }
        }

       
    }
}
