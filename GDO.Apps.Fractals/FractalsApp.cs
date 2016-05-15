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

        public int Iterations;
        public float Power;
        public float R;
        public float G;
        public float B;

        public float Ambience;
        public float LightIntensity;

        public int Mod;

        public void Init()
        {
            XRot = 0.0f;
            YRot = 0.0f;
            XTrans = 0.0f;
            YTrans = 0.0f;
            ZTrans = -2.0f;
            Mod = 0;
            MaxSteps = 100;
            Detail = -3.0f;
            Ambience = 0.5f;
            LightIntensity = 50.0f;
            Iterations = 16;
            Power = 8.0f;

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

            R = 1.0f;
            G = 0.0f;
            B = 0.0f;   
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
                lock(Lock)
                {
                    if (RotJoystickUpdate)
                    {
                        RotDeltaX = (float) (Sensitivity * RotMagnitude * Math.Sin(RotAngle));
                        RotDeltaY = (float) (Sensitivity * RotMagnitude * Math.Cos(RotAngle));

                        RotJoystickUpdate = false;
                    }

                    if (MoveJoystickUpdate)
                    {
                        float Forward = -(float)(5*Sensitivity * MoveMagnitude * Math.Cos(MoveAngle));
                        float Strafe  = (float)(5*Sensitivity * MoveMagnitude * Math.Sin(MoveAngle));

                        MoveDeltaX = (float) ((-Forward * Math.Sin(XRot) * Math.Cos(YRot)) + (Strafe * Math.Cos(XRot) * Math.Cos(YRot)));
                        MoveDeltaY = (float) (-Forward * Math.Sin(YRot));
                        MoveDeltaZ = (float) ((Forward * Math.Cos(XRot) * Math.Cos(YRot)) + (Strafe * Math.Sin(XRot) * Math.Cos(YRot)));

                        MoveJoystickUpdate = false;
                    }

                    XRot -= RotDeltaX;
                    YRot += RotDeltaY;

                    XTrans += MoveDeltaX;
                    YTrans += MoveDeltaY + MoveHeightVal * (float) Sensitivity * 5;
                    ZTrans += MoveDeltaZ;

                    appHub.JoystickSendParams(instanceId, XRot, YRot, XTrans, YTrans, ZTrans);
                }

                Thread.Sleep(15);
            }
        }

        public void JoystickUpdateParamsRot(float angle, float magnitude)
        {
            lock (Lock)
            {
                this.RotAngle = angle;
                this.RotMagnitude = magnitude;
                this.RotJoystickUpdate = true;
            }
        }

        public void JoystickUpdateParamsMove(float angle, float magnitude)
        {
            lock (Lock)
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
            lock (Lock)
            {
                MoveHeightVal = val;
            }
        }

        public void ToggleMod()
        {
            Mod *= -1;
            Mod++;
        }

    }
}