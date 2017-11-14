using GDO.Core;
using GDO.Core.Apps;
using log4net;
using Microsoft.AspNet.SignalR;

namespace GDO.Apps.Cortical
{

    public class CorticalApp : IBaseAppInstance {
        private static readonly ILog Log = LogManager.GetLogger(typeof(CorticalApp));

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


        public void Init()
        {

        }

    }
}

