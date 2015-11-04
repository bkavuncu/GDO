using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataPillar.DataAugmenter
{
    class AugmentedColumn
    {
        public bool Enum;
        public double Min;
        public double Max;
        public double Mean;
        public double Median;
        public double Variance;
        public double StdDev;
        public double[] Modes;
        public FieldType FieldType;
        public string Name;

        public override string ToString()
        {
            return String.Format("Aug! {5} :: Enum({0}), Min({1}) Max({2}) Mean({3}) FieldType({4})", Enum, Min, Max, Mean, FieldType, Name);  
        }
    }

}
