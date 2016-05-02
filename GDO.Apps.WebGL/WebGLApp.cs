using System;
using GDO.Core;
using GDO.Core.Apps;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace GDO.Apps.WebGL
{
    public class WebGLApp : IBaseAppInstance
    {
        public int Id { get; set; }
        public string AppName { get; set; }
        public Section Section { get; set; }
        public AppConfiguration Configuration { get; set; }
        public bool IntegrationMode { get; set; }
        public IAdvancedAppInstance ParentApp { get; set; }

        public Camera Camera { get; set; }

        public bool CollectPerformanceData { get; set; }
        public Dictionary<int, List<PerformanceData>> PerformanceData { get; set; }

        public void Init()
        {
            this.Camera = new Camera();
        }

        public void AddNewPerformanceData(int nodeId, PerformanceData data)
        {
            if (!CollectPerformanceData) return;

            List<PerformanceData> dataList = PerformanceData[nodeId];

            if (dataList == null)
            {
                dataList = new List<PerformanceData>();
                PerformanceData[nodeId] = dataList;
            }

            dataList.Add(data);
        }
    }

    public class PerformanceData
    {
        public float timeStamp;

        public int totalVertices;
        public int activeMeshes;
        public int totalMeshes;
        public float maxFrameDuration;
        public float averageFrameDuration;
        public float minFrameDuration;
        public float FPS;
    }

    public class Camera
    {
        public float[] position { get; set; }
        public float[] upVector { get; set; }
        public float GDORotation;
        public float GDORotationOffset;

        public Camera()
        {
            this.position = new float[] {0,0,0};
            this.upVector = new float[] {0,1,0};
            this.GDORotation = 0;
            this.GDORotationOffset = 0;
        }
    }
}