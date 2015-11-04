using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataPillar.DataAugmenter
{
    class AugmentedColumn
    {
        public double Min;
        public double Max;
        public double Mean;
        public double Median;
        public double Variance;
        public double StdDev;
        public double[] Modes;
        public FieldType FieldType; 
    }

}
