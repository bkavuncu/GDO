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
            SectionWidth = ((IBaseAppInstance)Cave.Deployment.Instances[instanceId]).Section.Width;
            SectionHeight = ((IBaseAppInstance)Cave.Deployment.Instances[instanceId]).Section.Height;
        }

        public Boundary CalculateBoundary(double centerX, double centerY, double pixelToUnitRatio)
        {
            double topLeftX = centerX - ((SectionWidth * pixelToUnitRatio)/2);
            double topLeftY = centerY + ((SectionHeight * pixelToUnitRatio) / 2);
            double bottomRightX = centerX + ((SectionWidth * pixelToUnitRatio) / 2);
            double bottomRightY = centerY - ((SectionHeight * pixelToUnitRatio) / 2);
            return new Boundary(topLeftX,topLeftY,centerX,centerY,bottomRightX,bottomRightY,pixelToUnitRatio);
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

            public Boundary(double topLeftX, double topLeftY, double centerX, double centerY, double bottomRightX, double bottomRightY, double resolution)
            {
                TopLeftX = topLeftX;
                TopLeftY = topLeftY;
                CenterX = centerX;
                CenterY = centerY;
                BottomRightX = bottomRightX;
                BottomRightY = bottomRightY;
                Resolution = resolution;
            }
        }
    }
}