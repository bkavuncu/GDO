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

        public void Insert(BsonDocument document, String collectionName)
        {
            var collection = this.Database.GetCollection<BsonDocument>(collectionName);
            collection.InsertOneAsync(document);
        }
        
        public async Task<IAsyncCursor<BsonDocument>> Fetch(FilterDefinition<BsonDocument> filter, String collectionName)
        {
            var collection = this.Database.GetCollection<BsonDocument>(collectionName);
            var cursor = await collection.FindAsync(filter);
            return cursor;
        }

        public void DeleteOne(FilterDefinition<BsonDocument> filter, String collectionName)
        {
            var collection = this.Database.GetCollection<BsonDocument>(collectionName);
            collection.DeleteOneAsync(filter);            
        }
    }
}