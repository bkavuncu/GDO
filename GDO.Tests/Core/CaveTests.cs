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
        private int[,] caveMap;
        private int[,] sectionMap;
        private int[,] neighbourMap;

        [TestMethod()]
        public void initTest()
        {
            Cave.initCave();
            if (Cave.cols <= 0 && Cave.rows <= 0 && Cave.nodeWidth <= 0 && Cave.nodeHeight <= 0)
            {
                Assert.Fail();
            }
            Assert.AreNotEqual(true, Cave.nodes.IsEmpty);
            if (Cave.nodes.Count < Cave.cols*Cave.rows)
            {
                Assert.Fail();
            }
            Node node;
            Cave.nodes.TryGetValue(Cave.cols*Cave.rows, out node);
            Assert.AreNotEqual(null, node);
            Assert.AreEqual(16, node.id);
            Assert.AreEqual(3, node.col);
            Assert.AreEqual(3, node.row);
        }

        [TestMethod()]
        public void sectionTest()
        {
            Cave.initCave();
            Section section;
            if (Cave.nodes.Count <= 0)
            {
                Assert.Fail("Cave.nodes.Count:" + Cave.nodes.Count);
            }
            List<Node> deployedNodes = Cave.createSection(2, 2, 3, 3);
            if (deployedNodes.Count < 4)
            {
                Assert.Fail("deployedNodes.Count:" + deployedNodes.Count);
            }

            foreach (Node node in deployedNodes)
            {
                if (node.col < 2 || node.col > 3)
                {
                    Assert.Fail("node.col:" + node.col);
                }
                if (node.row < 2 || node.row > 3)
                {
                    Assert.Fail("node.row:" + node.row);
                }
                Cave.sections.TryGetValue(node.sectionID, out section);
                if (!Cave.sections.ContainsKey(node.sectionID))
                {
                    Assert.Fail("node.sectionID:" + node.sectionID);
                }
                if (section.nodes[node.sectionCol, node.sectionRow].id != node.id)
                {
                    Assert.Fail();
                }
            }
            Cave.sections.TryGetValue(1, out section);
            Cave.disposeSection(1);
            if (Cave.sections.ContainsKey(1))
            {
                Assert.Fail();
            }
            foreach (KeyValuePair<int, Node> nodeEntry in Cave.nodes)
            {
                if (nodeEntry.Value.sectionID > 0)
                {
                    Assert.Fail();
                }
                if (nodeEntry.Value.isDeployed)
                {
                    Assert.Fail();
                }
            }
            Cave.createSection(1, 2, 3, 3);
            Cave.sections.TryGetValue(1, out section);
            Assert.AreEqual(1920 + 1920 + 1920, section.width);
            Assert.AreEqual(1080 + 1080, section.height);
        }

        [TestMethod()]
        public void getMapTests()
        {
            Cave.initCave();
            List<Node> deployedNodes = Cave.createSection(2, 2, 3, 3);

            caveMap = Cave.getCaveMap();
            sectionMap = Cave.getSectionMap(1);

            neighbourMap = Cave.getNeighbourMap(6);

            Assert.AreEqual(11, caveMap[2, 2]);
            Assert.AreEqual(16, caveMap[3, 3]);
            Assert.AreEqual(11, sectionMap[0, 0]);
            Assert.AreEqual(16, sectionMap[1, 1]);
            Assert.AreEqual(1, neighbourMap[0, 0]);
            Assert.AreEqual(11, neighbourMap[2, 2]);

            neighbourMap = Cave.getNeighbourMap(16);

            Assert.AreEqual(11, neighbourMap[0, 0]);
            Assert.AreEqual(-1, neighbourMap[2, 2]);

            neighbourMap = Cave.getNeighbourMap(1);

            Assert.AreEqual(-1, neighbourMap[0, 0]);
            Assert.AreEqual(1, neighbourMap[1, 1]);
        }

        [TestMethod()]
        public void JSONTests()
        {
            //TODO
        }
    }
}