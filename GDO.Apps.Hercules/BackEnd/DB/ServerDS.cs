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

        private static string LastError = "";

        public static bool Init()
        {
            MongoClient = new MongoClient();
            MongoDB = MongoClient.GetDatabase("test");
            return true;
        }

        public static string GetMiniset(int id)
        {
            return "";
        }

        public static string[] GetMinisets()
        {
            return null;
        }

        public static string GetDataset(int id)
        {
            return null;
        }



        public static int UploadDSFromFile(string path, string name, string descritpion)
        {
            // JsDataset ds = ParseDSFromFile(path);

            string rows = "rows"; // JsonConvert.SerializeObject(ds.Rows);
            string schema = "schema"; // JsonConvert.SerializeObject(ds.schema);

            var document = new BsonDocument 
            {
                { "rows", rows } ,
                { "schema", schema } 
            };

            int id = document.GetElement("_id").Value.AsInt32;

            MongoDB.GetCollection<BsonDocument>("datasets").InsertOneAsync(document);

            Utils.Say("DIO ANOOOO " + id);

            return -1;
        }

        public static int UploadDSFromURL (string url, string name, string description)
        {
            return -1;
        }

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
