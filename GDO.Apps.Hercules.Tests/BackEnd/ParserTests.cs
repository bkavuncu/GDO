using Microsoft.VisualStudio.TestTools.UnitTesting;
using GDO.Apps.Hercules.BackEnd.New;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Diagnostics;

namespace GDO.Apps.Hercules.BackEnd.New.Tests
{
    [TestClass()]
    public class ParserTests
    {
        [TestMethod()]
        public void GetErrorTest()
        {
        }

        [TestMethod()]
        public void FromStreamTest()
        {
        }

        [TestMethod()]
        public void FromFileTest()
        {
            PlainDS ds = Parser.FromFile("../../TestFiles/test1.csv", ",");
            Assert.IsNotNull(ds);
            Debug.WriteLine(ds.ToString());
        }

        [TestMethod()]
        public void FromURLTest()
        {
        }
    }


    //[TestClass()]
    //public class ParserSSVTest
    //{
    //    [TestMethod()]
    //    public void FromFileNotThereTest()
    //    {
    //        ParserSSV parser = ParserSSV.FromFile("notthere", null);
    //        Assert.AreEqual(new FileNotFoundException().GetType(), parser.GetException().GetType());
    //    }

    //    [TestMethod()]
    //    public void FromFileTestRowNumberTest()
    //    {
    //        ParserSSV parser1 = ParserSSV.FromFile("../../TestFiles/test1.csv", ",");
    //        Assert.AreEqual(4, parser1.GetRowCount());
    //        parser1.CloseSource();
    //    }

    //    [TestMethod()]
    //    public void FromFileTestWithNullDelimiter()
    //    {
    //        ParserSSV parser1 = ParserSSV.FromFile("../../TestFiles/test1.csv", null);
    //        Assert.AreEqual(4, parser1.GetRowCount());
    //        parser1.CloseSource();

    //    }

    //    [TestMethod()]
    //    public void FromFileTestRowNumberZeroTest()
    //    {
    //        ParserSSV parser2 = ParserSSV.FromFile("../../TestFiles/test2.csv", ",");
    //        Assert.AreEqual(0, parser2.GetRowCount());
    //        parser2.CloseSource();
    //    }

    //    [TestMethod()]
    //    public void FromStreamCheckInnerTest()
    //    {
    //        ParserSSV parser = ParserSSV.FromStream(new FileStream("../../TestFiles/test1.csv", FileMode.Open), ",");
    //        Assert.IsTrue(Enumerable.SequenceEqual(new string[] { "," }, parser.GetInner().Delimiters));
    //        Assert.AreEqual(FieldType.Delimited, parser.GetInner().TextFieldType);
    //        parser.CloseSource();
    //    }

    //    [TestMethod()]
    //    public void ParseHeadersTest()
    //    {
    //        ParserSSV parser1 = ParserSSV.FromFile("../../TestFiles/test1.csv", ",");
    //        string[] headers = parser1.ParseHeaders();
    //        Assert.IsTrue(Enumerable.SequenceEqual(new string[] { "Name", "Age", "Sex" }, headers));
    //        parser1.CloseSource();
    //    }

    //    [TestMethod()]
    //    public void ParseNullHeadersTest()
    //    {
    //        ParserSSV parser2 = ParserSSV.FromFile("../../TestFiles/test2.csv", ",");
    //        string[] headers = parser2.ParseHeaders();
    //        Assert.IsNull(headers);
    //        parser2.CloseSource();
    //    }

    //    [TestMethod()]
    //    public void ParseRowsTest()
    //    {
    //        ParserSSV parser1 = ParserSSV.FromFile("../../TestFiles/test1.csv", ",");
    //        parser1.ParseHeaders();
    //        string[] firstRow = parser1.ParseRow();
    //        Assert.IsTrue(Enumerable.SequenceEqual(new string[] { "Ioana", "21", "F" }, firstRow));
    //        string[] secondRow = parser1.ParseRow();
    //        Assert.IsTrue(Enumerable.SequenceEqual(new string[] { "Lorenzo C", "21", "M" }, secondRow));
    //        string[] thirdRow = parser1.ParseRow();
    //        Assert.IsTrue(Enumerable.SequenceEqual(new string[] { "Elena R", "", "F" }, thirdRow));
    //        string[] fourthRow = parser1.ParseRow();
    //        Assert.IsTrue(Enumerable.SequenceEqual(new string[] { "Viorel\"R", "48", "M" }, fourthRow));
    //        parser1.CloseSource();
    //    }
    //}
}