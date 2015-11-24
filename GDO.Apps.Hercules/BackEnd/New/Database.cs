using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GDO.Apps.Hercules.BackEnd.New
{
    //
    class Database
    {

        // A description of the last error that occurred from calling methods in this class.
        private static string LastError = "";

        // Returns the last error that occurred from the methods in ServerDS.
        public static string GetError() { return LastError; }

        //
        private static IMongoClient MongoClient;

        //
        private static IMongoDatabase MongoDB;


        // Initialization of ServerDS.
        // Sets up DB connection to MongoDB to database 'datasets'.
        // If everything wenk OK, returns true.
        // Otherwise LastError is saved and this returns false.
        // If Init is called multiple times, make sure that things don't break.
        public static bool Init()
        {
            MongoClient = new MongoClient();
            MongoDB = MongoClient.GetDatabase("datasets");

            return true;
        }


        // Each JsDataset contains the data (rows) and the JsMiniset (schema).
        // Each JsMiniset has a unique (id) field. We retrieved JsMinisets through this field.
        // Given the ID of a JsMiniset, we need to retrieve it from the MongolDB database. (Good Luck).
        // Once we obtain it, we need to De?serialize it into a JSON string. Maybe MongolBD can do that 
        // for us, or we'll need to use Newtonsoft.JSON.
        // If something goes wrong, return the NULL string and save the error.
        public static string GetMiniset(int id)
        {
            return null;
        }


        // Returns an array containing the JSON strings of ALL the minisets.
        // If something goes wrong, return the NULL array and save the error.
        public static string[] GetMinisets()
        {
            return null;
        }


        // Each JsDataset contains the data (rows) and the JsMiniset (schema).
        // Each JsMiniset has a unique (id) field. We retrieved JsMinisets through this field.
        // Given the ID of a JsMiniset, we need to retrieve it from the MongolDB database. (Good Luck).
        // But we store the whole JsDatasets so this includes the rows.
        // Once we obtain it, we need to De?serialize it into a JSON string. Maybe MongolBD can do that 
        // for us, or we'll need to use Newtonsoft.JSON.
        // If something goes wrong, return the NULL string and save the error.
        public static string GetDataset(int id)
        {
            return null;
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
        public static int UploadDSFromFile(string path, string name, string description)
        {
            RichDS rich = Augmenter.FromFile(path, ",");
            if (rich == null) {
                LastError = "Database.UploadDSFromFile: " + Augmenter.GetError();
                return -1;
            }

            return UploadDSFromRich(rich, name, description);
        }


        //
        public static int UploadDSFromStream(Stream stream, string name, string description)
        {
            RichDS rich = Augmenter.FromStream(stream, ",");
            if (rich == null) {
                LastError = "Database.UploadDSFromStream: " + Augmenter.GetError();
                return -1;
            }

            return UploadDSFromRich(rich, name, description);
        }


        // TODO maybe one day
        public static int UploadDSFromURL(string url, string name, string description)
        {
            RichDS rich = Augmenter.FromURL(url, ",");
            if (rich == null) {
                LastError = "Database.UploadDSFromFile: " + Augmenter.GetError();
                return -1;
            }

            return UploadDSFromRich(rich, name, description);
        }


        //
        public static int UploadDSFromRich(RichDS rich, string name, string descritpion)
        {
            LastError = "Database.UploadDSFromRich: not implemented yet!";




            return -1;
        }
    

        // RichDS --> JsonDS
        public static JsonDS JsonFromRich(RichDS rich)
        {
            JsonDS json = new JsonDS();
            json.rows   = rich.Rows;

            json.schema       = new JsonMiniset();
            json.schema.nrows = rich.NRows;
            json.schema.fields = new JsonField[rich.NColumns];

            for (int c = 0, ncols = rich.NColumns; c < ncols; c++)
            {
                json.schema.fields[c]       = new JsonField();
                json.schema.fields[c].name  = rich.Columns[c].Header;
                json.schema.fields[c].index = rich.Columns[c].Index;
                json.schema.fields[c].type  = rich.Columns[c].Type.ToString();

                json.schema.fields[c].stats          = new JsonStats();
                json.schema.fields[c].stats.min      = rich.Columns[c].Stats.Min;
                json.schema.fields[c].stats.max      = rich.Columns[c].Stats.Max;
                json.schema.fields[c].stats.mean     = rich.Columns[c].Stats.Mean;
                json.schema.fields[c].stats.median   = rich.Columns[c].Stats.Median;
                json.schema.fields[c].stats.variance = rich.Columns[c].Stats.Variance;
                json.schema.fields[c].stats.sd       = rich.Columns[c].Stats.StdDev;
                json.schema.fields[c].stats.sum      = rich.Columns[c].Stats.Sum;
                json.schema.fields[c].stats.count    = rich.Columns[c].Stats.Count;
            }

            return json;
        }


    }

}



//public static PlainDS PlainFromStream(Stream stream, string delimiter)
//{
//    PlainDS ds = Parser.FromStream(stream, delimiter);
//    if (ds == null)
//        LastError = "Dataset: parsing error -> " + Parser.GetError();
//    return ds;
//}

//public static PlainDS PlainFromURL(string url, string delimiter)
//{
//    PlainDS ds = Parser.FromURL(url, delimiter);
//    if (ds == null)
//        LastError = "Dataset: parsing error -> " + Parser.GetError();
//    return ds;
//}

//public static PlainDS PlainFromFile(string path, string delimiter)
//{
//    PlainDS ds = Parser.FromFile(path, delimiter);
//    if (ds == null)
//        LastError = "Dataset: parsing error -> " + Parser.GetError();
//    return ds;
//}


//public static RichDS RichFromStream(Stream stream, string delimiter)
//{
//    return new RichDS();
//}

//public static RichDS RichFromString(string data, string delimiter)
//{
//    return new RichDS();
//}

//public static RichDS RichFromFile(string path, string delimiter)
//{
//    return new RichDS();
//}

//public static RichDS RichFromURL(string url, string delimiter)
//{
//    return new RichDS();
//}

//public static RichDS RichFromPlain(Stream stream, string delimiter)
//{
//    return new RichDS();
//}