using System.Collections.Generic;

namespace GDO.Apps.SigmaGraph.Domain {
    public class ZoomArea {
        public double Xcenter { get; set; }
        public double Ycenter { get; set; }
        public double XWidth { get; set; }
        public double YWidth { get; set; }

        public override string ToString() {
            return $"{{ X = {Xcenter}, Y = {Ycenter}, xWidth = {XWidth}, yWidth = {YWidth} }}";
        }

        public override bool Equals(object value) {
            var type = value as ZoomArea;
            return (type != null) && EqualityComparer<double>.Default.Equals(type.Xcenter, Xcenter) && EqualityComparer<double>.Default.Equals(type.Ycenter, Ycenter) && EqualityComparer<double>.Default.Equals(type.XWidth, XWidth) && EqualityComparer<double>.Default.Equals(type.YWidth, YWidth);
        }

        public override int GetHashCode() {
            int num = 0x7a2f0b42;
            num = (-1521134295 * num) + EqualityComparer<double>.Default.GetHashCode(Xcenter);// todo make it an immutable class
            num = (-1521134295 * num) + EqualityComparer<double>.Default.GetHashCode(Ycenter);
            num = (-1521134295 * num) + EqualityComparer<double>.Default.GetHashCode(XWidth);
            return (-1521134295 * num) + EqualityComparer<double>.Default.GetHashCode(YWidth);
        }
    }
}