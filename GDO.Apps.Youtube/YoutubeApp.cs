using System;
using GDO.Core;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using GDO.Core.Apps;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace GDO.Apps.Youtube
{
    public class YoutubeApp : IBaseAppInstance
    {
        public int Id { get; set; }
        public string AppName { get; set; }
        public App App { get; set; }
        public Section Section { get; set; }
        public AppConfiguration Configuration { get; set; }
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
                    if (BufferStatus[i, j] < 100)
                    {
                        return false;
                    }
                }
            }
            return true;
        }
    }
}