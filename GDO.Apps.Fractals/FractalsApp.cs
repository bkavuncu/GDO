using System;
using GDO.Core;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Threading;

namespace GDO.Apps.Fractals
{
    public class FractalsApp : IBaseAppInstance
    {
        public int Id { get; set; }
        public string AppName { get; set; }
        public Section Section { get; set; }
        public AppConfiguration Configuration { get; set; }
        public bool IntegrationMode { get; set; }
        public IAdvancedAppInstance ParentApp { get; set; }

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

        public int MaxSteps;
        public float Detail;
        public float Fog;

        public int Iterations;
        public float Power;
        public float R;
        public float G;
        public float B;
        public float Scale;

        public float Ambience;
        public float LightIntensity;
        public float LightSize;

        private float LightAngle;
        private float LightMagnitude;
        private float LightHeightVal;
        private bool LightJoystickUpdate;

        private float LightXDelta;
        private float LightZDelta;

        public float LightX;
        public float LightY;
        public float LightZ;

        public int Mod;

        public int SyncTime;

        public int Nodes;
        public int NewNodes;
        public int Acks;
        public int SwapFrameAcks;
        public int CurrentFrame;
        public int[] NodesOnline;

        public bool Sync;

        public void Init()
        {
            //Section.NumNodes;////////////////////////////////
            XRot = 0.0f;
            YRot = 0.0f;
            XTrans = 0.0f;
            YTrans = 0.0f;
            ZTrans = -12.0f;// -2.0f;
            Mod = 0;
            MaxSteps = 100;
            Detail = -3.0f;
            Fog = 0.1f;
            Ambience = 0.5f;
            LightIntensity = 50.0f;
            LightSize = 0.25f;
            Iterations = 5;// 16;
            Power = 8.0f;
            Scale = 2.0f;

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

            LightAngle = 0.0f;
            LightMagnitude = 0.0f;
            LightHeightVal = 0.0f;
            LightJoystickUpdate = false;

            LightXDelta = 0.0f;
            LightZDelta = 0.0f;

            LightX = 4.0f;
            LightY = 2.0f;
            LightZ = -12.0f;//-2.0f;

            R = 1.0f;
            G = 0.0f;
            B = 0.0f;

            Nodes = 0;
            NewNodes = 0;
            Acks = 0;
            SwapFrameAcks = 0;
            CurrentFrame = 0;
            NodesOnline = new int[64];

            Sync = true;

            SyncTime = 100;
    }

        private const double Sensitivity = 0.0025;

        private bool Started = false;
        public void JoystickInit(FractalsAppHub appHub, int instanceId)
        {
            if (!Started)
            {
                JoystickRunning = true;
                new Thread(() => JoystickThread(appHub, instanceId)).Start();
                Started = true;
            }
        }

        public void JoystickThread(FractalsAppHub appHub, int instanceId)
        {
            while (JoystickRunning)
            {
                //lock(Lock)
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

                    if (LightJoystickUpdate)
                    {
                        LightZDelta = -(float)(5 * Sensitivity * LightMagnitude * Math.Cos(LightAngle));
                        LightXDelta = (float)(5 * Sensitivity * LightMagnitude * Math.Sin(LightAngle));
                    }

                    XRot -= RotDeltaX;
                    YRot += RotDeltaY;

                    XTrans += MoveDeltaX;
                    YTrans += MoveDeltaY + MoveHeightVal * 5 * (float) Sensitivity;
                    ZTrans += MoveDeltaZ;

                    LightX += LightXDelta;
                    LightY += LightHeightVal * 5 * (float)Sensitivity;
                    LightZ += LightZDelta;

                    appHub.SendParams(instanceId);
                }

                Thread.Sleep(15);
            }
        }

        public void JoystickUpdateParamsRot(float angle, float magnitude)
        {
            //lock (Lock)
            {
                this.RotAngle = angle;
                this.RotMagnitude = magnitude;
                this.RotJoystickUpdate = true;
            }
        }

        public void JoystickUpdateParamsMove(float angle, float magnitude)
        {
            //lock (Lock)
            {
                this.MoveAngle = angle;
                this.MoveMagnitude = magnitude;
                this.MoveJoystickUpdate = true;
            }
        }

        public void JoystickUpdateParamsLight(float angle, float magnitude)
        {
            //lock (Lock)
            {
                this.LightAngle = angle;
                this.LightMagnitude = magnitude;
                this.LightJoystickUpdate = true;
            }
        }

        public void JoystickTerminate()
        {
            Started = false;
            JoystickRunning = false;
        }

        public void HeightSliderUpdateParamsMove(float val)
        {
            //lock (Lock)
            {
                MoveHeightVal = val;
            }
        }

        public void HeightSliderUpdateParamsLight(float val)
        {
            //lock (Lock)
            {
                LightHeightVal = val;
            }
        }

        public void ToggleMod()
        {
            Mod *= -1;
            Mod++;
        }
    }
}