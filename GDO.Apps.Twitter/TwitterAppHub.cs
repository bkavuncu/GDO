using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.Diagnostics;
using GDO.Core;
using GDO.Core.Apps;
using Microsoft.AspNet.SignalR;

namespace GDO.Apps.Twitter
{
    [Export(typeof(IAppHub))]
    public class TwitterAppHub : Hub, IBaseAppHub
    {
        public string Name { get; set; } = "Twitter";
        public int P2PMode { get; set; } = (int)Cave.P2PModes.None;
        public Type InstanceType { get; set; } = new TwitterApp().GetType();
        
        public void JoinGroup(int instanceId)
        {
            Groups.Add(Context.ConnectionId, "" + instanceId);
        }

        public void ExitGroup(int instanceId)
        {
            Groups.Remove(Context.ConnectionId, "" + instanceId);
        }

        private void BroadcastState(int instanceId)
        {
            var ta = (TwitterApp)Cave.Apps["Twitter"].Instances[instanceId];
            Clients.Caller.receiveCaveStatus(instanceId, ta.GetPseudoCaveStatus());
        }

        public void GetApiStatus(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    var ta = (TwitterApp)Cave.Apps["Twitter"].Instances[instanceId];
                    string message = ta.RestController.GetApiMessage();
                    //                    Clients.Caller.receiveApiStatusMessage(message);
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

        public void GetPseudoCaveStatus(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    BroadcastState(instanceId);
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
                    var ta = (TwitterApp)Cave.Apps["Twitter"].Instances[instanceId];
                    string msg = "Creating section: (" + colStart + "," + rowStart + "," + colEnd + "," + rowEnd + ")";
                    Debug.WriteLine(msg);
                    Clients.Caller.setMessage(instanceId, msg);
                    Clients.Caller.createSection(instanceId, ta.CreateSection(colStart, rowStart, colEnd, rowEnd));
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
                    var ta = (TwitterApp)Cave.Apps["Twitter"].Instances[instanceId];
                    string msg = "Closing section: (" + sectionId + ")";
                    Debug.WriteLine(msg);
                    Clients.Caller.setMessage(instanceId, msg);
                    Clients.Caller.closeSection(instanceId, ta.RemoveSection(sectionId));
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
                    var ta = (TwitterApp)Cave.Apps["Twitter"].Instances[instanceId];
                    string msg = "Loading visualisation (" + dataSetId + "," + analyticsId + ") from REST api";
                    Debug.WriteLine(msg);
                    ta.LoadVisualisation(sectionId, analyticsId, dataSetId);
                    Clients.Caller.setMessage(instanceId, msg);
                    BroadcastState(instanceId);
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
                    var ta = (TwitterApp)Cave.Apps["Twitter"].Instances[instanceId];
                    string msg = "Unloading visualisation at section: " + sectionId;
                    Debug.WriteLine(msg);
                    ta.UnLoadVisualisation(sectionId);
                    Clients.Caller.setMessage(instanceId, msg);
                    BroadcastState(instanceId);
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
                    Clients.Caller.updateAnalytics(instanceId, serialisedAnalytics);
                    Clients.Caller.setMessage(instanceId, "Retreived analytics for datasets: " + string.Join(",", dataSetIds.ToArray()));
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
                    Clients.Caller.updateDataSets(instanceId, serialisedDataSets);
                    Clients.Caller.setMessage(instanceId, "Updated data set list");
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
                    TwitterApp ta = (TwitterApp)Cave.Apps["Twitter"].Instances[instanceId];
                    string msg = "Clearing cave for instance: " + instanceId;
                    List<int> sectionIds;
                    List<int> appInstaceIds;
                    Debug.WriteLine(msg);
                    ta.ClearCave(out sectionIds, out appInstaceIds);
                    Debug.WriteLine(sectionIds);
                    Debug.WriteLine(appInstaceIds);
                    Clients.Caller.setMessage(instanceId, msg);
                    Clients.Caller.clearCave(instanceId, sectionIds, appInstaceIds);
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
                    var serialisedSections = ((TwitterApp)Cave.Apps["Twitter"].Instances[instanceId]).DeployApps(sectionIds);
                    Clients.Caller.setMessage(instanceId, msg);
                    Clients.Caller.deployApps(instanceId, serialisedSections);
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
                    Clients.Caller.closeApp(instanceId, ((TwitterApp)Cave.Apps["Twitter"].Instances[instanceId]).CloseApp(sectionId));
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