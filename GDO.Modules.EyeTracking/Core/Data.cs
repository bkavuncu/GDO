using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using Newtonsoft.Json;

namespace GDO.Modules.EyeTracking.Core
{
    public class MarkerData
    {

        public double[] X = new double[4];
        public double[] Y = new double[4];

        public double A;
        public double B;
        public double C;
        public double D;

        public double[] Vector;//X,Y,Z 

        
        public void CalculateVector()
        {


            /*
            double AB = A/B;
            double AC = A/C;
            double AD = A/D;
            double BC = B/C;
            double BD = B/D;
            double CD = C/D;

            double VectorXYRatio;
            double VectorXZRatio;
            double VectorYZRatio;*/
        }

        public void CalculateSides()
        {
            A = Math.Sqrt(Math.Pow(X[0] - X[1], 2) + Math.Pow(Y[0] - Y[1], 2));
            B = Math.Sqrt(Math.Pow(X[1] - X[2], 2) + Math.Pow(Y[1] - Y[2], 2));
            C = Math.Sqrt(Math.Pow(X[2] - X[3], 2) + Math.Pow(Y[2] - Y[3], 2));
            D = Math.Sqrt(Math.Pow(X[3] - X[0], 2) + Math.Pow(Y[3] - Y[0], 2));
        }

        public bool VisibleCheck()
        {
            double total = X[0] + X[1] + X[2] + X[3] + Y[0] + Y[1] + Y[2] + Y[3];
            if (total == 0)
            {
                return false;
            }
            else
            {
                return true;
            }
        }

        public double[] CalculateOffset(double x, double y, int markerSize)
        {
            if (VisibleCheck())
            {
                double[] offset = new double[3];
                CalculateSides();
                offset[0] = (x - X[3]) / ((B + D) / (markerSize * 2));
                offset[1] = (y - Y[3]) / ((A + C) / (markerSize * 2));
                offset[2] = Math.Sqrt(Math.Pow(offset[0], 2) + Math.Pow(offset[1], 2));
                return offset;
            }
            else
            {
                return null;
            }

        }
    }
    public class EyeData
    {
        public double X { get; set; }
        public double Y { get; set; }
    }
    public class PositionData
    {
        public int NodeId { get; set; }
        public int X { get; set; }
        public int Y { get; set; }
    }
    public class LocationData
    {
        public int Angle { get; set; }
        public double Height { get; set; }
        public int Distance { get; set; }
    }
    public class TrackData
    {
        public int TimeStamp { get; set; }
        public int UserId { get; set; }
        public int NodeId { get; set; }
        public int X { get; set; }
        public int Y { get; set; }
        public int Angle { get; set; }
        public double Height { get; set; }
        public int Distance { get; set; }
        public string SerializeJSON()
        {
            return JsonConvert.SerializeObject(this);
        }

        public void setPosition(int userId, PositionData pos)
        {
            UserId = userId;
            X = pos.X;
            Y = pos.Y;
            NodeId = pos.NodeId;
        }
    }

}