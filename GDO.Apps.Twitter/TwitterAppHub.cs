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

        public void JoinGroup(int instanceId)
        {
            Groups.Add(Context.ConnectionId, "" + instanceId);
        }

        public void ExitGroup(int instanceId)
        {
            Groups.Remove(Context.ConnectionId, "" + instanceId);
        }

        private void BroadcastState(int instanceId, int refresh = 0)
        {
            var ta = (TwitterApp) Cave.Apps["Twitter"].Instances[instanceId];
            Clients.Caller.receiveCaveStatus(instanceId, ta.GetPseudoCaveStatus(), refresh);
        }

        public void GetApiStatus(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    string message =
                        ((TwitterApp) Cave.Apps["Twitter"].Instances[instanceId]).GetApiMessage();
                    Debug.WriteLine("Status message: " + message);
                    Clients.Caller.setAPIMessage(instanceId, message);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(instanceId, e.GetType().ToString());
                }
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
                        JsonConvert.DeserializeObject<List<NewAnalyticsRequest>>(serialisedRequests));
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
                    Debug.WriteLine(msg);
                    ((TwitterApp)Cave.Apps["Twitter"].Instances[instanceId]).LoadVisualisation(sectionId, analyticsId, dataSetId);
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
    }
}