using System.Collections.Generic;
using GDO.Core;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace GDO.Tests.Core
{
    [TestClass()]
    public class CaveTests
    {
        private int[,] _nodeMap;
        private int[,] _sectionMap;
        private int[,] _neighbourMap;

        [TestMethod()]
        public void InitTest()
        {
            Cave.Init();
            if (Cave.Cols <= 0 && Cave.Rows <= 0 && Cave.NodeWidth <= 0 && Cave.NodeHeight <= 0)
            {
                Assert.Fail();
            }
            Assert.AreNotEqual(true, Cave.Layout.Nodes.IsEmpty);
            if (Cave.Layout.Nodes.Count < Cave.Cols*Cave.Rows)
            {
                Assert.Fail();
            }
            Node node;
            Cave.Layout.Nodes.TryGetValue(Cave.Cols*Cave.Rows, out node);
            Assert.AreNotEqual(null, node);
            Assert.AreEqual(16, node.Id);
            Assert.AreEqual(3, node.Col);
            Assert.AreEqual(3, node.Row);
        }

        [TestMethod()]
        public void SectionTest()
        {
            Cave.Init();
            Section section;
            if (Cave.Layout.Nodes.Count <= 0)
            {
                Assert.Fail("Cave.Layout.Nodes.Count:" + Cave.Layout.Nodes.Count);
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
            Cave.CloseSection(1);
            if (Cave.Sections.ContainsKey(1))
            {
                Assert.Fail();
            }
            foreach (KeyValuePair<int, Node> nodeEntry in Cave.Layout.Nodes)
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
            Cave.Init();
            List<Node> deployedNodes = Cave.CreateSection(2, 2, 3, 3);

            _nodeMap = Cave.GetNodeMap();
            _sectionMap = Cave.GetSectionMap(1);

            _neighbourMap = Cave.GetNeighbourMap(6);

            Assert.AreEqual(11, _nodeMap[2, 2]);
            Assert.AreEqual(16, _nodeMap[3, 3]);
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
            //TODO Create JSON Tests
        }

    }
}