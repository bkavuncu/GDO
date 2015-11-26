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

            List<Fuck> l = new List<Fuck>(3);
            Debug.WriteLine(l[0]);

            Assert.Fail();
        }

        [TestMethod()]
        public void InitTest()
        {
            Assert.IsTrue(Database.Init());
            JsonDS ds = Database.JsonFromFile("../../TestFiles/test1.csv", "Zeme", "If this works im going home.");
            if (ds == null) {
                Debug.WriteLine(Database.GetError());
            } else {
                Debug.WriteLine(ds.ToString());
                //string json = Database.GetDataset(id);
                //if (json == null) {
                //    Debug.WriteLine(Database.GetError());
                //} else {
                //    JsonDS ds = JsonConvert.DeserializeObject<JsonDS>(json);
                //    Debug.WriteLine(ds.ToString());
                //}
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