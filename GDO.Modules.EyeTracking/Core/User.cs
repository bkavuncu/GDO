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
        public bool IsHeatmapVisible { get; set; }   
        //public int HeatmapMax { get; set; }
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
            IsHeatmapVisible = false;
            //TrackQueue = new Queue<TrackData>(TrackQueueSize+1);
            MaxOffset = Convert.ToInt32(Math.Sqrt(Math.Pow((Cave.Cols/4)* Cave.NodeWidth, 2) + Math.Pow((Cave.Rows/2) * Cave.NodeHeight, 2)));
        }

        public void Clear(int id, int cacheSize)
        {
            MarkerData = new MarkerData[NumMarkers];
            EyeData = new EyeData();
            TrackCache = new TrackData[cacheSize];
            //HeatmapMax = 35;
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
            lock (Cave.ModuleLocks["EyeTracking"])
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
                                PacketOrder[i] = new int[3] {-1, 0, 0};
                            }
                            else if (axis == "Y")
                            {
                                PacketOrder[i] = new int[3] {-1, 1, 0};
                            }
                        }
                        else
                        {
                            string point = tmp.Substring(index + 2, 1);
                            for (int j = 0; j < ((EyeTrackingModule) Cave.Modules["EyeTracking"]).Markers.Length; j++)
                            {

                                if (((EyeTrackingModule) Cave.Modules["EyeTracking"]).Markers[j].Name == markerName)
                                {
                                    if (axis == "X")
                                    {
                                        PacketOrder[i] = new int[3] {j, 0, Convert.ToInt32(point) - 1};
                                    }
                                    else if (axis == "Y")
                                    {
                                        PacketOrder[i] = new int[3] {j, 1, Convert.ToInt32(point) - 1};
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
                            MarkerData[PacketOrder[j][0]].Angle = ((EyeTrackingModule) Cave.Modules["EyeTracking"]).Markers[PacketOrder[j][0]].Angle;

                        }
                    }
                    PositionData position = CalculateOverallPosition(MarkerData, EyeData);
                    //LocationData location = CalculateOverallLocation(MarkerData);
                    if (position != null)
                    {
                        TimeSpan t = DateTime.UtcNow - new DateTime(1970, 1, 1);
                        int secondsSinceEpoch = (int) t.TotalSeconds;
                        TrackData trackData = new TrackData();
                        trackData.setPosition(Id, position);
                        trackData.TimeStamp = secondsSinceEpoch;
                        //trackData.setLocation(location);
                        //if (TrackQueue.Count < TrackQueueSize)
                        //{
                        //    TrackQueue.Enqueue(trackData);
                        // }
                        //else
                        //{
                        //    ((EyeTrackingModule)Cave.Modules["EyeTracking"]).CallBackFunction(JsonConvert.SerializeObject(TrackQueue.ToArray()));
                        //    TrackQueue.Clear();
                        //}
                        ((EyeTrackingModule) Cave.Modules["EyeTracking"]).CallBackFunction(
                            JsonConvert.SerializeObject(trackData));
                    }
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


        public PositionData CalculateOverallPosition(MarkerData[] markerData, EyeData eyeData)
        {
            try
            {
                if (eyeData == null || eyeData.X <= -1920 || eyeData.Y <= -1080 || eyeData.X > 1920 * 2 || eyeData.Y > 1080 * 2)
                {
                    return null;
                }
                if (eyeData.X == 0 && eyeData.Y == 0)
                {
                    eyeData.X = 1920 / 2;
                    eyeData.Y = 1080 / 2;
                }
                double totalX = 0;
                double totalY = 0;
                double totalCount = 0;
                PositionData position = new PositionData();
                for (int i = 0; i < Cave.Cols * Cave.Rows; i++)
                {
                    double[] offset = markerData[i].CalculateOffset(eyeData.X, eyeData.Y, ((EyeTrackingModule)Cave.Modules["EyeTracking"]).MarkerSize * 6);
                    if (offset != null && MaxOffset - offset[2] > 0)
                    {
                        totalX += (offset[0] + ((EyeTrackingModule)Cave.Modules["EyeTracking"]).Markers[i].X[3] + ((EyeTrackingModule)Cave.Modules["EyeTracking"]).MarkerSize) * (MaxOffset - offset[2]);
                        totalY += (offset[1] + ((EyeTrackingModule)Cave.Modules["EyeTracking"]).Markers[i].Y[3] + ((EyeTrackingModule)Cave.Modules["EyeTracking"]).MarkerSize) * (MaxOffset - offset[2]);
                        totalCount += MaxOffset - offset[2];
                    }
                }
                if (totalX > 0 && totalY > 0)
                {
                    double x = Convert.ToInt32(totalX / totalCount);
                    double y = Convert.ToInt32(totalY / totalCount);
                    int col = Convert.ToInt32(Math.Floor(x / Cave.NodeWidth));
                    int row = Convert.ToInt32(Math.Floor(y / Cave.NodeHeight));
                    position.NodeId = Cave.GetNodeId(col, row);
                    position.X = Convert.ToInt32(x - (double)(col * Cave.NodeWidth));
                    position.Y = Convert.ToInt32(y - (double)(row * Cave.NodeHeight));
                    return position;
                }
                else
                {
                    return null;
                }
            }
            catch (Exception e)
            {
                return null;
            }
        }

        public LocationData CalculateOverallLocation(MarkerData[] data)
        {
            try
            {
                List<LocationData> locationDatas = new List<LocationData>();
                for (int i = 0; i < Cave.Cols * Cave.Rows; i++)
                {
                    for (int j = 0; j < Cave.Cols * Cave.Rows; j++)
                    {
                        if (data[i].VisibleCheck1() && data[j].VisibleCheck1() && data[i].VisibleCheck2() && data[j].VisibleCheck2() && i != j && j > i)
                        {
                            data[i].CalculateAngle();
                            data[j].CalculateAngle();
                            if (data[i].VisibleCheck4() && data[j].VisibleCheck4())
                            {
                                LocationData a = CalculateLocation(data[i], data[j]);
                                if (a != null)
                                {
                                    locationDatas.Add(a);
                                }
                            }
                            /*LocationData temp = new LocationData();
                            temp.Angle = Convert.ToInt32((data[i].AngleOffset + data[j].AngleOffset)/2);
                            LocationData temp2 = CalculateLocation(data[i], data[j]);
                            temp.Priority = temp2.Priority;
                            temp.Distance = Convert.ToInt32(temp2.Priority * 100);
                            locationDatas.Add(temp);*/
                        }
                    }
                }
                double totalAngle = 0;
                double totalDistance = 0;
                double totalPriority = 0;
                foreach (LocationData eachData in locationDatas)
                {
                    totalAngle += eachData.Angle * eachData.Priority;
                    totalDistance += eachData.Distance * eachData.Priority;
                    totalPriority += eachData.Priority;
                }
                LocationData overallLocationData = new LocationData();
                if (totalPriority > 0)
                {
                    overallLocationData.Angle = Convert.ToInt32(totalAngle / totalPriority);
                    overallLocationData.Distance = Convert.ToInt32(totalDistance / totalPriority);
                }
                else
                {
                    overallLocationData.Angle = 0;
                    overallLocationData.Distance = 0;
                }
                return overallLocationData;
            }
            catch (Exception e)
            {
                LocationData overallLocationData = new LocationData();
                overallLocationData.Angle = 0;
                overallLocationData.Distance = 0;
                return overallLocationData;
            }
        }

        public LocationData CalculateLocation(MarkerData a, MarkerData b)
        {
            try
            {
                double r1 = Math.Sin((Math.PI / 180) * (Math.Abs(a.AngleOffset))) / Math.Sin((Math.PI / 180) * (90 - 2 - a.AngleOffset));
                double r2 = Math.Sin((Math.PI / 180) * (Math.Abs(b.AngleOffset))) / Math.Sin((Math.PI / 180) * (90 - 2 + b.AngleOffset));
                double eq = (r1 * r2);
                double alpha = Math.Abs(a.Angle - 0);
                double beta = Math.Abs(b.Angle - 0);
                double temp = 0;
                int angle = 0;
                int distance = 0;

                double minDifference = double.MaxValue;
                int min = 0;
                int max = 360;
                if (a.AngleOffset < 0 && b.AngleOffset < 0)
                {
                    max = Convert.ToInt32(a.Angle);
                    distance = Convert.ToInt32(100 *r2);
                }
                else if (a.AngleOffset > 0 && b.AngleOffset < 0)
                {
                    min = Convert.ToInt32(a.Angle);
                    max = Convert.ToInt32(b.Angle);
                    //distance = Convert.ToInt32(100 * ((r1+r2)/2));
                    //distance = Convert.ToInt32(100/(Cave.NodeHeight/((a.A + a.C + b.A + b.C))));
                    distance = Convert.ToInt32(200/(a.A + a.C + b.A + b.C)) - 100;
                }
                else if (a.AngleOffset > 0 && b.AngleOffset > 0)
                {
                    min = Convert.ToInt32(b.Angle);
                    distance = Convert.ToInt32(100 * r1);
                }

                for (int i = min; i < max; i++)
                {
                    alpha = Math.Abs(a.Angle - i);
                    beta = Math.Abs(b.Angle - i);
                    if (alpha > beta)
                    {
                        temp = Math.Sin((Math.PI / 180) * (beta)) / Math.Sin((Math.PI / 180) * (alpha));
                    }
                    else
                    {
                        temp = Math.Sin((Math.PI / 180) * (alpha)) / Math.Sin((Math.PI / 180) * (beta));
                    }
                    var difference = Math.Abs(temp - eq);
                    if (minDifference > difference)
                    {
                        minDifference = (double)difference;
                        angle = i;
                    }
                }

                LocationData data = new LocationData();
                if(distance<0){
                    angle = angle +180;
                    distance = Math.Abs(distance);
                }
                data.Angle = 360 - angle;
                data.Distance = distance;
                data.Priority = (a.Priority + b.Priority) / 2;
                return data;
            }
            catch (Exception e)
            {
                return null;
            }
        }
    }
}
