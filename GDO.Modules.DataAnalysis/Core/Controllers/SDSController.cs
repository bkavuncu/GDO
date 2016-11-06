// This code was written by Senaka Fernando
//

using GDO.Modules.DataAnalysis.Core.DataModels.Mongo;
using GDO.Modules.DataAnalysis.Ext;
using Newtonsoft.Json;
using System.ComponentModel.Composition;
using System.Linq;
using System.Web.Http;
using System.Web.Http.SelfHost;

using static GDO.Modules.DataAnalysis.Core.Utilities;

namespace GDO.Modules.DataAnalysis.Core.Controllers
{
    /// <summary>
    /// A Controller for Single-Series Data Plots
    /// </summary>
    [Export(typeof(IDataAnalysisController))]
    public class SDSController : ApiController, IDataAnalysisController
    {
        [Route("chart/sds/{db}/{collection}")]
        public IHttpActionResult Get(string db, string collection, string seriesname = "",
            int pagesize = 200, string datatype = "float")
        {
            string baseurl = ((HttpSelfHostConfiguration)Configuration).BaseAddress.ToString();
            var source = new JsonLabelValueArray(
                string.Format(baseurl + "/mongodb/{0}/{1}?pagesize={2}", db, collection, pagesize));
            var result = (object[])InvokeGenericMethod(typeof(TypeMapper), "ConvertArray", datatype,
                new[] { InvokeGenericMethod(source, source.GetType(), "GetValues", datatype) });
            return new RawJsonActionResult { Payload = 
                JsonConvert.SerializeObject(new[] { new { data = result.Select(
                x => new { value = x }).ToArray(), seriesname = seriesname } }, Formatting.Indented) };
        }
    }
}