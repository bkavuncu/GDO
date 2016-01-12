using GDO.Apps.Hercules.BackEnd;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using GDO.Apps.Hercules.BackEnd.New;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GDO.Apps.Hercules.BackEnd.Tests
{
    [TestClass()]
    public class UtilsTests
    {
        [TestMethod()]
        public void AxesMapToPlotOrderTest()
        {
            string axesMap = "{x: [\"oranges\"], y: [\"clementines\"]}";
            JsonDS dataset = Database.JsonFromFile("../../TestFiles/falcon.csv", "falcon", "punch");
            if (dataset == null)
            {
                throw new Exception(Database.GetError());
            }
            
            string result = Utils.AxesMapToPlotOrder(axesMap, dataset);
            string expected = "[{\"x\":\"4\",\"y\":\"6\"},{\"x\":\"9\",\"y\":\"0\"},{\"x\":\"4\",\"y\":\"2\"},{\"x\":\"1\",\"y\":\"7\"},{\"x\":\"1\",\"y\":\"9\"},{\"x\":\"6\",\"y\":\"4\"},{\"x\":\"8\",\"y\":\"5\"},{\"x\":\"20\",\"y\":\"5\"},{\"x\":\"6\",\"y\":\"6\"}]";


            Assert.AreEqual<string>(result, expected);
        }
    }
}

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