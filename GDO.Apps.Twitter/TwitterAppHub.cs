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
            Groups.Add(Context.ConnectionId, "" + groupId);
        }

        public void ExitGroup(string groupId)
        {
            Groups.Remove(Context.ConnectionId, "" + groupId);
        }

        public void GetFileLists(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.receiveFileLists(instanceId, ((TwitterApp)Cave.Apps["Twitter"].Instances[instanceId]).GetFileLists());
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(instanceId, e.GetType().ToString());
                }
            }
        }

        private void BroadcastState(int instanceId, int refresh = 0)
        {
            var ta = (TwitterApp) Cave.Apps["Twitter"].Instances[instanceId];
            Clients.Caller.receiveCaveStatus(instanceId, ta.GetPseudoCaveStatus(), refresh);
        }

        public void ToggleRedownloadFiles(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    bool toggle = ((TwitterApp)Cave.Apps["Twitter"].Instances[instanceId]).ReplaceExisting;
                    ((TwitterApp) Cave.Apps["Twitter"].Instances[instanceId]).ReplaceExisting = !toggle;
                    Debug.WriteLine("Set redownload files to: " + !toggle);
                    Clients.Caller.setMessage(instanceId, "Set redownload files to: " + !toggle);
                    Clients.Caller.setRedownloadButton(instanceId, !toggle);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(instanceId, e.GetType().ToString());
                }
            }
        }

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
                    };
                    
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(instanceId, e.GetType().ToString());
                }
            }
        }


        public bool GetApiStatus(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    var message  = ((TwitterApp) Cave.Apps["Twitter"].Instances[instanceId]).GetApiMessage();
                    var serialisedMessage = JsonConvert.SerializeObject(message);
                    Debug.WriteLine("Status message: " + message);
                    Clients.Group("" + instanceId).setAPIMessage(instanceId, serialisedMessage);
                    Clients.Caller.setAPIMessage(instanceId, serialisedMessage);
                    return message.Healthy;
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(instanceId, e.GetType().ToString());
                }
                return false;
            }
        }

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
                    Clients.Caller.setMessage(instanceId, e.GetType().ToString());
                }
            }
        }

        public void GetNewAnalytics(int instanceId, string serialisedRequests)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    ((TwitterApp)Cave.Apps["Twitter"].Instances[instanceId]).GetNewAnalytics(
                        JsonConvert.DeserializeObject<List<AnalyticsRequest>>(serialisedRequests));
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(instanceId, e.GetType().ToString());
                }
            }
            
        }
    

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
                    Clients.Caller.setMessage(instanceId, e.GetType().ToString());
                }
            }
        }

        public void ConfirmLaunch(int instanceId, List<int> sectionIds)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    string msg = "Confirming launch for sections: " + string.Join(",", sectionIds.ToArray());
                    Debug.WriteLine(msg);
                    ((TwitterApp)Cave.Apps["Twitter"].Instances[instanceId]).ConfirmLaunch(sectionIds);
                    Clients.Caller.setMessage(instanceId, msg);
                    BroadcastState(instanceId, 1);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(instanceId, e.GetType().ToString());
                }
            }
        }

        public void CreateSection(int instanceId, int colStart, int rowStart, int colEnd, int rowEnd)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    string msg = "Creating section: (" + colStart + "," + rowStart + "," + colEnd + "," + rowEnd + ")";
                    Debug.WriteLine(msg);                  
                    ((TwitterApp)Cave.Apps["Twitter"].Instances[instanceId]).CreateSection(colStart, rowStart, colEnd, rowEnd);
                    Clients.Caller.setMessage(instanceId, msg);
                    BroadcastState(instanceId, 1);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(instanceId, e.GetType().ToString());
                }
            }
        }

        public void AutoLaunchSections(int instanceId, string serialisedSections)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Debug.WriteLine("Multiple section creation " + serialisedSections);
                    List<SectionRequest> sectionRequests =
                        JsonConvert.DeserializeObject<List<SectionRequest>>(serialisedSections);
                    Clients.Caller.setMessage(instanceId, "Auto launching " + sectionRequests.Count + " sections");
                    ((TwitterApp)Cave.Apps["Twitter"].Instances[instanceId]).CreateSections(sectionRequests);
                    ((TwitterApp)Cave.Apps["Twitter"].Instances[instanceId]).QueueApps(JsonConvert.DeserializeObject<List<SectionRequest>>(serialisedSections));
                    Clients.Caller.setMessage(instanceId, serialisedSections);
                    BroadcastState(instanceId, 2);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(instanceId, e.GetType().ToString());
                }
            }
        }

        public void CreateSections(int instanceId, string serialisedSections)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Debug.WriteLine("Multiple section creation " + serialisedSections);
                    ((TwitterApp)Cave.Apps["Twitter"].Instances[instanceId]).CreateSections(JsonConvert.DeserializeObject<List<SectionRequest>>(serialisedSections));
                    Clients.Caller.setMessage(instanceId, serialisedSections);
                    BroadcastState(instanceId, 1);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(instanceId, e.GetType().ToString());
                }
            }
        }

        public void CloseSection(int instanceId, int sectionId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    string msg = "Closing section: (" + sectionId + ")";
                    Debug.WriteLine(msg);
                    Clients.Caller.setMessage(instanceId, msg);
                    ((TwitterApp)Cave.Apps["Twitter"].Instances[instanceId]).CloseSections(new List<int> { sectionId});
                    BroadcastState(instanceId, 1);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(instanceId, e.GetType().ToString());
                }
            }
        }

        public void LoadVisualisation(int instanceId, int sectionId, string analyticsId, string dataSetId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    string msg = "Loading visualisation (" + dataSetId + "," + analyticsId + ") from REST api";
                    Clients.Caller.setMessage(instanceId, msg);
                    Debug.WriteLine(msg);
                    ((TwitterApp)Cave.Apps["Twitter"].Instances[instanceId]).LoadVisualisation(sectionId, analyticsId, dataSetId);
                    Clients.Caller.setMessage(instanceId, "Loading visualisation for section (" + sectionId + ") from REST api");
                    BroadcastState(instanceId, 0);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(instanceId, e.GetType().ToString());
                }
            }
        }

        public void UnLoadVisualisation(int instanceId, int sectionId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    string msg = "Unloading visualisation at section: " + sectionId;
                    Debug.WriteLine(msg);
                    ((TwitterApp)Cave.Apps["Twitter"].Instances[instanceId]).UnLoadVisualisation(sectionId);
                    Clients.Caller.setMessage(instanceId, msg);
                    BroadcastState(instanceId, 0);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(instanceId, e.GetType().ToString());
                }
            }
        }
        
        public void ClearCave(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    string msg = "Clearing cave for instance: " + instanceId;
                    Debug.WriteLine(msg);
                    ((TwitterApp)Cave.Apps["Twitter"].Instances[instanceId]).ClearCave();
                    Clients.Caller.setMessage(instanceId, msg);
                    BroadcastState(instanceId, 1);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(instanceId, e.GetType().ToString());
                }
            }
        }
 
        public void DeployApps(int instanceId, List<int> sectionIds)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    string msg = "Deploying Apps at Sections: " + string.Join(",", sectionIds.ToArray());
                    Debug.WriteLine(msg);
                    ((TwitterApp)Cave.Apps["Twitter"].Instances[instanceId]).DeployApps(sectionIds);
                    Clients.Caller.setMessage(instanceId, msg);
                    BroadcastState(instanceId, 2);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(instanceId, e.GetType().ToString());
                }
            }
        }

        public void CloseApp(int instanceId, int sectionId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    string msg = "Closing app section: " + sectionId;
                    Debug.WriteLine(msg);
                    Clients.Caller.setMessage(instanceId, msg);
                    ((TwitterApp)Cave.Apps["Twitter"].Instances[instanceId]).CloseApps(new List<int> {sectionId});
                    BroadcastState(instanceId, 1);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(instanceId, e.GetType().ToString());
                }
            }
        }

        public void GetAnalytics(int instanceId, List<string> dataSetIds)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    var serialisedAnalytics = ((TwitterApp)Cave.Apps["Twitter"].Instances[instanceId]).GetAnalytics(dataSetIds);
                    Clients.Caller.setMessage(instanceId, "Retreived analytics for datasets: " + string.Join(",", dataSetIds.ToArray()));
                    Clients.Caller.updateAnalytics(instanceId, serialisedAnalytics);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(instanceId, e.GetType().ToString());
                }
            }
        }

        public void GetDataSets(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    string serialisedDataSets = ((TwitterApp)Cave.Apps["Twitter"].Instances[instanceId]).GetDataSets();
                    Clients.Caller.setMessage(instanceId, "Updated data set list");
                    Clients.Caller.updateDataSets(instanceId, serialisedDataSets);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(instanceId, e.GetType().ToString());
                }
            }
        }

        public void GetSlides(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    string serialisedSlides = ((TwitterApp)Cave.Apps["Twitter"].Instances[instanceId]).GetSlides();
                    Clients.Caller.setMessage(instanceId, "Updated slide list");
                    Clients.Caller.updateSlides(instanceId, serialisedSlides);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(instanceId, e.GetType().ToString());
                }
            }
        }
    }
}