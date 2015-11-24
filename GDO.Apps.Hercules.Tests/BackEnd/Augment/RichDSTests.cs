using Microsoft.VisualStudio.TestTools.UnitTesting;
using GDO.Apps.Hercules.BackEnd.Augment;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GDO.Apps.Hercules.BackEnd.Augment.Tests
{
    [TestClass()]
    public class RichDSTests
    {
        [TestMethod()]
        public void NormalTest()
        {
        /*    RichDS rich = RichDS.FromFile("../../test1.csv", ",");
            Assert.IsTrue(Enumerable.SequenceEqual(new AType[] { AType.Text, AType.Integral, AType.Integral},
                rich.)*/
        }

        KeyValuePair<String, int>[] testpairs = new KeyValuePair<String, int>[] {
            new KeyValuePair<string, int>("   1", 1),
            new KeyValuePair<string, int>("1.", 1),
            new KeyValuePair<string, int>("1 hjjhjhkhjkj", 1),
            new KeyValuePair<string, int>("-1", -1)
        };

        [TestMethod()]
        public void IntegerInference()
        {
            AType expected = AType.Integral;

            foreach (KeyValuePair<string, int> pair in testpairs) {
                AType actual;
                dynamic value;
                RichDS.ParseCell(pair.Key, out actual, out value);
                Assert.AreEqual(expected, actual);
                Assert.AreEqual(pair.Value, value);
            }
        }
    }
}