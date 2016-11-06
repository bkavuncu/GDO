// This code was written by Senaka Fernando
//

using Newtonsoft.Json;
using System.Net.Http;
using System.Linq;

namespace GDO.Modules.DataAnalysis.Core.DataModels.Mongo
{
    public class JsonLabelValueArray
    {
        private JsonValueArrayRootobject model = null;

        public JsonLabelValueArray(string url)
        {
            // Json parser based on http://stackoverflow.com/a/24134911
            var client = new HttpClient();
            var task = client.GetAsync(url).ContinueWith((taskwithresponse) =>
            {
                var response = taskwithresponse.Result;
                var jsonString = response.Content.ReadAsStringAsync();
                jsonString.Wait();
                model = JsonConvert.DeserializeObject<JsonValueArrayRootobject>(jsonString.Result);

            });
            task.Wait();
        }

        public T[] GetValues<T>()
        {
            return model._embedded.rhdoc.Select(x => TypeMapper.Convert<T>(x.value)).ToArray();
        }

        public string[] GetLabels()
        {
            return model._embedded.rhdoc.Select(x => x.label).ToArray();
        }
    }

    public class JsonValueArrayRootobject
    {
        public string _id { get; set; }
        public int _returned { get; set; }
        public _Embedded _embedded { get; set; }
    }

    public class _Embedded
    {
        [JsonProperty("rh:doc")]
        public RhDoc[] rhdoc { get; set; }
    }

    public class RhDoc
    {
        public _Id _id { get; set; }
        public object value { get; set; }
        public string label { get; set; }
    }

    public class _Id
    {
        public string oid { get; set; }
    }
}
