using System;

namespace GDO.Apps.SigmaGraph.QuadTree {
    /// <summary>
    /// The future of this class is yet to be determined
    /// </summary>
    /// <typeparam name="T"></typeparam>
    public interface IQuadable<T> where T : IComparable {
        // T GetDimA();
        // T GetDimB();
        bool IsWithin<T>(QuadTreeNode<T> q) where T : IQuadable<double>;
    }
}