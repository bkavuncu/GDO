using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using GDO.Core;
using GDO.Core.Apps;
using Microsoft.AspNet.SignalR;

namespace GDO.Apps.GigaImages
{
    public class GigaImagesApp : IBaseAppInstance
    {
        public int Id { get; set; }
        public string AppName { get; set; }
        public App App { get; set; }

        #region config
        public AppJsonConfiguration Configuration { get; set; }
        public IAppConfiguration GetConfiguration() {
            return this.Configuration;
        }

        public bool SetConfiguration(IAppConfiguration config) {
            if (config is AppJsonConfiguration) {
                this.Configuration = (AppJsonConfiguration) config;
                // todo signal status change
                return true;
            }
            this.Configuration = (AppJsonConfiguration) GetDefaultConfiguration();
            return false;
        }

        public IAppConfiguration GetDefaultConfiguration() {
            return new AppJsonConfiguration();
        }
        #endregion

        public Section Section { get; set; }
        
        public bool IntegrationMode { get; set; }
        public ICompositeAppInstance ParentApp { get; set; }
        public Position Position { get; set; }
        public bool IsInitialized = false;

        public void Init()
        {
            this.Position = new Position {
                TopLeft = {
                    [0] = (float) Configuration.Json.SelectToken("topLeft[0]"),
                    [1] = (float) Configuration.Json.SelectToken("topLeft[1]")
                },
                Center = {
                    [0] = (float) Configuration.Json.SelectToken("center[0]"),
                    [1] = (float) Configuration.Json.SelectToken("center[1]")
                },
                BottomRight = {
                    [0] = (float) Configuration.Json.SelectToken("bottomRight[0]"),
                    [1] = (float) Configuration.Json.SelectToken("bottomRight[1]")
                },
                Zoom = (float) Configuration.Json.SelectToken("zoom"),
                Width = (float) Configuration.Json.SelectToken("width"),
                Height = (float) Configuration.Json.SelectToken("height")
            };
        }



        public void SetPosition(float[] topLeft, float[] center, float[] bottomRight, float zoom, float width, float height)
        {
            IsInitialized = true;
            Position.TopLeft = topLeft;
            Position.Center = center;
            Position.BottomRight = bottomRight;
            Position.Zoom = zoom;
            Position.Width = width;
            Position.Height = height;
        }

        public Position GetPosition()
        {
            return Position;
        }

    }
    public class Position
    {
        public float[] TopLeft { get; set; }
        public float[] Center { get; set; }
        public float[] BottomRight { get; set; }
        public float Zoom { get; set; }
        public float Width { get; set; }
        public float Height { get; set; }
        public Position()
        {
            this.TopLeft = new float[2];
            this.Center = new float[2];
            this.BottomRight = new float[2];
            this.Zoom = 1;
            this.Width = 1;
            this.Height = 1;
        }
    }
}