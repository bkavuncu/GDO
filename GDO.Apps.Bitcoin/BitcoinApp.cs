using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Web;
using GDO.Core;
using GDO.Utility;

namespace GDO.Apps.Bitcoin
{
    public class BitcoinApp : IAppInstance
    {
        public int Id { get; set; }
        public string AppName { get; set; }
        public Section Section { get; set; }
        public AppConfiguration Configuration { get; set; }
        
        public DisplayRegionInfo DisplayRegion { get; set; }
        public BlockRegionInfo[,] BlockRegion { get; set; }

        public class DisplayRegionInfo
        {
            public DisplayRegionInfo() {
                this.left = 0;
                this.top = 0;
                this.width = 0;
                this.height = 0;
            }
            public int left { get; set; }
            public int top { get; set; }
            public int width { get; set; }
            public int height { get; set; }
        }

        public class BlockRegionInfo 
        {
            public BlockRegionInfo() {
                this.left = 0;
                this.top = 0;
                this.width = 0;
                this.height = 0;
            }
            public int left { get; set; }
            public int top { get; set; }
            public int width { get; set; }
            public int height { get; set; }
        }

        
        public class CanvasDataInfo
        {
            public double left { get; set; }
            public double top { get; set; }
            public double width { get; set; }
            public double height { get; set; }
        }


        public void init(int instanceId, string appName, Section section, AppConfiguration configuration)
        {
            this.Id = instanceId;
            this.AppName = appName;
            this.Section = section;
            this.Configuration = configuration;

            this.DisplayRegion = new DisplayRegionInfo();
            this.BlockRegion = new BlockRegionInfo[Section.Cols, Section.Rows];
            for(int i = 0 ; i < Section.Cols ; i++) {
                for (int j = 0 ; j < Section.Rows ; j++) {
                    this.BlockRegion[i, j] = new BlockRegionInfo();
                }
            }
        }

    }
}