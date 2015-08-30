using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Driver;

namespace GDO.Apps.TimeV.Domain
{
    public class MongoDataProvider
    {
        public MongoDataProvider(string connectionString, string databaseName)
        {
            var client = new MongoClient(connectionString);
            Database = client.GetDatabase(databaseName);
        }

        public IMongoDatabase Database { get; }

        public void Insert(BsonDocument document, string collectionName)
        {
            var collection = Database.GetCollection<BsonDocument>(collectionName);
            collection.InsertOneAsync(document);
        }

        public async Task<IAsyncCursor<BsonDocument>> Fetch(FilterDefinition<BsonDocument> filter, string collectionName)
        {
            var collection = Database.GetCollection<BsonDocument>(collectionName);
            var cursor = await collection.FindAsync(filter);
            return cursor;
        }

        public void DeleteOne(FilterDefinition<BsonDocument> filter, string collectionName)
        {
            var collection = Database.GetCollection<BsonDocument>(collectionName);
            collection.DeleteOneAsync(filter);
        }
    }
}