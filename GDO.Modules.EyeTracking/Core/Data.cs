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
        
        public double[] X = new double[5];
        public double[] Y = new double[5];

        public double A;
        public double B;
        public double C;
        public double D;

        public double E;
        public double F;
        public double G;
        public double H;

        public double Angle;
        public double AngleOffset;
        public double Priority;

        
        public void CalculateAngle()
        {
            if (VisibleCheck2())
            {
                CalculateDistanceToCenter();
                if (VisibleCheck3())
                {
                    double ratio = ((B + D) / 2) / ((A + C) / 2);
                    Priority = ((E + G) / 2) / ((F + H) / 2);
                    if (Priority > 1)
                    {
                        Priority = 1 / Priority;
                    }
                    ratio = 1 - ratio;
                    if (ratio < 1)
                    {
                        AngleOffset = Convert.ToInt32(ratio * 90);
                        if (A > C)
                        {
                            AngleOffset = -AngleOffset;
                        }
                    }
                }
            }
        }

        public void CalculateSides()
        {
            A = Math.Sqrt(Math.Pow(X[0] - X[1], 2) + Math.Pow(Y[0] - Y[1], 2));
            B = Math.Sqrt(Math.Pow(X[1] - X[2], 2) + Math.Pow(Y[1] - Y[2], 2));
            C = Math.Sqrt(Math.Pow(X[2] - X[3], 2) + Math.Pow(Y[2] - Y[3], 2));
            D = Math.Sqrt(Math.Pow(X[3] - X[0], 2) + Math.Pow(Y[3] - Y[0], 2));
        }

        public void CalculateDistanceToCenter()
        {
            X[4] = (X[0] + X[1] + X[2] + X[3]) / 4;
            Y[4] = (Y[0] + Y[1] + Y[2] + Y[3]) / 4;

            E = Math.Sqrt(Math.Pow(X[0] - X[4], 2) + Math.Pow(Y[0] - Y[4], 2));
            F = Math.Sqrt(Math.Pow(X[1] - X[4], 2) + Math.Pow(Y[1] - Y[4], 2));
            G = Math.Sqrt(Math.Pow(X[2] - X[4], 2) + Math.Pow(Y[2] - Y[4], 2));
            H = Math.Sqrt(Math.Pow(X[3] - X[4], 2) + Math.Pow(Y[3] - Y[4], 2));
        }

        public bool VisibleCheck1()
        {
            double total = X[0] + X[1] + X[2] + X[3] + Y[0] + Y[1] + Y[2] + Y[3];
            if (total > 0)
            {
                return true;
            }
            else
            {
                return false;
            }
        }
        public bool VisibleCheck2()
        {
            double total = A + B + C + D;
            if (total > 0)
            {
                return true;
            }
            else
            {
                return false;
            }
        }

        public bool VisibleCheck3()
        {
            double total = E + F + G + H;
            if (total > 0)
            {
                return true;
            }
            else
            {
                return false;
            }
        }

        public bool VisibleCheck4()
        {
            if (AngleOffset == 0)
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
            if (VisibleCheck1())
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
        public int Distance { get; set; }
        public double Priority { get; set; }
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

        public void setPosition(int userId, PositionData pos)
        {
            UserId = userId;
            X = pos.X;
            Y = pos.Y;
            NodeId = pos.NodeId;
        }
        public void setLocation(LocationData loc)
        {
            Angle = loc.Angle;
            Height = 0;
            Distance = loc.Distance;
        }
    }

}