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
    public class AugmenterTests
    {
        [TestMethod()]
        public void GetErrorTest()
        {
            Assert.Fail();
        }

        [TestMethod()]
        public void FromFileTest()
        {
            Assert.Fail();
        }

        [TestMethod()]
        public void FromStreamTest()
        {
            Assert.Fail();
        }

        [TestMethod()]
        public void FromURLTest()
        {
            Assert.Fail();
        }

        [TestMethod()]
        public void FromPlainTest()
        {
            Assert.Fail();
        }

        [TestMethod()]
        public void ParseOneTest()
        {
            Assert.Fail();
        }

        [TestMethod()]
        public void PrincipalTypeTest()
        {
            Assert.Fail();
        }

        [TestMethod()]
        public void ShouldPruneRowTest()
        {
            Assert.Fail();
        }

        [TestMethod()]
        public void TypesCompatibleTest()
        {
            Assert.Fail();
        }

        [TestMethod()]
        public void ColumnStatsTest()
        {
            Assert.Fail();
        }

        //KeyValuePair<String, int>[] testpairs = new KeyValuePair<String, int>[] {
        //    new KeyValuePair<string, int>("   1", 1),
        //    new KeyValuePair<string, int>("1.", 1),
        //    new KeyValuePair<string, int>("1 hjjhjhkhjkj", 1),
        //    new KeyValuePair<string, int>("-1", -1)
        //};

        //[TestMethod()]
        //public void IntegerInference()
        //{
        //    AType expected = AType.Integral;

        //    foreach (KeyValuePair<string, int> pair in testpairs) {
        //        AType actual;
        //        dynamic value;
        //        RichDS.ParseCell(pair.Key, out actual, out value);
        //        Assert.AreEqual(expected, actual);
        //        Assert.AreEqual(pair.Value, value);
        //    }
        //}
    }
}