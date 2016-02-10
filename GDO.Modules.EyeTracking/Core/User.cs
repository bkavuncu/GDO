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
        public TcpClient ClientSocket { get; set; }
        public object[] PacketOrder { get; set; }
        public MarkerData[] MarkerData { get; set; }
        public EyeData EyeData { get; set; }
        public TrackData[] TrackCache { get; set; }

        public string noise = "\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0";

        public void Init(int id, int numMarkers, int cacheSize)
        {
            Id = id;
            IsConnected = false;
            IsReceiving = false;
            Thread = new Thread(this.StartTCPClient);
            MarkerData = new MarkerData[numMarkers];
            TrackCache = new TrackData[cacheSize];
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
                    if (data == noise)
                    {
                        StopTCPClient();
                    }
                    ProcessPacket(data);
                    IsReceiving = true;
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
                PacketOrder = new object[headerLine.Count];
                for (int i = 0; i < headerLine.Count; i++)
                {
                    string tmp = headerLine[i].Substring(5);
                    int index = tmp.IndexOf(" ");
                    string markerName = tmp.Substring(0, index);
                    string axis = tmp.Substring(index, index + 1);
                    if (markerName == "Gaze")
                    {
                        if (axis == "X")
                        {
                            PacketOrder[i] = EyeData.X;
                        }
                        else if (axis == "Y")
                        {
                            PacketOrder[i] = EyeData.Y;
                        }
                    }
                    else
                    {
                        string point = tmp.Substring(index + 1, index + 2);
                        for (int j=0; j< ((EyeTrackingModule) Cave.Modules["EyeTracking"]).Markers.Length; j++)
                        {

                            if (((EyeTrackingModule)Cave.Modules["EyeTracking"]).Markers[j].Name == markerName)
                            {
                                if (axis == "X")
                                {
                                    PacketOrder[i] = MarkerData[j].X[Convert.ToInt32(point)];
                                }
                                else if(axis == "Y")
                                {
                                    PacketOrder[i] = MarkerData[j].Y[Convert.ToInt32(point)];
                                }
                                
                            }
                        }
                    }
                }
                startLine = 1;
            }

            for (int i = startLine; i < lines.Count; i++)
            {
                List<string> line = Utilities.ParseString(lines[0], "\t", true);
                for (int j = 0; j < line.Count; j++)
                {
                    PacketOrder[j] = Convert.ToDouble(line[j]);
                }
                PositionData position = CalculatePosition(MarkerData, EyeData);

            }

        }


        public PositionData CalculatePosition(MarkerData[] markerData, EyeData eyeData)
        { 
            double totalX = 0;
            double totalY = 0;
            double totalCount = 0;
            PositionData position = new PositionData();
            for (int i = 0; i < Cave.Cols * Cave.Rows; i++)
            {
                double[] offset = markerData[i].CalculateOffset(eyeData.X, eyeData.Y, ((EyeTrackingModule)Cave.Modules["EyeTracking"]).MarkerSize);
                if (offset != null)
                {
                    totalX += offset[0] * offset[2];
                    totalY += offset[1] * offset[2];
                    totalCount += offset[2];
                }
            }
            position.X = Convert.ToInt32(totalX / totalCount);
            position.Y = Convert.ToInt32(totalY / totalCount);
            int col = position.X / Cave.Nodes[0].Width;
            int row = position.Y / Cave.Nodes[0].Height;
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


    }
}