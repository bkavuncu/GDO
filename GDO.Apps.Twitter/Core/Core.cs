using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Newtonsoft.Json;

namespace GDO.Apps.Twitter.Core
{

    public class NewAnalyticsRequest
    {
        public string classification { get; set; }
        public string type { get; set; }
        public string dataset_id { get; set; }
    }

    public class AnalyticsRequest
    {
        public string classification { get; set; }
        public string type { get; set; }
    }
}