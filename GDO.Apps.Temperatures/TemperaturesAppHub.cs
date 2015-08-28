using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.Linq;
using GDO.Core;
using Microsoft.AspNet.SignalR;
using Newtonsoft.Json;

//[assembly: System.Web.UI.WebResource("GDO.Apps.Temperatures.Scripts.Temperatures.js", "application/x-javascript")]
//[assembly: System.Web.UI.WebResource("GDO.Apps.Temperatures.Configurations.sample.js", "application/json")]

namespace GDO.Apps.Temperatures {
    [Export(typeof(IAppHub))]
    public class temperaturesAppHub : Hub, IAppHub {
        public string Name { get; set; } = "Temperatures";
        public int P2PMode { get; set; } = (int)Cave.P2PModes.None;
        public Type InstanceType { get; set; } = new TemperaturesApp().GetType();
        public void JoinGroup(int instanceId) {
            Groups.Add(Context.ConnectionId, "" + instanceId);
        }
        public void ExitGroup(int instanceId) {
            Groups.Remove(Context.ConnectionId, "" + instanceId);
        }

        // Clients.Caller.updateVideo(yf.CurrentVideoUrls[rows, cols]);
        // Clients.Caller.setMessage("Got video urls Success!");

        public void RefreshTemps(string url) {

        }

        /// <summary>
        /// Refreshes all temps.
        /// Called from the control panel 
        /// calls the clients and asks them to refresh their url link
        /// </summary>
        /// <param name="instanceId">The instance identifier.</param>
        public void refreshAllTemps(int instanceId) {
            lock (Cave.AppLocks[instanceId]) {
                try {

                    Clients.Caller.setMessage("Refreshing Temps");

                    // TemperaturesApp yf = ((TemperaturesApp)Cave.Apps["Temperatures"].Instances[instanceId]);

                    Clients.Group("" + instanceId).refresh();

                    Clients.Caller.setMessage("Sent clients the update message!");
                } catch (Exception e) {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }

        /// <summary>
        /// Requests the new URL.
        /// </summary>
        public void requestNewUrl(int instanceId, int col, int row, int clientId) {
            // // call back to the server to request our new poll url
            //    gdo.net.app["Temperatures"].server.requestNewUrl(gdo.net.node[gdo.clientId].appInstanceId,
            //                                                gdo.net.node[gdo.clientId].sectionCol,
            //                                              gdo.net.node[gdo.clientId].sectionRow,
            //                                            gdo.clientId);
            lock (Cave.AppLocks[instanceId]) {
                try {

                    Clients.Caller.setMessage("clientID "+clientId+"is asking for a new url");
                    var baseurl =
                        "http://wikisensing.org/WikiSensingServiceAPI/DCEWilliamPenneyGDOZ5RZRs3ibUqI9G1KAyoJw/Node_";

                    Dictionary<int, string> urls =
                        Enumerable.Range(1, 16).ToDictionary(n => n, n => baseurl + (100 + n));
                    foreach (var n in Enumerable.Range(33, 16)) {
                        urls.Add(n, baseurl + (n + 84));
                    }

                    var suffix = "/1/0";

                    if (urls.ContainsKey(clientId)) {
                        Clients.Caller.receiveDataUpdate(urls[clientId] + suffix, "temperature");
                    }
                    else {
                      //  Clients.Caller.receiveDataUpdate("nothing for you " + clientId,"temperature");
                    }
                    
                }
                catch (Exception e) {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }

        }

    }
}