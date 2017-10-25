using GDO.Core;
using System.Diagnostics;
using GDO.Core.Apps;

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

        public string URL {
            get { return Configuration.GetProperty<string>("url");  }
            set {
                Configuration.SetProperty("url",value);
            }
        }

        public void Init()
        {
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