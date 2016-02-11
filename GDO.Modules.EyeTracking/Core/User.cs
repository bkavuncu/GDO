using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Threading;
using System.Web;
using GDO.Core;
using GDO.Utility;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Infrastructure;
using Newtonsoft.Json;

namespace GDO.Modules.EyeTracking.Core
{
    public class User
    {
        public int Id { get; set; }

        public bool IsConnected { get; set; }
        public bool IsReceiving { get; set; }
        public Thread Thread { get; set; }
        public string IP { get; set; }
        public int Port { get; set; }
        public int NumMarkers { get; set; }
        public TcpClient ClientSocket { get; set; }
        public int[][] PacketOrder { get; set; }
        public MarkerData[] MarkerData { get; set; }
        public EyeData EyeData { get; set; }
        public TrackData[] TrackCache { get; set; }
        //public Queue<TrackData> TrackQueue { get; set; }
        //public int TrackQueueSize = 10; 
        public int MaxOffset { get; set; }

        public string noise = "\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0";

        public void Init(int id, int numMarkers, int cacheSize)
        {
            Id = id;
            IsConnected = false;
            IsReceiving = false;
            Thread = new Thread(this.StartTCPClient);
            NumMarkers = numMarkers;
            MarkerData = new MarkerData[NumMarkers];
            EyeData = new EyeData();
            TrackCache = new TrackData[cacheSize];
            //TrackQueue = new Queue<TrackData>(TrackQueueSize+1);
            MaxOffset = Convert.ToInt32(Math.Sqrt(Math.Pow((Cave.Cols/2)* Cave.NodeWidth, 2) + Math.Pow((Cave.Rows) * Cave.NodeHeight, 2)));
        }

        public void StartTCPClient()
        {
            ClientSocket = new System.Net.Sockets.TcpClient();
            bool IsInitialized = false;
            try
            {

                ClientSocket.Connect(IP,Port);
                IsConnected = true;
            }
            catch (Exception e)
            {
                IsConnected = false;
                IsReceiving = false;
                Console.WriteLine(e.ToString());
            }

            while (IsConnected)
            {
                try
                {
                    NetworkStream networkStream = ClientSocket.GetStream();
                    byte[] bytes = new byte[6144];
                    networkStream.Read(bytes, 0, bytes.Length);
                    string data = System.Text.Encoding.ASCII.GetString(bytes);
                    if (Cave.Nodes == null)
                    {
                        StopTCPClient();
                    }
                    else
                    {
                        ProcessPacket(data);
                        IsReceiving = true;
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e.ToString());
                }
            }
            try
            {
                ClientSocket.Close();
                IsConnected = false;
                IsReceiving = false;
            }
            catch (Exception e)
            {
                Console.WriteLine(e.ToString());
            }

        }

