using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;
using Newtonsoft.Json;
using MongoDB.Bson;
using MongoDB.Driver;

namespace GDO.Apps.Hercules.BackEnd.DB
{

    public class ServerDS
    {
        private static IMongoClient MongoClient;
        private static IMongoDatabase MongoDB;
        

        // A description of the last error that occurred from calling methods in this class.
        private static string LastError = "";


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
        public static int UploadDSFromFile(string path, string name, string descritpion)
        {
            JsDataset ds = null; // RichDS.FromFile(path);
            if (ds == null) {
                LastError = ""; // RichDS.GetError();
                return -1;
            }

            return -1;
        }

        // TODO maybe one day
        public static int UploadDSFromURL (string url, string name, string description)
        {
            return -1;
        }


        // Returns the last error that occurred from the methods in ServerDS.
        public static string GetError()
        {
            return LastError;
        }
    }








    //// Usage: 
    //public sealed class ServerDS
    //{

    //    //
    //    private static string BaseDirectory = "";

    //    //
    //    private static string MinisetsPath = BaseDirectory + "/minisets.json";

    //    // Where is the metadata stored
    //    private static string MetadataPath = BaseDirectory + "/metadata.json";

    //    // 
    //    private static string MinisetFile = "/miniset.json";

    //    //
    //    private static string DatasetFile = "/dataset.json";


    //    // Maps dataset id to dataset name
    //    private static Dictionary<int, string> DatasetNames = new Dictionary<int, string>();

    //    //
    //    private static string LastError = null;


    //    //
    //    public static bool Init() {
    //        if (!File.Exists(MetadataPath)) {
    //            LastError = "ServerDS.Init(): " + MetadataPath + " file misplaced!";
    //            return false;
    //        }
            
    //        try {
    //            string json = File.ReadAllText(MetadataPath);
    //            DatasetNames = JsonConvert.DeserializeObject<Dictionary<int, string>>(json);
    //        } catch (Exception ex) {
    //            LastError = "ServerBD.Init(): Error deserializing metadata (" + ex.Message + ")";
    //            return false;
    //        }

    //        return true;
    //    }


    //    // Returns string containing location of .json RichDS number#id.
    //    // Returns null if no such RichDS exists. See GetError().
    //    public static string GetMiniset(int id) {
    //        if (id < 0) {
    //            LastError = "ServerDS.GetMiniset(int id): Negative id " + id + "!";
    //            return null;
    //        }

    //        if (!DatasetNames.ContainsKey(id)) {
    //            LastError = "ServerDS.GetMiniset(int id): Dataset with id " + id + " not found!";
    //            return null;
    //        }

    //        string name = DatasetNames[id];
    //        string path = BaseDirectory + "/" + name + MinisetFile;

    //        if (!File.Exists (path)) {
    //            LastError = "ServerDS.GetMiniset(int id): " + path + " file misplaced for Dataset with id " + id + "!";
    //            return null;
    //        }

    //        return path;
    //    }

    //    // Returns string containing location of all .json RichDS number#id.
    //    // Returns null if no such RichDS exists. See GetError().
    //    public static string GellAllMinisets() {
    //        if (!File.Exists(MinisetsPath)) {
    //            LastError = "ServerDS.GellAllMinisets(): " + MinisetsPath + " file misplaced!";
    //            return null;
    //        }

    //        return MinisetsPath;
    //    }

    //    //
    //    public static string GetDataset(int id) {
    //        if (id < 0) {
    //            LastError = "ServerDS.GetDataset(int id): Negative id " + id + "!";
    //            return null;
    //        }

    //        if (!DatasetNames.ContainsKey(id)) {
    //            LastError = "ServerDS.GetDataset(int id): Dataset with id " + id + " not found!";
    //            return null;
    //        }

    //        string name = DatasetNames[id];
    //        string path = BaseDirectory + "/" + name + DatasetFile;

    //        if (!File.Exists(path)) {
    //            LastError = "ServerDS.GetDataset(int id): " + path + " file misplaced for Dataset with id " + id + "!";
    //            return null;
    //        }

    //        return path;
    //    }

    //    //
    //    public static int DisableDataset(int id)
    //    {

    //    }

    //    public static int EnableDataset(int id)
    //    {

    //    }


    //    // Returns the ID of the newly created Dataset.
    //    // Returns -1 on unrecorevable error. See GetError().
    //    public static int ParseDatasetFromFile(string path, string name, string description)
    //    {
    //        DatasetNames.
    //    }

    //    // Returns the ID of the newly created Dataset.
    //    // Returns -1 on unrecorevable error.
    //    public static int ParseDatasetFromURL(string url, string name, string description)
    //    {

    //    }


    //    public static string GetError()
    //    {
    //        return LastError;
    //    } 

   
}
