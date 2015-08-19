using GDO.Apps.TimeV.Domain;
using GDO.Core;
using Microsoft.AspNet.SignalR;
using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.Diagnostics;
using System.Threading;
using System.Threading.Tasks;

namespace GDO.Apps.TimeV
{
    [Export(typeof(IAppHub))]
    public class TimeVAppHub : Hub, IAppHub
    {
        public string Name { get; set; } = "TimeV";
        public int P2PMode { get; set; } = (int)Cave.P2PModes.Neighbours;
        public Type InstanceType { get; set; } = new TimeVApp().GetType();
        public void JoinGroup(int instanceId)
        {
            Groups.Add(Context.ConnectionId, "" + instanceId);
        }
        public void ExitGroup(int instanceId)
        {
            Groups.Remove(Context.ConnectionId, "" + instanceId);
        }

        public void RequestVisualisation(int instanceId, int nodeId, string query)
        {
            Debug.WriteLine("Visualisation request for " + nodeId);
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    string timeStamp = DateTime.Now.ToString();
                    TimeVApp app = ((TimeVApp)Cave.Apps["TimeV"].Instances[instanceId]);
                    app.MakeQuery(nodeId, timeStamp, query);
                    new Thread(() => ResultProcessor(instanceId, nodeId, timeStamp, app.Database())).Start();
                    //Clients.Group("" + instanceId).visualise(nodeId.ToString(), timeStamp, "dummy");
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void DisposeVisualisation(int instanceId, int nodeId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.All.dispose(nodeId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public BsonDocument GetResult(int instanceId, int nodeId, String timeStamp)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    return ((TimeVApp)Cave.Apps["TimeV"].Instances[instanceId]).GetResult(nodeId, timeStamp);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    return null;
                }
            }
        }

        private void ResultProcessor(int instanceId, int nodeId, String timeStamp, MongoDataProvider db)
        {
            var filter = Builders<BsonDocument>.Filter.Eq("value.NodeId", nodeId.ToString());
            while (true)
            {
                Debug.WriteLine("Polling result for " + nodeId);

                var records = db.Fetch(new BsonDocument(), "Query_Results").Result.ToArray();
                var results = db.Fetch(filter, "Query_Results").Result;
                if (results.Count != 0)
                {
                    Debug.WriteLine("Result available for " + nodeId);

                    foreach (BsonDocument doc in results)
                    {
                        Debug.WriteLine(doc.ToString());
                        var data = doc.GetValue("value").ToBsonDocument();
                        int id = data.GetValue("NodeId").ToInt32();
                        String stamp = data.GetValue("TimeStamp").ToString();
                        var result = data.GetValue("Result").ToJson();
                        lock (Cave.AppLocks[instanceId])
                        try
                        {
                            Clients.All.visualise(nodeId.ToString(), stamp, data);
                        }
                        catch (Exception e)
                        {
                            Console.WriteLine(e);
                        }
                        return;
                    }
                }
                Thread.Sleep(1000);
            }
        }
    }
}