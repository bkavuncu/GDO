using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using System.Web;
using GDO.Core;
using GDO.Modules.EyeTracking.Core;
using GDO.Utility;
using Microsoft.AspNet.SignalR;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace GDO.Modules.EyeTracking
{
    public class EyeTrackingModule : IModule
    {
        public string Name { get; set; }
        public bool MarkerMode { get; set; }
        public bool CursorMode { get; set; }
        public int MarkerSize { get; set; }
        public int CursorSize { get; set; }
        public int CacheSize { get; set; }
        public int NumUsers { get; set; } = 4;
        public int MainPort = 11000;
        public Marker[]  Markers { get; set; }
        public User[] Users { get; set; }

        public void Init()
        {
            this.Name = "EyeTracking";
            this.MarkerMode = false;
            this.CursorMode = false;
            this.MarkerSize = 21;
            this.CursorSize = 210;
            this.CacheSize = 1000;
            string path = Directory.GetCurrentDirectory() + @"\Data\EyeTracking";
            if (Directory.Exists(path))
            {
                string[] filePaths = Directory.GetFiles(@path, "QRCodes.json", SearchOption.AllDirectories);
                JObject json = Utilities.LoadJsonFile(filePaths[0]);
                if (json != null)
                {
                    Markers = new Marker[Cave.Cols * Cave.Rows];
                    for (int i = 0; i < Cave.Cols * Cave.Rows; i++)
                    {
                        string id = json.SelectToken("OfficialQRCodeMarkers["+i+"].code").ToString();
                        string name = json.SelectToken("OfficialQRCodeMarkers[" + i + "].name").ToString();
                        int[,] dataMatrix = new int[4,4];
                        for (int j = 0; j < 4; j++)
                        {
                            for (int k = 0; k < 4; k++)
                            {
                                dataMatrix[j, k] = Int32.Parse(json.SelectToken("OfficialQRCodeMarkers[" + i + "].pattern[" + j + "][" + k +"]").ToString());
                            }
                        }
                        Markers[i] = new Marker();
                        Markers[i].Init(id,name,i+1,dataMatrix,MarkerSize,CacheSize);
                    }
                }
            }
            Users = new User[NumUsers + 1];
            for (int i = 1; i < NumUsers+1; i++)
            {
                Users[i] = new User();
                Users[i].Id = i;
                Users[i].IsListening = false;
                Users[i].Port = MainPort + i;
                Users[i].Thread = new Thread(Users[i].StartTCPListener);
            }
        }

        public string SerializeMarkers()
        {
            return JsonConvert.SerializeObject(Markers);
        }

        public string SerializeJSON()
        {
            return JsonConvert.SerializeObject(this);
        }

        public void ReceivedData()
        {

        }
        public PositionData CalculatePosition(MarkerData[] data, double x, double y)
        {

            double totalX = 0;
            double totalY = 0;
            double totalCount = 0;
            PositionData position = new PositionData();
            for (int i = 0; i < Cave.Cols*Cave.Rows; i++)
            {
                double[] offset = data[i].CalculateOffset(x, y, MarkerSize);
                if (offset != null)
                {
                    totalX += offset[0]* offset[2];
                    totalY += offset[1]* offset[2];
                    totalCount += offset[2];
                }
            }
            position.X = Convert.ToInt32(totalX/totalCount);
            position.Y = Convert.ToInt32(totalY / totalCount);
            int col = position.X/Cave.Nodes[0].Width;
            int row = position.Y/Cave.Nodes[0].Height;
            position.NodeId = Cave.GetNodeId(col, row);
            position.X = position.X - (col * Cave.Nodes[0].Width);
            position.Y = position.Y - (row * Cave.Nodes[0].Height);
            return position;
        }

        public LocationData CalculateLocation(MarkerData[] data)
        {
            //calculate angle on each marker
            //calulate location
            return null;
        }

        public void BroadcastData(string data)
        {
            var context = GlobalHost.ConnectionManager.GetHubContext<EyeTrackingModuleHub>();
            context.Clients.All.receiveData(data);
        }
    }
}