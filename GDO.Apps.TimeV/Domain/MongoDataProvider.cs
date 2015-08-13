using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Threading.Tasks;

namespace GDO.Apps.TimeV.Domain
{
    public class MongoDataProvider
    {
        public IMongoDatabase Database { get; }       

        public MongoDataProvider(String connectionString, String databaseName)
        {
            MongoClient client = new MongoClient(connectionString);
            this.Database = client.GetDatabase(databaseName);
        }

        public async void Insert(BsonDocument document, String collectionName)
        {
            var collection = this.Database.GetCollection<BsonDocument>(collectionName);
            await collection.InsertOneAsync(document);
        }
        
        public async Task<List<BsonDocument>> Fetch(FilterDefinition<BsonDocument> filter, String collectionName)
        {
            var collection = this.Database.GetCollection<BsonDocument>(collectionName);
            var cursor = await collection.FindAsync(filter);
            var results = await cursor.ToListAsync<BsonDocument>();
            return results;
        }
    }
}