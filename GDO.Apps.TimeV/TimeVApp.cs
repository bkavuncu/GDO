using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Web;
using GDO.Core;
using GDO.Utility;
using GDO.Apps.TimeV.Domain;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Threading.Tasks;
using Microsoft.AspNet.SignalR;
using System.Diagnostics;
using System.Collections;
using System.Threading;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace GDO.Apps.TimeV
{
    public class TimeVApp : IAppInstance
    {
        public int Id { get; set; }
        public Section Section { get; set; }
        public AppConfiguration Configuration { get; set; }

        private MongoDataProvider db;
        private IHubContext hubContext;
        private Hashtable qureyThreads;

        private bool IsEnabled = true;

        public MongoDataProvider Database()
        {
            if (this.db != null)
            {
                return this.db;
            }
            else
            {
                var t = Configuration.Json.Values<Object>().ToArray().ToString();          
                this.db = new MongoDataProvider("mongodb://146.169.46.95:27017", "GDO_Apps_TimeV");
                return this.db;
            }
        }

        public void init(int instanceId, Section section, AppConfiguration configuration)
        {
            this.Id = instanceId;
            this.Section = section;
            this.Configuration = configuration;
            this.db = new MongoDataProvider("mongodb://146.169.46.95:27017", "GDO_Apps_TimeV");
            this.qureyThreads = new Hashtable();
        }

        public void MakeQuery(int nodeId, string timeStamp, string query)
        {
            var document = new BsonDocument
            {
                { "NodeId", nodeId },
                { "InstanceId", this.Id },
                { "Section", this.Section.ToString() },
                { "Qurey", query },
                { "OriginalQuery", query },
                { "TimeStamp", timeStamp }
            };

            this.Database().Insert(document, "Query_Queue");
        }

        public void MakeQuery(int nodeId, string timeStamp, Query query)
        {
            var document = new BsonDocument
            {
                { "NodeId", nodeId },
                { "InstanceId", this.Id },
                { "Section", this.Section.ToString() },
                { "Qurey", query.ToSQL() },
                { "OriginalQuery", query.ToString() },
                { "TimeStamp", timeStamp }
            };

            this.Database().Insert(document, "Query_Queue");
        }

        public List<BsonDocument> GetRunningQueries(FilterDefinition<BsonDocument> filter)
        {            
            if (filter == null)
            {
                filter = new BsonDocument();
            }

            var queries = this.Database().Fetch(filter, "Running_Queries");
            var results = queries.Result.ToListAsync<BsonDocument>();
            return results.Result;
        }

        public BsonDocument GetResult(int nodeId, String timeStamp)
        {
            var builder = Builders<BsonDocument>.Filter;
            var filter = builder.Eq("NodeId", nodeId)
                       & builder.Eq("InstanceId", this.Id)
                       & builder.Eq("Section", this.Section.ToString())
                       & builder.Eq("TimeStamp", timeStamp);
            var result = this.Database().Fetch(filter, "Query_Results").Result.ToListAsync<BsonDocument>();
            return result.Result.FirstOrDefault();
        }        

        public void AddQueryThread(int nodeId, Thread thread)
        {
            this.qureyThreads.Add(nodeId, thread);
        }

        public void StopQueryThread(int nodeId)
        {
            Thread t = this.qureyThreads[nodeId] as Thread;
            if (t != null)
            {
                t.Interrupt();
                if (t.IsAlive)
                {
                    Debug.WriteLine("Forcibly abort query thread for " + nodeId);
                    t.Abort();
                }
                this.qureyThreads.Remove(nodeId);
            }            
        }

        public String ProcessResults(BsonDocument results)
        {
            BsonArray processed = new BsonArray();
            long size = results.Elements.ElementAt(0).Value.AsBsonArray.Count();
            for (long i = 0; i < size; i++)
            {
                BsonDocument dataPoint = new BsonDocument();
                foreach (BsonElement element in results.Elements)
                {
                    dataPoint.Add(element.Name, element.Value.AsBsonArray.ElementAt((int)i));
                }
                processed.Add(dataPoint);
            }
            return processed.ToJson();
        }
       
    }
}