using Microsoft.VisualStudio.TestTools.UnitTesting;
using GDO.Apps.Hercules.BackEnd.DB;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Diagnostics;

namespace GDO.Apps.Hercules.BackEnd.DB.Tests
{
    [TestClass()]
    public class ServerDSTests
    {
        [TestMethod()]
        public void InitTest()
        {
            Assert.IsTrue(ServerDS.Init());
            Debug.WriteLine(ServerDS.UploadDSFromFile("", "", ""));
        }
    }
}