        public void StopTCPClient()
        {
            IsConnected = false;
            IsReceiving = false;
            try
            {
                ClientSocket.Close();
                //var context = GlobalHost.ConnectionManager.GetHubContext<EyeTrackingModuleHub>();
                //context.Clients.All.receiveConnectionStatus(Id, IsListening);
            }
            catch (Exception e)
            {
                Console.WriteLine(e.ToString());
            }
        }
        public void ProcessPacket(string data)
        {
            List<string> lines = Utilities.ParseString(data, "\r\n", false);
            int startLine = 0;
            if (!IsReceiving)
            {
                List<string> headerLine = Utilities.ParseString(lines[0], "\t", true);
                PacketOrder = new int[headerLine.Count][];
                for (int i = 0; i < headerLine.Count; i++)
                {
                    string tmp = headerLine[i].Substring(5);
                    int index = tmp.IndexOf(" ");
                    string markerName = tmp.Substring(0, index);
                    string axis = tmp.Substring(index + 1, 1);
                    if (markerName == "Gaze")
                    {
                        if (axis == "X")
                        {
                            PacketOrder[i] = new int[3] { -1, 0, 0 };
                        }
                        else if (axis == "Y")
                        {
                            PacketOrder[i] = new int[3] { -1, 1, 0 };
                        }
                    }
                    else
                    {
                        string point = tmp.Substring(index + 2, 1);
                        for (int j=0; j< ((EyeTrackingModule) Cave.Modules["EyeTracking"]).Markers.Length; j++)
                        {

                            if (((EyeTrackingModule)Cave.Modules["EyeTracking"]).Markers[j].Name == markerName)
                            {
                                if (axis == "X")
                                {
                                    PacketOrder[i] = new int[3] { j, 0, Convert.ToInt32(point) -1};
                                }
                                else if(axis == "Y")
                                {
                                    PacketOrder[i] = new int[3] { j, 1, Convert.ToInt32(point) - 1 };
                                }
                                
                            }
                        }
                    }
                }
                startLine = 1;
            }

            for (int i = startLine; i < lines.Count; i++)
            {
                ResetTempData();
                List<string> line = Utilities.ParseString(lines[0], "\t", true);
                for (int j = 0; j < line.Count; j++)
                {
                    if (PacketOrder[j][0] == -1)
                    {
                        if (PacketOrder[j][1] == 0)
                        {
                            EyeData.X = Convert.ToDouble(line[j]);
                        }
                        else if (PacketOrder[j][1] == 1)
                        {
                            EyeData.Y = Convert.ToDouble(line[j]);
                        }
                    }
                    else
                    {
                        if (PacketOrder[j][1] == 0)
                        {
                            MarkerData[PacketOrder[j][0]].X[PacketOrder[j][2]] = Convert.ToDouble(line[j]);
                        }
                        else if (PacketOrder[j][1] == 1)
                        {
                            MarkerData[PacketOrder[j][0]].Y[PacketOrder[j][2]] = Convert.ToDouble(line[j]);
                        }
                       
                    }
                }
                PositionData position = CalculatePosition(MarkerData, EyeData);
                if (position != null)
                {
                    TimeSpan t = DateTime.UtcNow - new DateTime(1970, 1, 1);
                    int secondsSinceEpoch = (int)t.TotalSeconds;
                    TrackData trackData = new TrackData();
                    trackData.setPosition(Id, position);
                    trackData.TimeStamp = secondsSinceEpoch;
                    //if (TrackQueue.Count < TrackQueueSize)
                    //{
                    //    TrackQueue.Enqueue(trackData);
                    // }
                    //else
                    //{
                    //    ((EyeTrackingModule)Cave.Modules["EyeTracking"]).CallBackFunction(JsonConvert.SerializeObject(TrackQueue.ToArray()));
                    //    TrackQueue.Clear();
                    //}
                    ((EyeTrackingModule) Cave.Modules["EyeTracking"]).CallBackFunction(JsonConvert.SerializeObject(trackData));
                }
            }

        }

        public void ResetTempData()
        {
            MarkerData = new MarkerData[NumMarkers];
            for (int i = 0; i < NumMarkers; i++)
            {
                MarkerData[i] = new MarkerData();
            }
            EyeData = new EyeData();
        }


        public PositionData CalculatePosition(MarkerData[] markerData, EyeData eyeData)
        {
            if (eyeData == null || eyeData.X <= -1920 || eyeData.Y <= -1080 || eyeData.X > 1920*2 || eyeData.Y > 1080*2)
            {
                return null;
            }
            double totalX = 0;
            double totalY = 0;
            double totalCount = 0;
            PositionData position = new PositionData();
            for (int i = 0; i < Cave.Cols * Cave.Rows; i++)
            {
                double[] offset = markerData[i].CalculateOffset(eyeData.X, eyeData.Y, ((EyeTrackingModule)Cave.Modules["EyeTracking"]).MarkerSize*6);
                if (offset != null)
                {
                    totalX += (offset[0] + ((EyeTrackingModule)Cave.Modules["EyeTracking"]).Markers[i].X[3] + ((EyeTrackingModule)Cave.Modules["EyeTracking"]).MarkerSize) * (MaxOffset - offset[2]);
                    totalY += (offset[1] + ((EyeTrackingModule)Cave.Modules["EyeTracking"]).Markers[i].Y[3] + ((EyeTrackingModule)Cave.Modules["EyeTracking"]).MarkerSize) * (MaxOffset - offset[2]);
                    totalCount += MaxOffset - offset[2];
                }
            }
            if (totalX > 0 && totalY > 0)
            {
                double x = Convert.ToInt32(totalX/totalCount);
                double y = Convert.ToInt32(totalY/totalCount);
                int col = Convert.ToInt32(Math.Floor(x/Cave.NodeWidth));
                int row = Convert.ToInt32(Math.Floor(y/Cave.NodeHeight));
                position.NodeId = Cave.GetNodeId(col, row);
                position.X = Convert.ToInt32(x - (double) (col*Cave.NodeWidth));
                position.Y = Convert.ToInt32(y - (double) (row*Cave.NodeHeight));
                return position;
            }
            else
            {
                return null;
            }
        }

        public LocationData CalculateLocation(MarkerData[] data)
        {
            //calculate angle on each marker
            //calulate location
            return null;
        }
    }
}