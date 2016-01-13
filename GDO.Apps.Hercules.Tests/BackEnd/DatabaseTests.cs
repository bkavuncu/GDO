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

     
        public void go(string name, int expectedRowNo)
        {

        }

        [TestMethod()]
        public void InitTest()
        {
            //assert.istrue(database.init());
            //jsonds ds1 = database.jsonfromfile("../../testfiles/test1.csv", "test1", "descriptive description.");
            //utils.writeseparator();
            //debug.writeline(ds1);
            //jsonminiset[] ms = database.queryjsonminisets();
            //foreach (jsonminiset m in ms) {
            //    utils.writeseparator();
            //    debug.writeline(m.tostring());
            //}
            //go("askscience.csv", 1000);
            //go("mdr - tb_burden_estimates_2016 - 01 - 13.csv", 218);
            //go("sacramentocrimejanuary2006.csv", 7585);
            //go("sacramentorealestatetransactions.csv", 986);
            //go("salesjan2009.csv", 999);
            //go("tb_burden_countries_2016-01-13.csv", 5338);
            //go("tb_data_dictionary_2016-01-13.csv", 328);
            //go("tb_hiv_nonroutine_surveillance_2016-01-13.csv", 253);
            //go("tb_laboratories_2016-01-13.csv", 1299);
            //go("tb_notifications_2016-01-13.csv", 7458);
            //go("tb_outcomes_2016-01-13.csv", 4275);
            //go("tb_strategy_2016-01-13.csv", 218);
            //go("techcrunchcontinentalusa.csv", 1461);







            //JsonDS ds2 = Database.JsonFromFile("../../TestFiles/test2.csv", "Test2", "The brown fox jumped over the lazy dog#.");

            /* if (ds1 == null && ds2 == null) {
                Debug.WriteLine(Database.GetError());
            } else {
               
                //string id1 = Database.UploadJsonDS(ds1);
                string id1 = "565c7fe75e0c5c0d282cee30";
                JsonMiniset ms1 = Database.QueryJsonMiniset(id1);
                ++

















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

            }*/
        }

        [TestMethod()]
        public void GetMinisetTest()
        {
        }

        [TestMethod()]
        public void GetMinisetsTest()
        {
        }

        [TestMethod()]
        public void GetDatasetTest()
        {
        }

        [TestMethod()]
        public void UploadDSFromRichTest()
        {
        }

        [TestMethod()]
        public void UploadDSFromFileTest()
        {
        }

        [TestMethod()]
        public void UploadDSFromStreamTest()
        {
        }

        [TestMethod()]
        public void UploadDSFromURLTest()
        {
        }

        [TestMethod()]
        public void JsonFromRichTest()
        {
        }

    }
}