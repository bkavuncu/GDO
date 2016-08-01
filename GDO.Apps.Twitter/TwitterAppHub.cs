using System;
using System.ComponentModel.Composition;
using System.Diagnostics;
using System.Linq.Expressions;
using System.Runtime.Remoting.Contexts;
using GDO.Apps.StaticHTML;
using GDO.Core;
using GDO.Core.Apps;
using Microsoft.AspNet.SignalR;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

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

        public void SetName(int instanceId, string name)
        {
            Debug.WriteLine("Setting name");
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    ((TwitterApp) Cave.Apps["Twitter"].Instances[instanceId]).SetName(name);
                    Clients.Group("" + instanceId).receiveName(instanceId, name);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }

        }


        public void GetDataSets(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    DataSetMeta[] dataSetMetas = ((TwitterApp) Cave.Apps["Twitter"].Instances[instanceId]).GetDataSetMetas();
                    Clients.Caller.updateDataSetList(JsonConvert.SerializeObject(dataSetMetas));
                    Clients.Caller.setMessage("Updated data set list");
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }

        public void GetDataSetAnalytics(int instanceId, string datasetId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    AnalyticsMeta[] analyticsMetas =
                        ((TwitterApp) Cave.Apps["Twitter"].Instances[instanceId]).GetAnalyticsMetas(datasetId);
                    Clients.Caller.updateAnalyticsList(datasetId, JsonConvert.SerializeObject(analyticsMetas));
                    Clients.Caller.setMessage("Retreived analytics for dataset: " + datasetId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }

        public void Launch(int instanceId)
        {

            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    SubSection subSection = ((TwitterApp) Cave.Apps["Twitter"].Instances[instanceId]).Launch();
                    Clients.Caller.createSubSection(subSection.ColStart,subSection.RowStart, subSection.ColEnd, subSection.RowEnd);
                    Clients.Caller.setMessage("Server calling section " + subSection);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
            //int section = 2
//                Clients.Caller.createSubSection(0, 0, 1, 1);
//                DeployApp(section, "StaticHTML", "Default");
//                Clients.Caller.launchStaticHTML(1, "http://wwww.bing.com");
// 
        }

        public void DeployApp(int sectionID, String appName, String config)
        {
            Clients.Caller.deployApp(sectionID, appName, config);
        }

        public void CreateSubSection(int colStart, int rowStart, int colEnd, int rowEnd)
        {
            Debug.WriteLine("Creating subsection");
            Clients.Caller.createSubSection(colStart, rowStart, colEnd, rowEnd);
        }


        public void RequestName(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.receiveName(instanceId, ((TwitterApp)Cave.Apps["Twitter"].Instances[instanceId]).GetName());
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }
    }
}