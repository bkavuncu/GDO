using System;
using System.Collections.Generic;
using GDO.Core;
using System.Diagnostics;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Runtime.Serialization;
using System.Threading.Tasks;
using System.Web.UI;
using GDO.Core.Apps;

namespace GDO.Apps.Twitter
{
    [DataContract]
    public class DataSet
    {
        [DataMember(Name = "id")]
        public string Id { get; set; }

        [DataMember(Name = "description")]
        public string Description { get; set; }

        [DataMember(Name = "db_col")]
        public string DB { get; set; }

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

    public class SubSection
    {
        public int Id { get; set;}
        public int RowStart { get; set; }
        public int RowEnd { get; set; }
        public int ColStart { get; set; }
        public int ColEnd { get; set; }
        public override string ToString()
        {
            return "(" + ColStart + "," + RowStart + "," + ColEnd + "," + RowEnd + ")";
        }
    }


    public class TwitterApp : IBaseAppInstance
    {
        public int Id { get; set; }
        public string AppName { get; set; }
        public Section Section { get; set; }
        public bool IntegrationMode { get; set; }
        public IAdvancedAppInstance ParentApp { get; set; }
        public AppConfiguration Configuration { get; set; }

        private Uri _url { get; set; }
        private HttpClient _httpClient { get; set; }

        public String ApiAddress { get; set; }

        public void Init()
        {
            this.ApiAddress = (string) Configuration.Json.SelectToken("api_address");
            _url = new Uri(ApiAddress);
            _httpClient = new HttpClient {BaseAddress = _url};
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic",
                "Y3BzMTVfdXNlcjpzZWNyZXQ=");
            _httpClient.DefaultRequestHeaders.Accept.Clear();
            _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            
            Debug.WriteLine("Using the following address a root api: " +this.ApiAddress);
        }

        public DataSetMeta[] GetDataSetMetas()
        {
            return (Get<DataSet[]>("API/dataset") ?? new DataSet[0]).Select(ds => new DataSetMeta()
            {
                Description = ds.Description,
                Id = ds.Id,
                Status = ds.Status,
                Tags = ds.Tags
            }).ToArray();
        }

        public AnalyticsMeta[] GetAnalyticsMetas(string dataSetId)
        {
            return
                (Get<Analytics[]>("API/dataset/" + dataSetId + "/analytics") ?? new Analytics[0]).Select(
                    an => new AnalyticsMeta()
                    {
                        Id = an.Id,
                        Description = an.Description,
                        Status = an.Status,
                        Classification = an.Classification,
                        Type = an.Type
                    }).ToArray();
        }

        public DataSet GetDataSet(string id)
        {
            return Get<DataSet>("API/dataset/" + id);
        }

        public Analytics GetAnalytics(string dataSetId, string Id)
        {
            return Get<Analytics>("API/dataset/" + dataSetId + "/analytics/" + Id);
        }

        public T Get<T>(string url) where T : class
        {
            Task<T> dataSetTask = _httpClient.GetAsync(url).ContinueWith(resposeTask =>
            {
                HttpResponseMessage response = resposeTask.Result;
                if (!response.IsSuccessStatusCode) return null;
                Task<T> dataSetResponseTask = response.Content.ReadAsAsync<T>();
                dataSetResponseTask.Wait();
                return dataSetResponseTask.Result;
            });
            dataSetTask.Wait();
            return dataSetTask.Result;
        }

        public SubSection Launch()
        {
            return new SubSection()
            {
                Id =  1,
                ColStart = 0,
                ColEnd = 2,
                RowStart = 0,
                RowEnd = 2
            };
        }


        public string Name { get; set; }

//        public void Init(int instanceId, string appName, Section section, AppConfiguration configuration)
//        {
//            this.Id = instanceId;
//            this.AppName = appName;
//            this.Section = section;
//            this.Configuration = configuration;
//        }

        public void SetName(string name)
        {
            Name = name;
        }

        public string GetName()
        {
            return Name;
        }
    }
}