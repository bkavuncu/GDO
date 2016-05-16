using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using GDO.Core;
using GDO.Core.Apps;
using GDO.Utility;
using Microsoft.SqlServer.Server;
using Newtonsoft.Json;

namespace GDO.Apps.City
{
    public class CityApp : IAdvancedAppInstance
    {
        JsonSerializerSettings JsonSettings = new JsonSerializerSettings {TypeNameHandling = TypeNameHandling.All};
        public int Id { get; set; }
        public string AppName { get; set; }
        public Section Section { get; set; }
        public AppConfiguration Configuration { get; set; }
        public List<IBaseAppInstance> IntegratedInstances { get; set; }


        public bool IsInitialized = false;

        public void Init()
        {


        }

        public List<int> GetListofIntegratedInstances()
        {
            List<int> list = new List<int>();
            foreach (var instance in IntegratedInstances)
            {
                list.Add(instance.Id);
            }
            return list;
        }
    }
}