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
            PlainDataset plainTest = PlainDatasetFactory.FromFile("test.csv");
            RichDataset rich = RichDatasetFactory.FromPlainDataset(plainTest);
            for (int i = 0; i < rich.AugmentedColumns.Length; ++i)
            {
                System.Diagnostics.Debug.WriteLine(rich.AugmentedColumns[i].Mean.ToString());
            }
        }
    }
}
