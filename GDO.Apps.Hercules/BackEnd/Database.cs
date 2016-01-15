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
    // Upload/Delete/Retrieve JsonDS
    public class Database
    {

        // A description of the last error that occurred from calling methods in this class.
        private static string LastError = "";

        private static string datasetPath = "../../GDO.Apps.Hercules.Tests/TestFiles/WellFormed";

        // Returns the last error that occurred from the methods in ServerDS.
        public static string GetError() { return LastError; }

        //
        private static IMongoClient MongoClient;

        //
        private static IMongoDatabase MongoDB;

        //
        private static IMongoCollection<JsonRows> JsonRows;

        //
        private static IMongoCollection<JsonMiniset> JsonMinisets;

        // Initialization of Database.
        // May throw exceptions!
        public static void Init()
        {
            MongoClient = new MongoClient("mongodb://localhost/datasets");
            MongoDB = MongoClient.GetDatabase("datasets");
            JsonRows = MongoDB.GetCollection<JsonRows>("jsonrows");
            JsonMinisets = MongoDB.GetCollection<JsonMiniset>("jsonminisets");
            if (MongoDB == null || JsonRows == null || JsonMinisets == null)
            {
                throw new Exception("Something wrong with MongoDB...");
            }
        }

        // Each JsDataset contains the data (rows) and thse JsMiniset (schema).
        // Each JsMiniset has a unique (id) field. We retrieved JsMinisets through this field.
        // Given the ID of a JsMiniset, we need to retrieve it from the MongolDB database. (Good Luck).
        // May throw exceptions!
        public static JsonMiniset QueryJsonMiniset(string id)
        {
            if (id == null) {
                throw new Exception(string.Format("Database.GetMiniset({0}): id can't be null!", id));
            }

                // Find the minisets and wait
                var filter = Builders<JsonMiniset>.Filter.Eq("_id", new ObjectId(id));
                var task = JsonMinisets.Find(filter).ToListAsync();
                task.Wait();
                var minisets = task.Result;

                if (minisets.Count <= 0) {
                    throw new Exception(string.Format("Database.QueryJsonMiniset({0}): no miniset found with this id.", id));
                } else if (minisets.Count > 1) {
                    throw new Exception(string.Format("Database.QueryJsonMiniset({0}): found more than 1 ds with this id... OUCH!", id));
                } else {
                    return minisets[0];
                }
            }

        // Returns all the ministes in the database.
        // May throw exceptions!
        public static JsonMiniset[] QueryJsonMinisets()
        {
                var task = JsonMinisets.Find(_ => true).ToListAsync();
                task.Wait();
                var minisets = task.Result; 
    
                return minisets.ToArray();
        }

        public static void EnsureDatasetsAreLoaded()
        {
            JsonMiniset[] ms = QueryJsonMinisets();
            if (ms.Length == 0)
            {
                string[] files = Directory.GetFiles(datasetPath, "*.csv", SearchOption.TopDirectoryOnly);
                foreach (String file in files)
                {
                    JsonDS ds = Database.JsonDSFromFile(file, Path.GetFileName(file), "");
                    if (ds != null)
                    {
                        Database.UploadJsonDS(ds);
                    } 
                }
            }
        }

        // Each JsDataset contains the data (rows) and the JsMiniset (schema).
        // Each JsMiniset has a unique (id) field. We retrieved JsMinisets through this field.
        // Given the ID of a JsMiniset, we need to retrieve it from the MongolDB database. (Good Luck).
        // But we store the whole JsDatasets so this includes the rows.
        // Once we obtain it, we need to De?serialize it into a JSON string. Maybe MongolBD can do that 
        // for us, or we'll need to use Newtonsoft.JSON.
        // If something goes wrong, return the NULL string and save the error.
        public static JsonRows QueryJsonRows(string id)
        {
                // Find the rows and wait
                var filter = Builders<JsonRows>.Filter.Eq("_id", new ObjectId(id));
                var task = JsonRows.Find(filter).ToListAsync();
                task.Wait();
                var rows = task.Result;

                if (rows.Count <= 0) {
                    throw new Exception(string.Format("Database.QueryJsonRows({0}): no rows found with this id.", id));
                } else if (rows.Count > 1) {
                    throw new Exception(string.Format("Database.QueryJsonRows({0}): found more than 1 set of rows with this id... OUCH!", id));
                } else {
                    return rows[0];
                }
            }

        // Retursn the JsonDS given the dataset id.
        // May throw exceptions!
        public static JsonDS QueryJsonDS(string id)
        {
                JsonMiniset schema = QueryJsonMiniset(id);

                JsonRows rows = QueryJsonRows(id);

                JsonDS ds = new JsonDS();
                ds.rows = rows.rows;
                ds.schema = schema;
                return ds;
            }

        // Uploads a JsonDS to the database.
        // May throw exceptions!
        public static string UploadJsonDS(JsonDS ds)
        {
            if (ds == null) {
                throw new Exception("Database.UploadJsonDS: the JsonDS provided is null!");
            }

            // Upload miniset
                var task = JsonMinisets.Find(ms => ms.name == ds.schema.name).ToListAsync();
                task.Wait();
                var minisets = task.Result;
                if (minisets.Count() >= 1) { 
                    ds.schema.name = ds.schema.name + "_copy";
                }
                JsonMinisets.InsertOneAsync(ds.schema).Wait();

            // Upload rows
                JsonRows rows = new JsonRows();
                rows.rows = ds.rows;
                rows._id = ds.schema._id; // Override ID
                JsonRows.InsertOneAsync(rows).Wait();

                string id = ds.schema._id.ToString();
                return id;
            }

        // Deletes dataset from the database.
        // May throw exceptions!
        public static void DeleteJsonDS(string id)
        {

        }

        // Delets everything from the database.
        public static void DeleteEverything()
        {

            }

        // URL --> JsonDS
        // May throw exceptions!
        public static JsonDS JsonDSFromURL(string url, string name, string description)
        {
            return JsonDSFromRich(Augmenter.FromURL(url, ","), name, description, url, "URL");
        }

        // Path --> JsonDS
        // May throw exceptions!
        public static JsonDS JsonDSFromFile(string path, string name, string description)
        {
            return JsonDSFromRich(Augmenter.FromFile(path, ","), name, description, path, "FILE");
            }

        // Stream --> JsonDS
        // May throw exceptions!
        public static JsonDS JsonDSFromStream(Stream stream, string name, string description, string origin, string type)
        {
            return JsonDSFromRich(Augmenter.FromStream(stream, ","), name, description, origin, type);
        }

        // RichDS --> JsonDS
        public static JsonDS JsonDSFromRich(RichDS rich, string name, string description, string origin, string type)
        {
            JsonDS json = new JsonDS();
            json.rows = rich.Rows;

            json.schema = new JsonMiniset();
            json.schema.description = Utils.Maybe(description, "<no description provided>");
            json.schema.sourceOrigin = Utils.Maybe(origin, "<unknown origin>");
            json.schema.sourceType = Utils.Maybe(type, "<unknown type>");
            json.schema.name = Utils.Maybe(name, "<unknown name>");
            json.schema.length = rich.NRows;
            json.schema.fields = new JsonField[rich.NColumns];

            for (int c = 0, ncols = rich.NColumns; c < ncols; c++) {
                json.schema.fields[c] = new JsonField();
                json.schema.fields[c].name = rich.Columns[c].Header;
                json.schema.fields[c].index = rich.Columns[c].Index;
                json.schema.fields[c].type = rich.Columns[c].Type.ToString();
                json.schema.fields[c].origin = "native";

                json.schema.fields[c].stats = new JsonStats();
                json.schema.fields[c].stats.min = rich.Columns[c].Stats.Min;
                json.schema.fields[c].stats.max = rich.Columns[c].Stats.Max;
                json.schema.fields[c].stats.mean = rich.Columns[c].Stats.Mean;
                json.schema.fields[c].stats.median = rich.Columns[c].Stats.Median;
                json.schema.fields[c].stats.variance = rich.Columns[c].Stats.Variance;
                json.schema.fields[c].stats.stdDev = rich.Columns[c].Stats.StdDev;
                json.schema.fields[c].stats.sum = rich.Columns[c].Stats.Sum;
                json.schema.fields[c].stats.count = rich.Columns[c].Stats.Count;
                json.schema.fields[c].stats.isEnum = rich.Columns[c].Stats.Enum;
            }

            return json;
        }
    }
}
