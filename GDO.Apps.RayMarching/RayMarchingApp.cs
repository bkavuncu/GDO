using System;
using GDO.Core;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Threading;
using GDO.Core.Apps;
using Microsoft.AspNet.SignalR;

namespace GDO.Apps.RayMarching
{
    public class RayMarchingApp : IBaseAppInstance
    {
        public int Id { get; set; }
        public string AppName { get; set; }
        public App App { get; set; }
        public Section Section { get; set; }
        public AppConfiguration Configuration { get; set; }
        public bool IntegrationMode { get; set; }
        public ICompositeAppInstance ParentApp { get; set; }

        public float XRot;
        public float YRot;
        public float XTrans;
        public float YTrans;
        public float ZTrans;

        private Object Lock;
        private bool JoystickRunning;

        private float RotAngle;
        private float RotMagnitude;
        private bool RotJoystickUpdate;
        private float RotDeltaX;
        private float RotDeltaY;

        private float MoveAngle;
        private float MoveMagnitude;
        private float MoveHeightVal;
        private bool MoveJoystickUpdate;
        private float MoveDeltaX;
        private float MoveDeltaY;
        private float MoveDeltaZ;

        public int SyncTime;

        public int Nodes;
        public int NewNodes;
        public int Acks;
        public int SwapFrameAcks;
        public int CurrentFrame;
        public int[] NodesOnline;

        public int[] SwapFrameNodesAcked;
        public int[] RenderedFrameNodesAcked;
        public byte[][] Freqs;

        public bool Sync;

        public bool rendering;
        public bool swapping;

        public void Init()
        {
            rendering = true;
            swapping = false;

            XRot = 0.0f;
            YRot = 0.0f;
            XTrans = 0.0f;
            YTrans = 0.0f;
            ZTrans = -2.0f;
            
            Lock = new object();
            JoystickRunning = false;

            RotAngle = 0.0f;
            RotMagnitude = 0.0f;
            RotJoystickUpdate = false;
            RotDeltaX = 0.0f;
            RotDeltaY = 0.0f;

            MoveAngle = 0.0f;
            MoveMagnitude = 0.0f;
            MoveHeightVal = 0.0f;
            MoveJoystickUpdate = false;
            MoveDeltaX = 0.0f;
            MoveDeltaY = 0.0f;
            MoveDeltaZ = 0.0f;

            Nodes = 0;
            NewNodes = 0;
            Acks = 0;
            SwapFrameAcks = 0;
            CurrentFrame = 0;
            NodesOnline = new int[64];

            SwapFrameNodesAcked = new int[64];
            RenderedFrameNodesAcked = new int[64];
            Freqs = new byte[64][];

            Sync = true;

            SyncTime = 100;
    }

        private const double Sensitivity = 0.0025;

        private bool Started = false;
        public void JoystickInit(RayMarchingAppHub appHub, int instanceId)
        {
            if (!Started)
            {
                JoystickRunning = true;
                new Thread(() => JoystickThread(appHub, instanceId)).Start();
                Started = true;
            }
        }

        public void JoystickThread(RayMarchingAppHub appHub, int instanceId)
        {
            while (JoystickRunning)
            {

                {
                    if (RotJoystickUpdate)
                    {
                        RotDeltaX = (float) (Sensitivity * RotMagnitude * Math.Sin(RotAngle));
                        RotDeltaY = (float) (Sensitivity * RotMagnitude * Math.Cos(RotAngle));

                        RotJoystickUpdate = false;
                    }

                    if (MoveJoystickUpdate)
                    {
                        float Forward = -(float)(5 * Sensitivity * MoveMagnitude * Math.Cos(MoveAngle));
                        float Strafe  = (float)(5 * Sensitivity * MoveMagnitude * Math.Sin(MoveAngle));

                        MoveDeltaX = (float) ((-Forward * Math.Sin(XRot) * Math.Cos(YRot)) + (Strafe * Math.Cos(XRot) * Math.Cos(YRot)));
                        MoveDeltaY = (float) (-Forward * Math.Sin(YRot));
                        MoveDeltaZ = (float) ((Forward * Math.Cos(XRot) * Math.Cos(YRot)) + (Strafe * Math.Sin(XRot) * Math.Cos(YRot)));

                        MoveJoystickUpdate = false;
                    }

                    XRot -= RotDeltaX;
                    YRot += RotDeltaY;

                    XTrans += MoveDeltaX;
                    YTrans += MoveDeltaY + MoveHeightVal * 5 * (float) Sensitivity;
                    ZTrans += MoveDeltaZ;

                    appHub.SendParams(instanceId);
                }

                Thread.Sleep(15);
            }
        }

        public void JoystickUpdateParamsRot(float angle, float magnitude)
        {

            {
                this.RotAngle = angle;
                this.RotMagnitude = magnitude;
                this.RotJoystickUpdate = true;
            }
        }

        public void JoystickUpdateParamsMove(float angle, float magnitude)
        {

            {
                this.MoveAngle = angle;
                this.MoveMagnitude = magnitude;
                this.MoveJoystickUpdate = true;
            }
        }


        public void JoystickTerminate()
        {
            Started = false;
            JoystickRunning = false;
        }

        public void HeightSliderUpdateParamsMove(float val)
        {

            {
                MoveHeightVal = val;
            }
        }
    }
}