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

namespace GDO.Apps.TimeV
{
    public class TimeVApp : IAppInstance
    {
        public int Id { get; set; }
        public Section Section { get; set; }
        public AppConfiguration Configuration { get; set; }

        private MongoDataProvider db;

        protected MongoDataProvider Database()
        {
            if (this.db != null)
            {
                return this.db;
            }
            else
            {
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
        }

        public void MakeQuery(int nodeId, string query)
        {
            var document = new BsonDocument
            {
                { "NodeId", nodeId },
                { "InstanceId", this.Id },
                { "Section", this.Section.ToString() },
                { "Qurey", query },
                { "OriginalQuery", query },
                { "TimeStamp", DateTime.Now }
            };

            this.Database().Insert(document, "Query_Queue");
        }

        public void MakeQuery(int nodeId, Query query)
        {
            var document = new BsonDocument
            {
                { "NodeId", nodeId },
                { "InstanceId", this.Id },
                { "Section", this.Section.ToString() },
                { "Qurey", query.ToSQL() },
                { "OriginalQuery", query.ToString() },
                { "TimeStamp", DateTime.Now }
            };

            this.Database().Insert(document, "Query_Queue");
        }

        public List<BsonDocument> GetRunningQueries(FilterDefinition<BsonDocument> filter)
        {            
            if (filter == null)
            {
                filter = new BsonDocument();
            }

            var queries = this.Database().Fetch(filter, "Query_Queue");
            return queries.Result;
        }
    }
}