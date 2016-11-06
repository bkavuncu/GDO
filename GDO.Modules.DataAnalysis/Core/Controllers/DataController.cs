// This code was written by Senaka Fernando
//

using GDO.Modules.DataAnalysis.Core.DataModels.Mongo;
using GDO.Modules.DataAnalysis.Ext;
using Newtonsoft.Json;
using System;
using System.ComponentModel.Composition;
using System.Linq;
using System.Web.Http;
using System.Web.Http.SelfHost;

using static GDO.Modules.DataAnalysis.Core.Utilities;

namespace GDO.Modules.DataAnalysis.Core.Controllers
{
    /// <summary>
    /// A Controller for Key-Value Pair Data Plots
    /// </summary>
    [Export(typeof(IDataAnalysisController))]
    public class DataController : ApiController, IDataAnalysisController
    {
        [Route("chart/data/{db}/{collection}")]
        public IHttpActionResult Get(string db, string collection,
            int pagesize = 200, string datatype = "float")
        {
            try
            {
                string baseurl = ((HttpSelfHostConfiguration)Configuration).BaseAddress.ToString();
                var source = new JsonLabelValueArray(
                    string.Format(baseurl + "/mongodb/{0}/{1}?pagesize={2}", db, collection, pagesize));
                var values = (object[])InvokeGenericMethod(typeof(TypeMapper), "ConvertArray", datatype,
                    new[] { InvokeGenericMethod(source, source.GetType(), "GetValues", datatype) });
                var result = source.GetLabels().Zip(values, (Key, Value) => new { Key, Value }).ToList();
                return new RawJsonActionResult
                {
                    Payload = JsonConvert.SerializeObject(result.Select(
                        x => new { value = x.Value, label = x.Key }).ToArray(), Formatting.Indented)
                };
            }
            catch (Exception e)
            {
                return InternalServerError(e);
            }
        }
    }
}