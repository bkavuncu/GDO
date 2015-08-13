using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Core
{
    /// <summary>
    ///  App Configuration Class
    /// </summary>
    public class AppConfiguration
    {
        public string Name { get; set; }

        public Newtonsoft.Json.Linq.JObject Json { get; set; }

        public AppConfiguration(string Name, dynamic Json)
        {
            this.Name = Name;
            this.Json = Json;
        }
    }


}