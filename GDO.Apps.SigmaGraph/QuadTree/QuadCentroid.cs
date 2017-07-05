using System;

namespace GDO.Apps.SigmaGraph.QuadTree
{
    public class QuadCentroid : IEquatable<QuadCentroid>
    {

        // ReSharper disable InconsistentNaming
        public double xCentroid;
        public double yCentroid;
        public double xWidth;
        public double yWidth;
        // ReSharper restore InconsistentNaming

        public bool Equals(QuadCentroid other)
        {
            if (ReferenceEquals(null, other)) return false;
            if (ReferenceEquals(this, other)) return true;
            return xCentroid.Equals(other.xCentroid) && yCentroid.Equals(other.yCentroid) 
                && xWidth.Equals(other.xWidth) && yWidth.Equals(other.yWidth);
        }

        public override bool Equals(object obj)
        {
            if (ReferenceEquals(null, obj)) return false;
            if (ReferenceEquals(this, obj)) return true;
            if (obj.GetType() != this.GetType()) return false;
            return Equals((QuadCentroid)obj);
        }

        public override int GetHashCode()
        {
            unchecked
            {
                var hashCode = xCentroid.GetHashCode();
                hashCode = (hashCode * 397) ^ yCentroid.GetHashCode();
                return hashCode;
            }
        }

        public static bool operator ==(QuadCentroid left, QuadCentroid right)
        {
            return Equals(left, right);
        }

        public static bool operator !=(QuadCentroid left, QuadCentroid right)
        {
            return !Equals(left, right);
        }
        
        public QuadCentroid(double xCentroid, double yCentroid, double xWidth, double yWidth)
        {
            this.xCentroid= xCentroid;
            this.yCentroid = yCentroid;
            this.xWidth = xWidth;
            this.yWidth = yWidth;
        }

        public override string ToString()
        {
            return $"{nameof(xCentroid)}: {xCentroid}, {nameof(yCentroid)}: {yCentroid}, {nameof(xWidth)}: {xWidth},{nameof(yWidth)}: {yWidth}";
        }
    }
}