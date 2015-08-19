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

namespace GDO.Apps.TimeV
{
    public class TimeVApp : IAppInstance
    {
        public int Id { get; set; }
        public Section Section { get; set; }
        public AppConfiguration Configuration { get; set; }

        private MongoDataProvider db;
        private IHubContext hubContext;

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
                this.db = new MongoDataProvider("mongodb://192.168.56.101:27017", "GDO_Apps_TimeV");
                return this.db;
            }
        }

        public void init(int instanceId, Section section, AppConfiguration configuration)
        {
            this.Id = instanceId;
            this.Section = section;
            this.Configuration = configuration;
            this.db = new MongoDataProvider("mongodb://192.168.56.101:27017", "GDO_Apps_TimeV");
            //this.hubContext = GlobalHost.ConnectionManager.GetHubContext<TimeVAppHub>();
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
            return queries.Result;
        }

        public BsonDocument GetResult(int nodeId, String timeStamp)
        {
            var builder = Builders<BsonDocument>.Filter;
            var filter = builder.Eq("NodeId", nodeId)
                       & builder.Eq("InstanceId", this.Id)
                       & builder.Eq("Section", this.Section.ToString())
                       & builder.Eq("TimeStamp", timeStamp);
            var result = this.Database().Fetch(filter, "Query_Results");
            return result.Result.FirstOrDefault();
        }        

        public void ResultProcessor()
        {            
            while (IsEnabled)
            {
                var results = this.Database().Fetch(new BsonDocument(), "Query_Results").Result;
                if (results.Count() != 0)
                {
                    foreach (BsonDocument doc in results)
                    {
                        Debug.WriteLine(doc.ToString());
                        var data = doc.GetValue("value").ToBsonDocument();
                        int nodeId = data.GetValue("NodeId").ToInt32();
                        String timeStamp = data.GetValue("TimeStamp").ToString();
                        var result = data.GetValue("Result").ToJson();
                        Debug.WriteLine(result.ToString());
                    }
                }
            }
        }
    }
}