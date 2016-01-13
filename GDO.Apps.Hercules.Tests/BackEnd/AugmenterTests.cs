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
        }

        [TestMethod()]
        public void FromFileTest()
        {
            RichDS test = Augmenter.FromFile("../../TestFiles/askscience.csv", ",");
            for (int i = 0; i < test.Columns.Length; i++)
            {
                Utils.Say(test.Columns[i].Type.ToString() + " ");
            }
        }

        [TestMethod()]
        public void FromStreamTest()
        {
        }

        [TestMethod()]
        public void FromURLTest()
        {
        }

        [TestMethod()]
        public void FromPlainTest()
        {
        }

        [TestMethod()]
        public void ParseOneTest()
        {
        }

        [TestMethod()]
        public void PrincipalTypeTest()
        {
        }

        [TestMethod()]
        public void ShouldPruneRowTest()
        {
        }

        [TestMethod()]
        public void TypesCompatibleTest()
        {
        }

        [TestMethod()]
        public void ColumnStatsTest()
        {
        }
    }
}