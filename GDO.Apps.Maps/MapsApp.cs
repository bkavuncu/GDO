using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using GDO.Core;

namespace GDO.Apps.Maps
{
    public class MapsApp : IAppInstance
    {
        public int Id { get; set; }
        public Section Section { get; set; }
        public AppConfiguration Configuration { get; set; }
        public MapPosition Global { get; set; }
        public double C = 156543.034;
        public double R = 6378137;
        public bool initialUpload = false;

        public void init(int instanceId, Section section, AppConfiguration configuration)
        {
            this.Id = instanceId;
            this.Section = section;
            this.Configuration = configuration;
        }

        public void SetGlobalMapPosition(string[] longtitude, string[] latitude, string resolution, int width, int height, int zoom)
        {
            initialUpload = true;
            Global = new MapPosition(longtitude,latitude,resolution,zoom,width,height);
        }

        /*public MapPosition GetLocalMapPosition(int sectionCol, int sectionRow)
        {
            MapPosition Local = new MapPosition();
            Local.Resolution = Global.Resolution / (Section.NumNodes/2);
            Local.Width = (Cave.NodeWidth*sectionCol) - (Cave.NodeWidth/2);
            Local.Height = (Cave.NodeHeight * sectionRow) - (Cave.NodeHeight / 2);
            string dn = Section.Pixels * ((Section.Height/ 2) - Local.Height);
            string de = Section.Pixels * (Local.Width - (Section.Width / 2));
            string dLat = (dn / R) * 180 / Math.PI;
            string dLon = (de / (R * Math.Cos(Global.Latitude[0] * Math.PI / 180))) * 180 / Math.PI;
            Local.Latitude[0] = Global.Latitude[0] + dLat;
            Local.Longtitude[0] = Global.Longtitude[0] + dLon;
            return Local;
        }*/
        public MapPosition GetGlobalMapPosition()
        {
            if (initialUpload)
            {
                return Global;
            }
            else
            {
                return null;
            }
        }
    }
    public class MapPosition
    {
        public string[] Longtitudes { get; set; }
        public string[] Latitudes { get; set; }
        public string Resolution { get; set; }
        public int Zoom { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
        public MapPosition()
        {
            this.Longtitudes = new string[5];
            this.Latitudes = new string[5];
            this.Resolution = "";
            this.Zoom = -1;
            this.Width = -1;
            this.Height = -1;
        }
        public MapPosition(string[] longtitudes, string[] latitudes, string resolution, int zoom, int width, int height)
        {
            this.Longtitudes = longtitudes;
            this.Latitudes = latitudes;
            this.Resolution = resolution;
            this.Zoom = zoom;
            this.Width = width;
            this.Height = height;
        }
    }
}