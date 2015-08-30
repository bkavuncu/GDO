﻿using System.Collections;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading;
using GDO.Apps.TimeV.Domain;
using GDO.Core;
using MongoDB.Bson;
using MongoDB.Driver;

namespace GDO.Apps.TimeV
{
    public class TimeVApp : IAppInstance
    {
        private MongoDataProvider db;

        private bool IsEnabled = true;
        private Hashtable qureyThreads;
        public int Id { get; set; }
        public Section Section { get; set; }
        public AppConfiguration Configuration { get; set; }

        public void init(int instanceId, Section section, AppConfiguration configuration)
        {
            Id = instanceId;
            Section = section;
            Configuration = configuration;
            db = new MongoDataProvider("mongodb://146.169.46.95:27017", "GDO_Apps_TimeV");
            qureyThreads = new Hashtable();
        }

        public MongoDataProvider Database()
        {
            if (db != null)
            {
                return db;
            }
            var t = Configuration.Json.Values<object>().ToArray().ToString();
            db = new MongoDataProvider("mongodb://146.169.46.95:27017", "GDO_Apps_TimeV");
            return db;
        }

        public void MakeQuery(int nodeId, string timeStamp, string query)
        {
            var document = new BsonDocument
            {
                {"NodeId", nodeId},
                {"InstanceId", Id},
                {"Section", Section.ToString()},
                {"Qurey", query},
                {"OriginalQuery", query},
                {"TimeStamp", timeStamp}
            };

            Database().Insert(document, "Query_Queue");
        }

        public List<BsonDocument> GetRunningQueries(FilterDefinition<BsonDocument> filter)
        {
            if (filter == null)
            {
                filter = new BsonDocument();
            }

            var queries = Database().Fetch(filter, "Running_Queries");
            var results = queries.Result.ToListAsync();
            return results.Result;
        }

        public BsonDocument GetResult(int nodeId, string timeStamp)
        {
            var builder = Builders<BsonDocument>.Filter;
            var filter = builder.Eq("NodeId", nodeId)
                         & builder.Eq("InstanceId", Id)
                         & builder.Eq("Section", Section.ToString())
                         & builder.Eq("TimeStamp", timeStamp);
            var result = Database().Fetch(filter, "Query_Results").Result.ToListAsync();
            return result.Result.FirstOrDefault();
        }

        public void AddQueryThread(int nodeId, Thread thread)
        {
            qureyThreads.Add(nodeId, thread);
        }

        public void StopQueryThread(int nodeId)
        {
            var t = qureyThreads[nodeId] as Thread;
            if (t != null)
            {
                t.Interrupt();
                if (t.IsAlive)
                {
                    Debug.WriteLine("Forcibly abort query thread for " + nodeId);
                    t.Abort();
                }
                qureyThreads.Remove(nodeId);
            }
        }

        public string ProcessResults(BsonDocument results)
        {
            var processed = new BsonArray();
            long size = results.Elements.ElementAt(0).Value.AsBsonArray.Count();
            for (long i = 0; i < size; i++)
            {
                var dataPoint = new BsonDocument();
                foreach (var element in results.Elements)
                {
                    dataPoint.Add(element.Name, element.Value.AsBsonArray.ElementAt((int) i));
                }
                processed.Add(dataPoint);
            }
            return processed.ToJson();
        }
    }
}