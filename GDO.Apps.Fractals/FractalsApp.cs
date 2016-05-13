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
        private float DeltaXRot;
        private float DeltaYRot;
        private float Angle;
        private float Magnitude;
        private bool JoystickUpdate;

        public int MaxSteps;
        public float Detail;

        public int Iterations;
        public float Power;

        public float Ambience;

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
            Iterations = 16;
            Power = 8.0f;

            Lock = new object();
            Angle = 0.0f;
            Magnitude = 0.0f;
            JoystickUpdate = false;
            DeltaXRot = 0.0f;
            DeltaYRot = 0.0f;
        }

        public void IncXRot()
        {
            XRot += 0.01f;
        }
        public void DecXRot()
        {
            XRot -= 0.01f;
        }

        public void IncYRot()
        {
            YRot -= 0.01f;
        }
        public void DecYRot()
        {
            YRot += 0.01f;
        }

        private const double Sensitivity = 0.005;

        public void StrafeLeft()
        {
            ZTrans += (float) (Sensitivity * Math.Cos(XRot + Math.PI / 2));
            XTrans -= (float) (Sensitivity * Math.Sin(XRot + Math.PI / 2));
        }
        public void StrafeRight()
        {
            ZTrans -= (float) (Sensitivity * Math.Cos(XRot + Math.PI / 2));
            XTrans += (float) (Sensitivity * Math.Sin(XRot + Math.PI / 2));
        }

        public void MoveForward()
        {
            ZTrans += (float) (Sensitivity * Math.Cos(XRot));
            XTrans -= (float) (Sensitivity * Math.Sin(XRot));

            YTrans -= (float) (Sensitivity * Math.Sin(YRot));
        }
        public void MoveBackward()
        {
            ZTrans -= (float)(Sensitivity * Math.Cos(XRot));
            XTrans += (float)(Sensitivity * Math.Sin(XRot));

            YTrans += (float)(Sensitivity * Math.Sin(YRot));
        }

        public void JoystickInit(FractalsAppHub appHub, int instanceId)
        {
            new Thread(() => JoystickThread(appHub, instanceId)).Start();
        }

        public void JoystickThread(FractalsAppHub appHub, int instanceId)
        {
            while (true)
            {
                lock(Lock)
                {
                    if (JoystickUpdate)
                    {
                        DeltaXRot = (float) (Sensitivity * Magnitude * Math.Sin(Angle));
                        DeltaYRot = (float) (Sensitivity * Magnitude * Math.Cos(Angle));


                        JoystickUpdate = false;
                    }

                    XRot -= DeltaXRot;
                    YRot += DeltaYRot;

                    appHub.JoystickSendParams(instanceId, XRot, YRot);
                }

                Thread.Sleep(30);
            }
        }

        public void JoystickUpdateParams(float angle, float magnitude)
        {
            lock (Lock)
            {
                this.Angle = angle;
                this.Magnitude = magnitude;
                this.JoystickUpdate = true;
            }
        }

        public void ToggleMod()
        {
            Mod *= -1;
            Mod++;
        }

    }
}