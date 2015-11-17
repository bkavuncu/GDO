using GDO.Apps.Hercules.BackEnd.Parser;
using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.IO;
using Microsoft.VisualBasic.FileIO;

namespace GDO.Apps.Hercules.BackEnd.Parser.Tests
{
    [TestClass()]
    public class ParserSSVTest
    {
        [TestMethod()]
        public void FromFileNotThereTest()
        {
            ParserSSV parser = ParserSSV.FromFile("notthere", null);
            Assert.AreEqual(new FileNotFoundException().GetType(), parser.GetException().GetType());
        }

        [TestMethod()]
        public void FromFileTestRowNumberTest()
        {
            ParserSSV parser = ParserSSV.FromFile("../../TestFiles/test1.csv", ",");
            Assert.AreEqual(4, parser.GetRowCount());
        }

        [TestMethod()]
        public void FromFileTestWithNullDelimiter()
        {
            ParserSSV parser = ParserSSV.FromFile("../../TestFiles/test1.csv", null);
            Assert.AreEqual(4, parser.GetRowCount());
        }

        [TestMethod()]
        public void FromFileTestRowNumberZeroTest()
        {
            ParserSSV parser = ParserSSV.FromFile("../../TestFiles/test2.csv", ",");
            Assert.AreEqual(0, parser.GetRowCount());
        }

        [TestMethod()]
        public void FromStreamCheckInnerTest()
        {
            ParserSSV parser = ParserSSV.FromStream(new FileStream("../../TestFiles/test1.csv", FileMode.Open), ",", 4);
            Assert.AreEqual(",", parser.GetInner().Delimiters);
            Assert.AreEqual(FieldType.Delimited, parser.GetInner().TextFieldType);
        }
    }
}