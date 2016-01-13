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
            Utils.WriteSeparator();
            JsonDS ds = Database.JsonDSFromFile("../../TestFiles/WellFormed/" + name, name, "");
            //Debug.WriteLine(ds.schema);
            Debug.WriteLine(name + " (" + (expectedRowNo - ds.schema.nrows).ToString() + ")");
        }

        [TestMethod()]
        public void initialLoad()
        {
            Database.Init();
            JsonMiniset[] minisets = Database.QueryJsonMinisets();

            if (minisets == null)
            {
                throw new Exception(Database.GetError());
            }

            int initial = minisets.Length;

            if (initial == 0)
            {
                Database.EnsureDatasetsAreLoaded();
                int final = Database.QueryJsonMinisets().Length;

                Assert.IsFalse(final == 0);
                [TestMethod()]
        public void InitTest()
        {
            try {
                Database.Init();
                go("MDR-TB_burden_estimates_2016-01-13.csv", 218);
                go("askscience.csv", 1000);
                go("SacramentocrimeJanuary2006.csv", 7585);
                go("Sacramentorealestatetransactions.csv", 986);
                go("SalesJan2009.csv", 999);
                go("TB_burden_countries_2016-01-13.csv", 5338);
                go("TB_data_dictionary_2016-01-13.csv", 328);
                go("TB_hiv_nonroutine_surveillance_2016-01-13.csv", 253);
                go("TB_laboratories_2016-01-13.csv", 1299);
                go("TB_notifications_2016-01-13.csv", 7458);
                go("TB_outcomes_2016-01-13.csv", 4275);
                go("TB_strategy_2016-01-13.csv", 218);
                go("TechCrunchcontinentalUSA.csv", 1461);
            } catch (Exception e) {
                Debug.WriteLine("OUCH: " + e.Message);
        }
        }
    }
}