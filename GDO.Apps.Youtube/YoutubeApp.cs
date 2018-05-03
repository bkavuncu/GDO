﻿using GDO.Core;
using GDO.Core.Apps;

namespace GDO.Apps.Youtube
{
    public class YoutubeApp : IBaseAppInstance
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

        public int[,] BufferStatus { get; set; }
        public bool VideoReady { get; set; }

        public string URL { get; set; }
        public void Init()
        {
            URL = (string)Configuration.Json.SelectToken("url");
            BufferStatus = new int[Section.Cols,Section.Rows];
            VideoReady = false;
        }

        public void SetURL(string url)
        {
            VideoReady = false;
            URL = url;
            Configuration.Json.SelectToken("url").Replace(
                new Newtonsoft.Json.Linq.JValue(url));
        }

        public string GetURL()
        {
            return URL;
        }

        public bool CheckBufferComplete()
        {
            for (int i = 0; i < Section.Cols; i++)
            {
                for (int j = 0; j < Section.Rows; j++)
                {
                    if (BufferStatus[i, j] < 15)
                    {
                        return false;
                    }
                }
            }
            return true;
        }
    }
}
