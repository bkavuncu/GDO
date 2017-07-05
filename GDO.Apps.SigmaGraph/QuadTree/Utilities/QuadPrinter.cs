using System.Xml.Linq;

namespace GDO.Apps.SigmaGraph.QuadTree.Utilities
{
    /// <summary>
    /// an attempt to use XMLto print off a quad tree and get a feel for its structure, 
    /// we do a depth first traversal     
    /// </summary>
    public static class QuadPrinter
    {
        public static string PrintQuad<T>(this QuadTree<T> quad ) where T: IQuadable<double> {
            XElement root = new XElement("root");
            int objs = PrintQuad(root, quad.Root);
            root.Add(new XAttribute("count",objs));
            return root.ToString( );
        }

        private static int PrintQuad<T>(XElement root, QuadTreeNode<T> quad) where T : IQuadable<double> {
            XElement node = new XElement("node");
            node.Add(new XAttribute("guid", quad.Guid));

            int itemsInThisTree = quad.ObjectsInside.Count; 
            int itemsShed = quad.Counters.GetOrAdd("ObjectsShed", 0);
            int localitems = quad.ObjectsInside.Count;

            if (quad.IsLeaf()) {
                node.Add(new XAttribute("isleaf", true));
                itemsInThisTree += itemsShed;
            }
            else {
                foreach (var child in quad.SubQuads) {
                    itemsInThisTree += PrintQuad(node, child);
                }
            }

            node.Add(new XAttribute("itemsInThisTree", itemsInThisTree));
            node.Add(new XAttribute("localItems", localitems));
            node.Add(new XAttribute("itemsshed", itemsShed));
            root.Add(node);

            return itemsInThisTree;
        }

    }
}
