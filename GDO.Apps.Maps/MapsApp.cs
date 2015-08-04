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

        public void SetGlobalMapPosition(double longtitude, double latitude, double resolution, int zoom)
        {
            initialUpload = true;
            Global = new MapPosition(longtitude,latitude,resolution,zoom,Section.Width,Section.Height);
        }

        public MapPosition GetLocalMapPosition(int sectionCol, int sectionRow)
        {
            MapPosition Local = new MapPosition();
            Local.Resolution = Global.Resolution / (Section.NumNodes/2);
            Local.Width = (Cave.NodeWidth*sectionCol) - (Cave.NodeWidth/2);
            Local.Height = (Cave.NodeHeight * sectionRow) - (Cave.NodeHeight / 2);
            double dn = Section.Pixels * ((Section.Height/ 2) - Local.Height);
            double de = Section.Pixels * (Local.Width - (Section.Width / 2));
            double dLat = (dn / R) * 180 / Math.PI;
            double dLon = (de / (R * Math.Cos(Global.Latitude * Math.PI / 180))) * 180 / Math.PI;
            Local.Latitude = Global.Latitude + dLat;
            Local.Longtitude = Global.Longtitude + dLon;
            return Local;
        }
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
        public double Longtitude { get; set; }
        public double Latitude { get; set; }
        public double Resolution { get; set; }
        public int Zoom { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
        public MapPosition()
        {
            this.Longtitude = -1;
            this.Latitude = -1;
            this.Resolution = -1;
            this.Zoom = -1;
            this.Width = -1;
            this.Height = -1;
        }
        public MapPosition(double longtitude, double latitude, double resolution, int zoom, int width, int height)
        {
            this.Longtitude = longtitude;
            this.Latitude = latitude;
            this.Resolution = resolution;
            this.Zoom = zoom;
            this.Width = width;
            this.Height = height;
        }
    }
}