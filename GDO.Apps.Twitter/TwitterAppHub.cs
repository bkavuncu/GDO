using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.Diagnostics;
using GDO.Apps.Twitter.Core;
using GDO.Core;
using GDO.Core.Apps;
using Microsoft.AspNet.SignalR;
using Newtonsoft.Json;

namespace GDO.Apps.Twitter
{
    [Export(typeof(IAppHub))]
    public class TwitterAppHub : Hub, IBaseAppHub
    {
        public string Name { get; set; } = "Twitter";
        public int P2PMode { get; set; } = (int) Cave.P2PModes.None;
        public Type InstanceType { get; set; } = new TwitterApp().GetType();

        public void JoinGroup(string groupId)
        {
            Cave.Apps[Name].Hub.Clients = Clients;
            Groups.Add(Context.ConnectionId, "" + groupId);
        }

        public void ExitGroup(string groupId)
        {
            Groups.Remove(Context.ConnectionId, "" + groupId);
        }

        /* Get a list of all files currently stored in the data folders:
         * Web/Graphs/graphmls
         * Web/Images/images
         * Web/Twitter/data
         * Web/FusionChart/data */
        public void GetFileLists(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.receiveFileLists(instanceId,
                        ((TwitterApp) Cave.Apps["Twitter"].Instances[instanceId]).GetFileLists());
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(instanceId, e.GetType().ToString(), true);
                }
            }
        }

        /* Get the latest Cave State */
        private void BroadcastState(int instanceId, int refresh = 0)
        {
            var ta = (TwitterApp) Cave.Apps["Twitter"].Instances[instanceId];
            Clients.Caller.receiveCaveStatus(instanceId, ta.GetPseudoCaveStatus(), refresh);
        }

        /* Set files to redownload rather than using existing file.
         * Cache of files is cleared on application startup */
        public void ToggleRedownloadFiles(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    bool toggle = ((TwitterApp) Cave.Apps["Twitter"].Instances[instanceId]).ReplaceExisting;
                    ((TwitterApp) Cave.Apps["Twitter"].Instances[instanceId]).ReplaceExisting = !toggle;
                    Debug.WriteLine("Set redownload files to: " + !toggle);
                    Clients.Caller.setMessage(instanceId, "Set redownload files to: " + !toggle, false);
                    Clients.Caller.setRedownloadButton(instanceId, !toggle);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(instanceId, e.GetType().ToString(), true);
                }
            }
        }

        /* Connect to the back-end API, get data set and slide list and broadcast status*/
        public void InitApiConnection(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    if (GetApiStatus(instanceId))
                    {
                        GetDataSets(instanceId);
                        GetSlides(instanceId);
                    }
                    ;
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(instanceId, e.GetType().ToString(), true);
                }
            }
        }

        /* Query root of back-end API */
        public bool GetApiStatus(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    var message = ((TwitterApp) Cave.Apps["Twitter"].Instances[instanceId]).GetApiMessage();
                    var serialisedMessage = JsonConvert.SerializeObject(message);
                    Debug.WriteLine("Status message: " + message);
                    Clients.Group("" + instanceId).setAPIMessage(instanceId, serialisedMessage);
                    Clients.Caller.setAPIMessage(instanceId, serialisedMessage);
                    return message.Healthy;
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(instanceId, e.GetType().ToString(), true);
                }
                return false;
            }
        }

        /* Get list of analytics options*/
        public void GetAnalyticsOptions(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    string serialisedOptions =
                        ((TwitterApp) Cave.Apps["Twitter"].Instances[instanceId]).GetAnalyticsOptions();
                    Debug.WriteLine("Status message: " + serialisedOptions);
                    Clients.Caller.updateAnalyticsOptions(instanceId, serialisedOptions);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(instanceId, e.GetType().ToString(), true);
                }
            }
        }

        /* Request new analytics from back-end*/
        public void GetNewAnalytics(int instanceId, string serialisedRequests)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    ((TwitterApp) Cave.Apps["Twitter"].Instances[instanceId]).GetNewAnalytics(
                        JsonConvert.DeserializeObject<List<AnalyticsRequest>>(serialisedRequests));
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(instanceId, e.GetType().ToString(), true);
                }
            }
        }

        /* Get the latest cave status */
        public void GetPseudoCaveStatus(int instanceId, int refreshN = 0)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    BroadcastState(instanceId, refreshN);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(instanceId, e.GetType().ToString(), true);
                }
            }
        }

        /* Confirm that the launch commands have been called by the client code*/
        public void ConfirmLaunch(int instanceId, List<int> sectionIds)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    string msg = "Confirming launch for sections: " + string.Join(",", sectionIds.ToArray());
                    Debug.WriteLine(msg);
                    ((TwitterApp) Cave.Apps["Twitter"].Instances[instanceId]).ConfirmLaunch(sectionIds);
                    Clients.Caller.setMessage(instanceId, msg, false);
                    BroadcastState(instanceId, 1);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(instanceId, e.GetType().ToString(), true);
                }
            }
        }

        /* Request a new section */
        public void CreateSection(int instanceId, int colStart, int rowStart, int colEnd, int rowEnd)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    string msg = "Creating section: (" + colStart + "," + rowStart + "," + colEnd + "," + rowEnd + ")";
                    Debug.WriteLine(msg);
                    ((TwitterApp) Cave.Apps["Twitter"].Instances[instanceId]).CreateSection(colStart, rowStart, colEnd,
                        rowEnd);
                    Clients.Caller.setMessage(instanceId, msg, false);
                    BroadcastState(instanceId, 1);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(instanceId, e.GetType().ToString(), true);
                }
            }
        }

        /* Request new visualisations to auto launch, i.e create sections, download visualisation and deploy apps */
        public void AutoLaunchSections(int instanceId, string serialisedSections)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Debug.WriteLine("Multiple section creation " + serialisedSections);
                    List<SectionRequest> sectionRequests =
                        JsonConvert.DeserializeObject<List<SectionRequest>>(serialisedSections);
                    Clients.Caller.setMessage(instanceId, "Auto launching " + sectionRequests.Count + " sections", false);
                    ((TwitterApp) Cave.Apps["Twitter"].Instances[instanceId]).CreateSections(sectionRequests);
                    ((TwitterApp) Cave.Apps["Twitter"].Instances[instanceId]).QueueApps(
                        JsonConvert.DeserializeObject<List<SectionRequest>>(serialisedSections));
                    Clients.Caller.setMessage(instanceId, serialisedSections, false);
                    BroadcastState(instanceId, 2);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(instanceId, e.GetType().ToString(), true);
                }
            }
        }

        /* Create multiple sections */
        public void CreateSections(int instanceId, string serialisedSections)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Debug.WriteLine("Multiple section creation " + serialisedSections);
                    ((TwitterApp) Cave.Apps["Twitter"].Instances[instanceId]).CreateSections(
                        JsonConvert.DeserializeObject<List<SectionRequest>>(serialisedSections));
                    Clients.Caller.setMessage(instanceId, serialisedSections, false);
                    BroadcastState(instanceId, 1);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(instanceId, e.GetType().ToString(), true);
                }
            }
        }

        /* Close a single section */
        public void CloseSection(int instanceId, int sectionId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    string msg = "Closing section: (" + sectionId + ")";
                    Debug.WriteLine(msg);
                    Clients.Caller.setMessage(instanceId, msg, false);
                    ((TwitterApp) Cave.Apps["Twitter"].Instances[instanceId]).CloseSections(new List<int> {sectionId});
                    BroadcastState(instanceId, 1);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(instanceId, e.GetType().ToString(), true);
                }
            }
        }

        /* Download a visualisation and load the file path on a section*/
        public void LoadVisualisation(int instanceId, int sectionId, string analyticsId, string dataSetId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    string msg = "Loading visualisation (" + dataSetId + "," + analyticsId + ") from REST api";
                    Clients.Caller.setMessage(instanceId, msg, false);
                    Debug.WriteLine(msg);
                    ((TwitterApp) Cave.Apps["Twitter"].Instances[instanceId]).LoadVisualisation(sectionId, analyticsId,
                        dataSetId);
                    Clients.Caller.setMessage(instanceId,
                        "Loading visualisation for section (" + sectionId + ") from REST api", false);
                    BroadcastState(instanceId, 0);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(instanceId, e.GetType().ToString(), true);
                }
            }
        }

        /* Remove file path from a section */
        public void UnLoadVisualisation(int instanceId, int sectionId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    string msg = "Unloading visualisation at section: " + sectionId;
                    Debug.WriteLine(msg);
                    ((TwitterApp) Cave.Apps["Twitter"].Instances[instanceId]).UnLoadVisualisation(sectionId);
                    Clients.Caller.setMessage(instanceId, msg, false);
                    BroadcastState(instanceId, 0);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(instanceId, e.GetType().ToString(), true);
                }
            }
        }


        /* Clear the cave (only sections which have been created by the app instance) */
        public void ClearCave(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    string msg = "Clearing cave for instance: " + instanceId;
                    Debug.WriteLine(msg);
                    ((TwitterApp) Cave.Apps["Twitter"].Instances[instanceId]).ClearCave();
                    Clients.Caller.setMessage(instanceId, msg, false);
                    BroadcastState(instanceId, 1);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(instanceId, e.GetType().ToString(), true);
                }
            }
        }

        /* Deploy multiple apps */
        public void DeployApps(int instanceId, List<int> sectionIds)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    string msg = "Deploying Apps at Sections: " + string.Join(",", sectionIds.ToArray());
                    Debug.WriteLine(msg);
                    ((TwitterApp) Cave.Apps["Twitter"].Instances[instanceId]).DeployApps(sectionIds);
                    Clients.Caller.setMessage(instanceId, msg, false);
                    BroadcastState(instanceId, 2);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(instanceId, e.GetType().ToString(), true);
                }
            }
        }

        /* Close a single app */
        public void CloseApp(int instanceId, int sectionId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    string msg = "Closing app section: " + sectionId;
                    Debug.WriteLine(msg);
                    Clients.Caller.setMessage(instanceId, msg, false);
                    ((TwitterApp) Cave.Apps["Twitter"].Instances[instanceId]).CloseApps(new List<int> {sectionId});
                    BroadcastState(instanceId, 1);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(instanceId, e.GetType().ToString(), true);
                }
            }
        }

        /* Get analytics lists for a list of data sets */
        public void GetAnalytics(int instanceId, List<string> dataSetIds)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    var serialisedAnalytics =
                        ((TwitterApp) Cave.Apps["Twitter"].Instances[instanceId]).GetAnalytics(dataSetIds);
                    Clients.Caller.setMessage(instanceId,
                        "Retreived analytics for datasets: " + string.Join(",", dataSetIds.ToArray()), false);
                    Clients.Caller.updateAnalytics(instanceId, serialisedAnalytics);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(instanceId, e.GetType().ToString(), true);
                }
            }
        }

        /* Get a list of data sets */
        public void GetDataSets(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    string serialisedDataSets = ((TwitterApp) Cave.Apps["Twitter"].Instances[instanceId]).GetDataSets();
                    Clients.Caller.updateDataSets(instanceId, serialisedDataSets);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(instanceId, e.GetType().ToString(), true);
                }
            }
        }

        /* Get a list of slides */
        public void GetSlides(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    string serialisedSlides = ((TwitterApp) Cave.Apps["Twitter"].Instances[instanceId]).GetSlides();
                    Clients.Caller.setMessage(instanceId, "Updated slide list", false);
                    Clients.Caller.updateSlides(instanceId, serialisedSlides);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(instanceId, e.GetType().ToString(), true);
                }
            }
        }
    }
}