using Microsoft.VisualStudio.TestTools.UnitTesting;
using GDO.Apps.Hercules.BackEnd.New;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Deployment;
using Newtonsoft.Json;
using System.Diagnostics;

namespace GDO.Apps.Hercules.BackEnd.New.Tests
{
    [TestClass()]
    public class DatabaseTests
    {
        class Fuck { }

        [TestMethod()]
        public void GetErrorTest()
        {

        }

        [TestMethod()]
        public void InitTest()
        {
            Assert.IsTrue(Database.Init());
            JsonDS ds1 = Database.JsonFromFile("../../TestFiles/test1.csv", "Test1", "Descriptive description.");
            JsonDS ds2 = Database.JsonFromFile("../../TestFiles/test2.csv", "Test2", "The brown fox jumped over the lazy dog#.");
            if (ds1 == null && ds2 == null) {
                Debug.WriteLine(Database.GetError());
            } else {
               
                //string id1 = Database.UploadJsonDS(ds1);
                string id1 = "565c7fe75e0c5c0d282cee30";
                JsonMiniset ms1 = Database.QueryJsonMiniset(id1);
                Assert.AreEqual(id1, ms1._id.ToString());
                JsonRows rs1 = Database.QueryJsonRows(id1);
                Assert.AreEqual(id1, rs1._id.ToString());
                ds1 = Database.QueryJsonDS(id1);
                Assert.AreEqual(id1, ds1.schema._id.ToString());


                string id2 = Database.UploadJsonDS(ds2);
                JsonMiniset ms2 = Database.QueryJsonMiniset(id2);
                Assert.AreEqual(id2, ms2._id.ToString());
                JsonRows rs2 = Database.QueryJsonRows(id2);
                Assert.AreEqual(id2, rs2._id.ToString());
                ds2 = Database.QueryJsonDS(id2);
                Assert.AreEqual(id2, ds2.schema._id.ToString());

                JsonMiniset[] mss = Database.QueryJsonMinisets();

            }
        }

        [TestMethod()]
        public void GetMinisetTest()
        {
            Assert.Fail();
        }

        [TestMethod()]
        public void GetMinisetsTest()
        {
            Assert.Fail();
        }

        [TestMethod()]
        public void GetDatasetTest()
        {
            Assert.Fail();
        }

        [TestMethod()]
        public void UploadDSFromRichTest()
        {
            Assert.Fail();
        }

        [TestMethod()]
        public void UploadDSFromFileTest()
        {
            Assert.Fail();
        }

        [TestMethod()]
        public void UploadDSFromStreamTest()
        {
            Assert.Fail();
        }

        [TestMethod()]
        public void UploadDSFromURLTest()
        {
            Assert.Fail();
        }

        [TestMethod()]
        public void JsonFromRichTest()
        {
            
            Assert.Fail();
        }

        //[TestMethod()]
        //public void InitTest()
        //{
        //    Assert.IsTrue(ServerDS.Init());
        //    Debug.WriteLine(ServerDS.UploadDSFromFile("", "", ""));
        //}
    }
}