using System;
using System.Collections.Generic;

namespace GDO.Apps.SigmaGraph.QuadTree
{
    public class QuadTree<T> where T : IQuadable<double>
    {
        public readonly int MaxBagsBeforeSplit;
        public readonly int MaxObjectsPerBag;

        public readonly QuadTreeNode<T> Root;
        internal readonly Action<QuadTreeBag<T>> ShedObjects;
        internal readonly Action<string> MarkObjectsForRework;
        internal readonly Action<string, QuadTreeNode<T>> RegisterQuadTree;

        //Critical
        internal string treeId = System.Guid.NewGuid().ToString();

        public QuadTree(QuadCentroid centroid, Action<QuadTreeBag<T>> shedObjects, Action<string> markObjectsForRework, Action<string, QuadTreeNode<T>> registerQuadTree, int maxBagsBeforeSplit = 10, int maxObjectsPerBag = 500)
        {
            // Critical
            this.Root = new QuadTreeNode<T>(centroid, treeId);
            this.ShedObjects = shedObjects;
            this.MarkObjectsForRework = markObjectsForRework;
            this.RegisterQuadTree = registerQuadTree;
            MaxBagsBeforeSplit = maxBagsBeforeSplit;
            MaxObjectsPerBag = maxObjectsPerBag;
            registerQuadTree(this.Root.Guid, this.Root);
        }

        #region Add
        public void AddObject(T o)
        {
            AddObject(this.Root, o);
        }

        public void AddObject(QuadTreeNode<T> quad, T o)
        {
            // cases    
            // we're a node - we chose the correct quadrant and recurse
            // we're a leaf and we're not full - we add
            // we're a lead and we are full - we break down and add objects...
            while (quad != null && !quad.IsLeaf())
            {
                quad = quad.ReturnQuadrant(o); // this avoids recursion
            }
            if (quad == null)
            {
                throw new ArgumentException("null quad tree");
            }
            // add the object
            quad.ObjectsInside.Add(o);

            // Shed objects if we have more than Max inside, and erase the local objects - this avoids memory intensity 
            bool madechildren = false;
            if (quad.ObjectsInside.Count >= MaxObjectsPerBag)
            {
                ShedObjectsToExternalStore(quad);
                // if we've pushed sufficient bags then make children and mark all of those bags for rework 
                if (quad.Counters.GetOrAdd("BagsPushedToMongo", 0) >= MaxBagsBeforeSplit)
                {
                    // note that this locks on the object
                    madechildren = quad.TryGenerateChildren(RegisterQuadTree);

                    // we are now full so we should turn into a node - to do this we must retreive objects from Mongo and add them to the worklsit 
                    // If we are turning into a node, then we need to put back the objects inside the worklist, by setting the flag on the guid objects to true
                    if (madechildren) MarkObjectsForRework(quad.Guid);
                }
            }

            // // if the leaf has been made a node then remove any last objects left which may have been added by other threads ... 

            if (madechildren || (!quad.IsLeaf() && !quad.ObjectsInside.IsEmpty))
            {
                ShedObjectsToExternalStore(quad);
            }
        }

        private void ShedObjectsToExternalStore(QuadTreeNode<T> quad)
        {
            Console.WriteLine("---- ShedObjectsToExternalStore ---- quad.treeId: " + quad.treeId);
            // extract objects and shed them
            var quadTreeBag = ExtractObjectsFromQuad(quad);
            ShedObjects(quadTreeBag);
            // log global # objects shed - for debug only 
            quad.Counters.AddOrUpdate("ObjectsShed", k => quadTreeBag.Objects.Count, (k, v) => v + quadTreeBag.Objects.Count);
            // count the # bags this quad has shed. 
            quad.Counters.AddOrUpdate("BagsPushedToMongo", k => 1, (k, v) => v + 1);
        }

        private static QuadTreeBag<T> ExtractObjectsFromQuad(QuadTreeNode<T> quad) {
            // collect together a bag of objects to shed
            List<T> objsToShed = new List<T>();
            T t;
            while (quad.ObjectsInside.TryTake(out t)) {
                objsToShed.Add(t);
            }
            // then shed them
            var quadTreeBag = new QuadTreeBag<T>(quad.Guid, objsToShed, quad.treeId);
            //var quadTreeBag = new QuadTreeBag<T>(quad.Guid, objsToShed);
            return quadTreeBag;
        }
        #endregion

        #region Shed to External Storage
        /// <summary>
        /// Forces all nodes to shed all of their contents to external storage
        /// </summary>
        public void ShedAllObjects()
        {
            ShedAllObjects(this.Root);
        }

        private void ShedAllObjects(QuadTreeNode<T> quad)
        {
            if (!quad.ObjectsInside.IsEmpty)
            {
                ShedObjectsToExternalStore(quad);
            }
            if (!quad.IsLeaf())
            {
                foreach (var child in quad.SubQuads)
                {
                    ShedAllObjects(child);
                }
            }
        }

        #endregion

        public int CountItems()
        {
            throw new NotImplementedException();
        }
    }
}