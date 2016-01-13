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
            }
        }

    }
}