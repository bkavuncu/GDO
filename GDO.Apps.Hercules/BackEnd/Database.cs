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
        private static IMongoCollection<JsonRows> JsonRows;
        private static IMongoCollection<JsonMiniset> JsonMinisets;


        // Initialization of Database.
        // Sets up DB connection to MongoDB to database 'datasets'.
        // If everything wenk OK, returns true.
        // Otherwise LastError is saved and this returns false.
        // If Init is called multiple times, make sure that things don't break.
        public static bool Init()
        {
            MongoClient = new MongoClient("mongodb://localhost/datasets");
            MongoDB = MongoClient.GetDatabase("datasets");
            JsonRows = MongoDB.GetCollection<JsonRows>("jsonrows");
            JsonMinisets = MongoDB.GetCollection<JsonMiniset>("jsonminisets");
            return true;
        }

        // Each JsDataset contains the data (rows) and thse JsMiniset (schema).
        // Each JsMiniset has a unique (id) field. We retrieved JsMinisets through this field.
        // Given the ID of a JsMiniset, we need to retrieve it from the MongolDB database. (Good Luck).
        // Once we obtain it, we need to De?serialize it into a JSON string. Maybe MongolBD can do that 
        // for us, or we'll need to use Newtonsoft.JSON.
        // If something goes wrong, return the NULL string and save the error.
        public static JsonMiniset QueryJsonMiniset(string id)
        {
            if (id == null) {
                LastError = string.Format("Database.GetMiniset({0}): id can't be null!", id);
                return null;
            }

            try {
                // Find the minisets and wait
                var filter = Builders<JsonMiniset>.Filter.Eq("_id", new ObjectId(id));
                var task = JsonMinisets.Find(filter).ToListAsync();
                task.Wait();
                var minisets = task.Result;

                if (minisets.Count <= 0) {
                    LastError = string.Format("Database.QueryJsonMiniset({0}): no miniset found with this id.", id);
                    return null;
                } else if (minisets.Count > 1) {
                    LastError = string.Format("Database.QueryJsonMiniset({0}): found more than 1 ds with this id... OUCH!", id);
                    return null;
                } else {
                    return minisets[0];
                }
               
            } catch (Exception ouch) {
                LastError = string.Format("Database.QueryJsonMiniset({0}): database error ({1}).", id, ouch.Message);
                return null;
            }
        }

        // Returns an array containing the JSON strings of ALL the minisets.
        // If something goes wrong, return the NULL array and save the error.
        public static JsonMiniset[] QueryJsonMinisets()
        {
            try {
                var task = JsonMinisets.Find(_ => true).ToListAsync();
                task.Wait();
                var minisets = task.Result; 
    
                return minisets.ToArray();
            } catch (Exception ouch) {
                LastError = string.Format("Database.QueryJsonMinisets: database error ({0}).", ouch.Message);
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
        public static JsonRows QueryJsonRows(string id)
        {
            try {
                // Find the rows and wait
                var filter = Builders<JsonRows>.Filter.Eq("_id", new ObjectId(id));
                var task = JsonRows.Find(filter).ToListAsync();
                task.Wait();
                var rows = task.Result;

                if (rows.Count <= 0) {
                    LastError = string.Format("Database.QueryJsonRows({0}): no rows found with this id.", id);
                    return null;
                } else if (rows.Count > 1) {
                    LastError = string.Format("Database.QueryJsonRows({0}): found more than 1 set of rows with this id... OUCH!", id);
                    return null;
                } else {
                    return rows[0];
                }

            } catch (Exception ouch) {
                LastError = string.Format("Database.QueryJsonRows({0}): database error ({1})", id, ouch.Message);
                return null;
            }
        }

        public static JsonDS QueryJsonDS(string id)
        {
            try {
                JsonMiniset schema = QueryJsonMiniset(id);
                if (schema == null)
                    return null;

                JsonRows rows = QueryJsonRows(id);
                if (rows == null)
                    return null;

                JsonDS ds = new JsonDS();
                ds.rows = rows.rows;
                ds.schema = schema;
                return ds;

            } catch (Exception ouch) {
                LastError = string.Format("Database.QueryJsonDS({0}): database error ({1})", id, ouch.Message);
                return null;
            }
        }


        // JsonDS must be set with JsonFromRich
        public static string UploadJsonDS(JsonDS ds)
        {
            if (ds == null) {
                LastError = "Database.UploadJsonDS: the JsonDS provided is null!";
                return null;
            }

            try {
                var task = JsonMinisets.Find(ms => ms.name == ds.schema.name).ToListAsync();
                task.Wait();
                var minisets = task.Result;
                
                if (minisets.Count() >= 1) { 
                    ds.schema.name = ds.schema.name + "_copy";
                }

                JsonMinisets.InsertOneAsync(ds.schema).Wait();

                JsonRows rows = new JsonRows();
                rows.rows = ds.rows;
                rows._id = ds.schema._id;
                JsonRows.InsertOneAsync(rows).Wait();

                string id = ds.schema._id.ToString();
                return id;
            } catch (Exception ouch) {
                LastError = string.Format("Database.UploadDSFromJson: database error ({0})", ouch.Message);
                return null;
            }
        }


        //
        public static JsonDS JsonFromURL(string url, string name, string description)
        {
            RichDS rich = Augmenter.FromURL(url, ",");
            if (rich == null) {
                LastError = "Database.JsonFromURL: " + Augmenter.GetError();
                return null;
            }

            return JsonFromRich(rich, name, description, url, "URL");
        }


        //
        public static JsonDS JsonFromFile(string path, string name, string description)
        {
            RichDS rich = Augmenter.FromFile(path, ",");
            if (rich == null) {
                LastError = "Database.JsonFromFile: " + Augmenter.GetError();
                return null;
            }

            return JsonFromRich(rich, name, description, path, "FILE");
        }


        //
        public static JsonDS JsonFromStream(Stream stream, string name, string description, string origin, string type)
        {
            RichDS rich = Augmenter.FromStream(stream, ",");
            if (rich == null) {
                LastError = "Database.JsonFromStream: " + Augmenter.GetError();
                return null;
            }

            return JsonFromRich(rich, name, description, origin, type);
        }


        // RichDS --> JsonDS
        public static JsonDS JsonFromRich(RichDS rich, string name, string description, string origin, string type)
        {
            JsonDS json = new JsonDS();
            json.rows = rich.Rows;

            json.schema = new JsonMiniset();
            json.schema.description = Utils.Maybe(description, "<no description provided>");
            json.schema.sourceOrigin = Utils.Maybe(origin, "<unknown origin>");
            json.schema.sourceType = Utils.Maybe(type, "<unknown type>");
            json.schema.name = Utils.Maybe(name, "<unknown name>");
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



//// Given the path of a file, a name for the dataset and a description for a dataset,
//// opens the file, parse the file and obtain a JsDataset. The parsing is done by
//// RichDS. If RichDS fails, obtain the error that occurred and save it as this LastError.
//// If name is null or empty, use the file name from path. 
//// CHECK that the name is unique in the database, otherwise come up with a new name.
//// If description is null or empty, use "No description provided".
//// If the JsDataset ds is obtained, serialize it into a BSON document and save it into
//// the database.
//// Then obtain the *automagically* unique ID for it and RETURN it.
//// If stuff goes wrong, save the error and return -1.
//public static string UploadDSFromFile(string path, string name, string description)
//{
//    RichDS rich = Augmenter.FromFile(path, ",");
//    if (rich == null) {
//        LastError = "Database.UploadDSFromFile: " + Augmenter.GetError();
//        return null;
//    }

//    return UploadDSFromRich(rich, path, name, description);
//}


////
//public static string UploadDSFromJson(JsonDS json)
//{
//    try {
//        BsonDocument doc = json.ToJ
//                Task fuck = JsonDatasets.InsertOneAsync(doc);
//        fuck.Wait();
//        doc.
//                return doc["schema._id"].ToString();
//    } catch (Exception ouch) {
//        LastError = string.Format("Database.UploadDSFromJson: database error ({0})", ouch.Message);
//        return null;
//    }
//}


////
//public static string UploadDSFromStream(Stream stream, string name, string description)
//{
//    RichDS rich = Augmenter.FromStream(stream, ",");
//    if (rich == null) {
//        LastError = "Database.UploadDSFromStream: " + Augmenter.GetError();
//        return null;
//    }

//    return UploadDSFromRich(rich, "<stream>", name, description);
//}


////
//public static string UploadDSFromURL(string url, string name, string description)
//{
//    RichDS rich = Augmenter.FromURL(url, ",");
//    if (rich == null) {
//        LastError = "Database.UploadDSFromFile: " + Augmenter.GetError();
//        return null;
//    }

//    return UploadDSFromRich(rich, url, name, description);
//}
