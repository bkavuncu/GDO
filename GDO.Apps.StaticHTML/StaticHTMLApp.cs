using System;
using GDO.Core;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.IO;
using GDO.Core.Apps;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace GDO.Apps.StaticHTML
{
    public class StaticHTMLApp : IBaseAppInstance
    {
        public int Id { get; set; }
        public string AppName { get; set; }
        public App App { get; set; }
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
        public bool IntegrationMode { get; set; }
        public ICompositeAppInstance ParentApp { get; set; }

        public bool IsResponsiveMode { get; set; } = false;
        public string URL { get; set; }
        public void Init()
        {
            URL = (string)Configuration.Json.SelectToken("url");
            IsResponsiveMode = (bool)(Configuration.Json.SelectToken("responsiveMode") ?? false);
            Debug.WriteLine("Using responsive mode? " + IsResponsiveMode);
        }

        public void SetURL(string url)
        {
            URL = url;
        }

        public string GetURL()
        {
            return URL;
        }
    }
}