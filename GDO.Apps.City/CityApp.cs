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
using Microsoft.AspNet.SignalR;
using Microsoft.SqlServer.Server;
using Newtonsoft.Json;

namespace GDO.Apps.City
{
    public class CityApp : ICompositeAppInstance
    {
        JsonSerializerSettings JsonSettings = new JsonSerializerSettings {TypeNameHandling = TypeNameHandling.All};
        public int Id { get; set; }
        public App App { get; set; }
        public string AppName { get; set; }
        public Section Section { get; set; }
        #region config
        public AppJsonConfiguration Configuration { get; set; }
        public IAppConfiguration GetConfiguration() {
            return this.Configuration;
        }

        public bool SetConfiguration(IAppConfiguration config) {
            if (config is AppJsonConfiguration) {
                this.Configuration = (AppJsonConfiguration)config;
                // todo signal status change
                return true;
            }
            this.Configuration = (AppJsonConfiguration)GetDefaultConfiguration();
            return false;
        }

        public IAppConfiguration GetDefaultConfiguration() {
            return new AppJsonConfiguration();
        }
        #endregion
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