﻿using DP.src;
using DP.src.Augment;
using GDO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DP
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Hello");
            RichDS ds = RichDS.FromFile(@"C:\Users\lmc13\Desktop\DP\DP\tests\test0.csv", ",");
            ds.Begin();
            ds.Print();
            Utils.Say("AALALALA");
            ServerDS.UploadDSFromFile("UBER", "", "");
        }
    }
}
