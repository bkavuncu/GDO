using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DataPillar.DataConverter;
using DataPillar.DataAugmenter;
namespace DataPillar
{
    class Program
    {
        static void Main(string[] args)
        {
            ConverterOutcome outcome = new ConverterOutcome();
            PlainDataset plainTest = PlainDataset.FromFile("allah.csv", ref outcome);
            RichDataset rich = RichDataset.FromPlainDataset(plainTest);
            for (int i = 0; i < rich.AugmentedColumns.Length; ++i)
            {
                System.Diagnostics.Debug.WriteLine(String.Format("#{0} | {1}", i, rich.AugmentedColumns[i].ToString()));
            }
            RichDataset.Serialize(rich);
        }
    }
}
