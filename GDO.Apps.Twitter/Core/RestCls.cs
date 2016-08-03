using System.Collections.Generic;
using System.Runtime.Serialization;

namespace GDO.Apps.Twitter.Core
{ 
    [DataContract]
    public class DataSet
    {
        [DataMember(Name = "id")]
        public string Id { get; set; }

        [DataMember(Name = "description")]
        public string Description { get; set; }

        [DataMember(Name = "db_col")]
        public string Db { get; set; }

        [DataMember(Name = "status")]
        public string Status { get; set; }

        [DataMember(Name = "collection_size")]
        public long CollectionSize { get; set; }

        [DataMember(Name = "tags")]
        public List<string> Tags { get; set; }

        [DataMember(Name = "type")]
        public string Type { get; set; }
    }

    [DataContract]
    public class Analytics
    {
        [DataMember(Name = "id")]
        public string Id { get; set; }

        [DataMember(Name = "description")]
        public string Description { get; set; }

        [DataMember(Name = "classification")]
        public string Classification { get; set; }

        [DataMember(Name = "type")]
        public string Type { get; set; }

        [DataMember(Name = "status")]
        public string Status { get; set; }

        [DataMember(Name = "datasetId")]
        public string DatasetId { get; set; }
    }

    public class DataSetMeta
    {
        public string Id { get; set; }
        public string Description { get; set; }
        public string Status { get; set; }
        public List<string> Tags { get; set; }
    }

    public class AnalyticsMeta
    {
        public string Id { get; set; }
        public string Description { get; set; }
        public string Status { get; set; }
        public string Classification { get; set; }
        public string Type { get; set; }
    }
}