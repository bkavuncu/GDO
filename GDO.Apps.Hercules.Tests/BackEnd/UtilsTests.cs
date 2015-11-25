using Microsoft.VisualStudio.TestTools.UnitTesting;
using GDO.Apps.Hercules.BackEnd.New;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GDO.Apps.Hercules.BackEnd.New.Tests
{
    [TestClass()]
    public class UtilsTests
    {
   
        [TestMethod()]
        public void ExtractFileExtensionTest()
        {
            Assert.IsTrue(Utils.ExtractFileExtension("iora.csv").Equals("csv"));
            Assert.IsTrue(Utils.ExtractFileExtension(null).Equals(""));
            Assert.AreEqual("", Utils.ExtractFileExtension("NoDotExtension"));
        }

        [TestMethod()]
        public void ClampTest()
        {
            // Smaller than min
            Assert.AreEqual(3, Utils.Clamp(3, 1, 5));
            // Between the two values
            Assert.AreEqual(1, Utils.Clamp(1, 1, 3));
            // Greater than max
            Assert.AreEqual(4, Utils.Clamp(1, 6, 4));
        }

        [TestMethod()]
        public void FillArrayTest()
        {
            int[] arr = new int[0];
            Assert.IsInstanceOfType(Utils.FillArray(-1, 2), arr.GetType());
            Assert.AreEqual(0, Utils.FillArray(-1, 2).Length);

            string[] stringArr = new string[3] { "iora", "iora", "iora" };
            Assert.IsInstanceOfType(Utils.FillArray(3, "iora"), stringArr.GetType());
            Assert.AreEqual(3, Utils.FillArray(3, "iora").Length);
        }

        [TestMethod()]
        public void IndexOfMaxTest()
        {
            Assert.Fail();
        }

        [TestMethod()]
        public void SayTest()
        {
            Assert.Fail();
        }
    }

}