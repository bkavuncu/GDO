using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Helpers;
using GDO.Core;
using Newtonsoft.Json;

namespace GDO.Modules.EyeTracking.Core
{
    public class Marker
    {
        public string Id;
        public string Name;
        public int NodeId;
        public int [,] DataMatrix;
        public float[] X;
        public float[] Y;
        public float Angle;

        [JsonIgnore]
        public MarkerData[] Cache;

        public void Init(string id,string name, int nodeId, int[,] dataMatrix, int markerSize, int cacheSize)
        {
            this.Id = id;
            this.Name = name;
            this.NodeId = nodeId;
            this.DataMatrix = dataMatrix;
            this.X = new float[4];
            this.Y = new float[4];
            X[0] = ((Cave.Nodes[nodeId].Col+1)*Cave.Nodes[nodeId].Width) - markerSize;
            X[1] = ((Cave.Nodes[nodeId].Col+1) * Cave.Nodes[nodeId].Width) - markerSize;
            X[2] = ((Cave.Nodes[nodeId].Col+1)*Cave.Nodes[nodeId].Width);
            X[3] = ((Cave.Nodes[nodeId].Col+1)*Cave.Nodes[nodeId].Width);
            Y[0] = ((Cave.Nodes[nodeId].Row+1) * Cave.Nodes[nodeId].Height);
            Y[1] = ((Cave.Nodes[nodeId].Row+1) * Cave.Nodes[nodeId].Height) - markerSize;
            Y[2] = ((Cave.Nodes[nodeId].Row+1) * Cave.Nodes[nodeId].Height) - markerSize;
            Y[3] = ((Cave.Nodes[nodeId].Row+1) * Cave.Nodes[nodeId].Height);
            //TODO Calculate angle
            this.Cache = new MarkerData[cacheSize];
        }
    }
}