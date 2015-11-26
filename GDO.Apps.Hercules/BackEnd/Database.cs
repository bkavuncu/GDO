using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GDO.Apps.Hercules.BackEnd
{
    //
    public class Database
    {

        // A description of the last error that occurred from calling methods in this class.
        private static string LastError = "";

        // Returns the last error that occurred from the methods in ServerDS.
        public static string GetError() { return LastError; }

        //
        private static IMongoClient MongoClient;

        //
        private static IMongoDatabase MongoDB;

        //
        private static IMongoCollection<BsonDocument> MongoCollection;


        // Initialization of Database.
        // Sets up DB connection to MongoDB to database 'datasets'.
        // If everything wenk OK, returns true.
        // Otherwise LastError is saved and this returns false.
        // If Init is called multiple times, make sure that things don't break.
        public static bool Init()
        {
            MongoClient = new MongoClient();
            MongoDB = MongoClient.GetDatabase("datasets");
            MongoCollection = MongoDB.GetCollection<BsonDocument>("jsdatasets");
            return true;
        }

        // Each JsDataset contains the data (rows) and the JsMiniset (schema).
        // Each JsMiniset has a unique (id) field. We retrieved JsMinisets through this field.
        // Given the ID of a JsMiniset, we need to retrieve it from the MongolDB database. (Good Luck).
        // Once we obtain it, we need to De?serialize it into a JSON string. Maybe MongolBD can do that 
        // for us, or we'll need to use Newtonsoft.JSON.
        // If something goes wrong, return the NULL string and save the error.
        public static string GetMiniset(string id)
        {
            try {
                var filter = Builders<BsonDocument>.Filter.Eq("_id", id.ToString());
                var project = Builders<BsonDocument>.Projection.Exclude("_id")
                    .Exclude("schema")
                    .Include("rows");
                BsonDocument miniset = MongoCollection.Find(filter).Project(project).ToBsonDocument();
                return miniset.ToJson<BsonDocument>();
            } catch (Exception ouch) {
                LastError = string.Format("Database.GetMiniset({0}): database error ({1})", id, ouch.Message);
                return null;
            }
        }

        // Returns an array containing the JSON strings of ALL the minisets.
        // If something goes wrong, return the NULL array and save the error.
        public static string[] GetMinisets()
        {
            try {
                var project = Builders<BsonDocument>.Projection.Exclude("_id")
                    .Exclude("schema")
                    .Include("rows");
                var minisets = MongoCollection.Find(_ => true).Project(project).ToListAsync();
                minisets.Wait();
                return minisets.Result.Select(x => x.ToJson<BsonDocument>()).ToArray();
            } catch (Exception ouch) {
                LastError = string.Format("Database.GetMinisets: database error ({0})", ouch.Message);
                return null;
            }
        }

        // Each JsDataset contains the data (rows) and the JsMiniset (schema).
        // Each JsMiniset has a unique (id) field. We retrieved JsMinisets through this field.
        // Given the ID of a JsMiniset, we need to retrieve it from the MongolDB database. (Good Luck).
        // But we store the whole JsDatasets so this includes the rows.
        // Once we obtain it, we need to De?serialize it into a JSON string. Maybe MongolBD can do that 
        // for us, or we'll need to use Newtonsoft.JSON.
        // If something goes wrong, return the NULL string and save the error.
        public static string GetDataset(string id)
        {
            try {
                var filter = Builders<BsonDocument>.Filter.Eq("schema.id", id.ToString());
                var project = Builders<BsonDocument>.Projection.Exclude("_id")
                    .Include("schema")
                    .Include("rows");
                BsonDocument dataset = MongoCollection.Find(filter).Project(project).ToBsonDocument();
                return dataset.ToJson<BsonDocument>();
            } catch (Exception ouch) {
                LastError = string.Format("Database.GetDataset({0}): database error ({1})", id, ouch.Message);
                return null;
            }
        }


        // 
        public static string UploadDSFromRich(RichDS rich, string origin, string name, string description)
        {
            if (rich == null) {
                LastError = "Database.UploadDSFromRich: the RichDS provided is null!";
                return null;
            }

            try {
                // Name
                if (name == null || name.Length == 0) {
                    name = origin;
                }

                var filter = Builders<BsonDocument>.Filter.Eq("schema.name", name);
                var result = MongoCollection.Find(filter).ToListAsync();
                result.Wait();
                bool nameIsUnique = result.Result.Count() <= 1;
                if (!nameIsUnique) {
                    // TODO(iora): Find a better way to deal with duplicate docs.
                    name = "new" + name;
                }

                // Description
                if (description == null || description.Length == 0) {
                    description = "No description provided.";
                }

                BsonDocument doc = JsonFromRich(rich, name, description).ToBsonDocument();
                MongoCollection.InsertOneAsync(doc).Wait();
                return doc["schema.id"].ToString();
            } catch (Exception ouch) {
                LastError = string.Format("Database.UploadDSFromRich: database error ({0})", ouch.Message);
                return null;
            }
        }


        // Given the path of a file, a name for the dataset and a description for a dataset,
        // opens the file, parse the file and obtain a JsDataset. The parsing is done by
        // RichDS. If RichDS fails, obtain the error that occurred and save it as this LastError.
        // If name is null or empty, use the file name from path. 
        // CHECK that the name is unique in the database, otherwise come up with a new name.
        // If description is null or empty, use "No description provided".
        // If the JsDataset ds is obtained, serialize it into a BSON document and save it into
        // the database.
        // Then obtain the *automagically* unique ID for it and RETURN it.
        // If stuff goes wrong, save the error and return -1.
        public static string UploadDSFromFile(string path, string name, string description)
        {
            RichDS rich = Augmenter.FromFile(path, ",");
            if (rich == null) {
                LastError = "Database.UploadDSFromFile: " + Augmenter.GetError();
                return null;
            }

            return UploadDSFromRich(rich, path, name, description);
        }


        //
        public static string UploadDSFromStream(Stream stream, string name, string description)
        {
            RichDS rich = Augmenter.FromStream(stream, ",");
            if (rich == null) {
                LastError = "Database.UploadDSFromStream: " + Augmenter.GetError();
                return null;
            }

            return UploadDSFromRich(rich, "<stream>", name, description);
        }

        
        //
        public static string UploadDSFromURL(string url, string name, string description)
        {
            RichDS rich = Augmenter.FromURL(url, ",");
            if (rich == null) {
                LastError = "Database.UploadDSFromFile: " + Augmenter.GetError();
                return null;
            }

            return UploadDSFromRich(rich, url, name, description);
        }


        //
        public static JsonDS JsonFromURL(string url, string name, string description)
        {
            RichDS rich = Augmenter.FromURL(url, ",");
            if (rich == null) {
                LastError = "Database.JsonFromURL: " + Augmenter.GetError();
                return null;
            }

            return JsonFromRich(rich, name, description);
        }


        //
        public static JsonDS JsonFromFile(string path, string name, string description)
        {
            RichDS rich = Augmenter.FromFile(path, ",");
            if (rich == null) {
                LastError = "Database.JsonFromFile: " + Augmenter.GetError();
                return null;
            }

            return JsonFromRich(rich, name, description);
        }


        //
        public static JsonDS JsonFromStream(Stream stream, string name, string description)
        {
            RichDS rich = Augmenter.FromStream(stream, ",");
            if (rich == null) {
                LastError = "Database.JsonFromStream: " + Augmenter.GetError();
                return null;
            }

            return JsonFromRich(rich, name, description);
        }


        // RichDS --> JsonDS
        public static JsonDS JsonFromRich(RichDS rich, string name, string description)
        {
            JsonDS json = new JsonDS();
            json.rows = rich.Rows;

            json.schema = new JsonMiniset();
            json.schema.description = description;
            json.schema.name = name;
            json.schema.nrows = rich.NRows;
            json.schema.fields = new JsonField[rich.NColumns];

            for (int c = 0, ncols = rich.NColumns; c < ncols; c++) {
                json.schema.fields[c] = new JsonField();
                json.schema.fields[c].name = rich.Columns[c].Header;
                json.schema.fields[c].index = rich.Columns[c].Index;
                json.schema.fields[c].type = rich.Columns[c].Type.ToString();

                json.schema.fields[c].stats = new JsonStats();
                json.schema.fields[c].stats.min = rich.Columns[c].Stats.Min;
                json.schema.fields[c].stats.max = rich.Columns[c].Stats.Max;
                json.schema.fields[c].stats.mean = rich.Columns[c].Stats.Mean;
                json.schema.fields[c].stats.median = rich.Columns[c].Stats.Median;
                json.schema.fields[c].stats.variance = rich.Columns[c].Stats.Variance;
                json.schema.fields[c].stats.sd = rich.Columns[c].Stats.StdDev;
                json.schema.fields[c].stats.sum = rich.Columns[c].Stats.Sum;
                json.schema.fields[c].stats.count = rich.Columns[c].Stats.Count;
            }

            return json;
        }
    }
}