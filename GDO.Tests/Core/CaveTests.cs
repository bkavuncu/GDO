using Microsoft.VisualStudio.TestTools.UnitTesting;
using GDO;
using GDO.Core;
using System;
using System.Configuration;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GDO.Tests
{
    [TestClass()]
    public class CaveTests
    {
        private int[,] _caveMap;
        private int[,] _sectionMap;
        private int[,] _neighbourMap;

        [TestMethod()]
        public void InitTest()
        {
            Cave.InitCave();
            if (Cave.Cols <= 0 && Cave.Rows <= 0 && Cave.NodeWidth <= 0 && Cave.NodeHeight <= 0)
            {
                Assert.Fail();
            }
            Assert.AreNotEqual(true, Cave.Nodes.IsEmpty);
            if (Cave.Nodes.Count < Cave.Cols*Cave.Rows)
            {
                Assert.Fail();
            }
            Node node;
            Cave.Nodes.TryGetValue(Cave.Cols*Cave.Rows, out node);
            Assert.AreNotEqual(null, node);
            Assert.AreEqual(16, node.Id);
            Assert.AreEqual(3, node.Col);
            Assert.AreEqual(3, node.Row);
        }

        [TestMethod()]
        public void SectionTest()
        {
            Cave.InitCave();
            Section section;
            if (Cave.Nodes.Count <= 0)
            {
                Assert.Fail("Cave.nodes.Count:" + Cave.Nodes.Count);
            }
            List<Node> deployedNodes = Cave.CreateSection(2, 2, 3, 3);
            if (deployedNodes.Count < 4)
            {
                Assert.Fail("deployedNodes.Count:" + deployedNodes.Count);
            }

            foreach (Node node in deployedNodes)
            {
                if (node.Col < 2 || node.Col > 3)
                {
                    Assert.Fail("node.col:" + node.Col);
                }
                if (node.Row < 2 || node.Row > 3)
                {
                    Assert.Fail("node.row:" + node.Row);
                }
                Cave.Sections.TryGetValue(node.SectionId, out section);
                if (!Cave.Sections.ContainsKey(node.SectionId))
                {
                    Assert.Fail("node.sectionID:" + node.SectionId);
                }
                if (section.Nodes[node.SectionCol, node.SectionRow].Id != node.Id)
                {
                    Assert.Fail();
                }
            }
            Cave.Sections.TryGetValue(1, out section);
            Cave.DisposeSection(1);
            if (Cave.Sections.ContainsKey(1))
            {
                Assert.Fail();
            }
            foreach (KeyValuePair<int, Node> nodeEntry in Cave.Nodes)
            {
                if (nodeEntry.Value.SectionId > 0)
                {
                    Assert.Fail();
                }
                if (nodeEntry.Value.IsDeployed)
                {
                    Assert.Fail();
                }
            }
            Cave.CreateSection(1, 2, 3, 3);
            Cave.Sections.TryGetValue(1, out section);
            Assert.AreEqual(1920 + 1920 + 1920, section.Width);
            Assert.AreEqual(1080 + 1080, section.Height);
        }

        [TestMethod()]
        public void GetMapTests()
        {
            Cave.InitCave();
            List<Node> deployedNodes = Cave.CreateSection(2, 2, 3, 3);

            _caveMap = Cave.GetCaveMap();
            _sectionMap = Cave.GetSectionMap(1);

            _neighbourMap = Cave.GetNeighbourMap(6);

            Assert.AreEqual(11, _caveMap[2, 2]);
            Assert.AreEqual(16, _caveMap[3, 3]);
            Assert.AreEqual(11, _sectionMap[0, 0]);
            Assert.AreEqual(16, _sectionMap[1, 1]);
            Assert.AreEqual(1, _neighbourMap[0, 0]);
            Assert.AreEqual(11, _neighbourMap[2, 2]);
            Assert.AreEqual(9, _neighbourMap[0, 2]);

            _neighbourMap = Cave.GetNeighbourMap(16);

            Assert.AreEqual(11, _neighbourMap[0, 0]);
            Assert.AreEqual(-1, _neighbourMap[2, 2]);

            _neighbourMap = Cave.GetNeighbourMap(1);

            Assert.AreEqual(-1, _neighbourMap[0, 0]);
            Assert.AreEqual(1, _neighbourMap[1, 1]);
        }

        [TestMethod()]
        public void JsonTests()
        {
            //TODO
        }

    }
}