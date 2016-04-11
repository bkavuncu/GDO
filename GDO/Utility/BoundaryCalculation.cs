using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Core;
using GDO.Core.Apps;

namespace GDO.Utility
{
    public class BoundaryCalculation
    {
        public int SectionWidth { get; set; }
        public int SectionHeight { get; set; }

        public void Init(int instanceId)
        {
            SectionWidth = ((IBaseAppInstance)Cave.Instances[instanceId]).Section.Width;
            SectionHeight = ((IBaseAppInstance)Cave.Instances[instanceId]).Section.Height;
        }

        public Boundary CalculateBoundary(double centerX, double centerY, double pixelToUnitRatio)
        {
            //TODO
            return null;
        }

        public class Boundary
        {
            public double TopLeftX { get; set; }
            public double TopLeftY { get; set; }
            public double CenterX { get; set; }
            public double CenterY { get; set; }
            public double BottomRightX { get; set; }
            public double BottomRightY { get; set; }
            public double Resolution { get; set; }
        }
    }
}