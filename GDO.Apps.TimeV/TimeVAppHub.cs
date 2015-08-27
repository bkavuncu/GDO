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

        public void RequestVisualisation(int instanceId, int nodeId, string query, string mode, string x_accessor)
        {
            Debug.WriteLine("Visualisation request for " + nodeId);
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    string timeStamp = DateTime.Now.ToString();
                    TimeVApp app = ((TimeVApp)Cave.Apps["TimeV"].Instances[instanceId]);
                    app.StopQueryThread(nodeId);
                    Clients.All.prepareVisualisation(nodeId, timeStamp, mode, x_accessor);
                    app.MakeQuery(nodeId, timeStamp, query);                    
                    Thread queryThread = new Thread(() => ResultProcessor(instanceId, nodeId, timeStamp, app.Database()));
                    app.AddQueryThread(nodeId, queryThread);
                    queryThread.Start();                    
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
                    TimeVApp app = ((TimeVApp)Cave.Apps["TimeV"].Instances[instanceId]);
                    app.StopQueryThread(nodeId);
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
            var filterBuilder = Builders<BsonDocument>.Filter;
            var filter = filterBuilder.Eq("value.NodeId", nodeId.ToString()) & filterBuilder.Eq("value.TimeStamp", timeStamp);
            while (true)
            {
                try
                {
                    Debug.WriteLine("Polling result for " + nodeId);

                    var records = db.Fetch(new BsonDocument(), "Query_Results").Result.ToListAsync().Result.ToArray();
                    var results = db.Fetch(filter, "Query_Results").Result.ToListAsync().Result;

                    if (results.Count != 0)
                    {
                        Debug.WriteLine("Result available for " + nodeId);

                        foreach (BsonDocument doc in results)
                        {
                            Debug.WriteLine(doc.ToString());
                            var data = doc.GetValue("value").ToBsonDocument();
                            int id = data.GetValue("NodeId").ToInt32();
                            String stamp = data.GetValue("TimeStamp").ToString();
                            var rawResults = data.GetValue("Results").ToBsonDocument();
                            lock (Cave.AppLocks[instanceId])
                            try
                            {
                                    var processedResults = ((TimeVApp)Cave.Apps["TimeV"].Instances[instanceId]).ProcessResults(rawResults);
                                    Debug.Write("Results processed");
                                    Clients.All.visualise(nodeId.ToString(), stamp, processedResults);
                            }
                            catch (Exception e)
                            {
                                Debug.WriteLine(e);
                                db.DeleteOne(doc, "Query_Results");
                                return;
                            }

                            db.DeleteOne(doc, "Query_Results");
                            return;
                        }
                    }
                    Thread.Sleep(1000);
                }
                catch(ThreadInterruptedException)
                {
                    return;
                }
            }
        }
    }
}