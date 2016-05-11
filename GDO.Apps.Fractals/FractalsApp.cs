using System;
using GDO.Core;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

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

        public int MaxSteps;
        public float Detail;

        public int Iterations;

        public float Ambience;

        public int Mod;

        public string Name { get; set; }
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
        }

        public void SetName(string name)
        {
            Name = name;
        }

        public string GetName()
        {
            return Name;
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

        private const double sensitivity = 0.05;

        public void StrafeLeft()
        {
            ZTrans += (float) (sensitivity * Math.Cos(XRot + Math.PI / 2));
            XTrans -= (float) (sensitivity * Math.Sin(XRot + Math.PI / 2));
        }
        public void StrafeRight()
        {
            ZTrans -= (float) (sensitivity * Math.Cos(XRot + Math.PI / 2));
            XTrans += (float) (sensitivity * Math.Sin(XRot + Math.PI / 2));
        }

        public void MoveForward()
        {
            ZTrans += (float) (sensitivity * Math.Cos(XRot));
            XTrans -= (float) (sensitivity * Math.Sin(XRot));

            YTrans -= (float) (sensitivity * Math.Sin(YRot));
        }
        public void MoveBackward()
        {
            ZTrans -= (float)(sensitivity * Math.Cos(XRot));
            XTrans += (float)(sensitivity * Math.Sin(XRot));

            YTrans += (float)(sensitivity * Math.Sin(YRot));
        }

        public void ToggleMod()
        {
            Mod *= -1;
            Mod++;
        }

    }
}