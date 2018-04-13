using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;

namespace GDO.Apps.SigmaGraph.QuadTree {
    /// <summary>
    /// The basic Node of the Quad Tree 
    /// </summary>
    /// <typeparam name="T">type held within the quadtree</typeparam>

    public class QuadTreeNode<T> where T : IQuadable<double> {
        public string Guid { get; set; } = System.Guid.NewGuid().ToString();
        public string CreationTime { get; set; }
        public QuadCentroid Centroid { get; set; }
        public QuadTreeNode<T>[] SubQuads { get; set; }

        [NonSerialized]
        public readonly ConcurrentBag<T> ObjectsInside = new ConcurrentBag<T>();
        [NonSerialized]
        public readonly ConcurrentDictionary<string, int> Counters = new ConcurrentDictionary<string, int>();
        public int ItemsInThisTree { get; set; }

        public string SparseBagId { get; set; }
        public int Depth { get; set; }

        public string TreeId { get; set; }

        public QuadTreeNode(double xCentroid, double yCentroid, double xWidth, double yWidth) : this(new QuadCentroid(xCentroid, yCentroid, xWidth, yWidth)) { }
        public QuadTreeNode(QuadCentroid centroid) { this.Centroid = centroid; CreationTime = DateTime.Now.ToString("s/m/H/dd/M/yyyy"); }

        // Critical
        public QuadTreeNode(QuadCentroid centroid, string treeId) {
            this.Centroid = centroid;
            this.TreeId = treeId;
        }
        public QuadTreeNode(double xCentroid, double yCentroid, double xWidth, double yWidth, string treeId) : this(new QuadCentroid(xCentroid, yCentroid, xWidth, yWidth)) {
            this.TreeId = treeId;
        }

        public List<QuadTreeNode<T>> ReturnMatchingQuadrants(T o) {
            return this.SubQuads.Where(o.IsWithin).ToList();
        }

        //TODO  rewriting this co-recursive function 
        public QuadTreeNode<T>[] ReturnMatchingQuadrants(double xCentroid, double ycentroid, double xWidth, double yWidth) {
            return this.SubQuads.Where(s => QuadMatchesRectangle(s, ComputeCorners(xCentroid, ycentroid, xWidth, yWidth))).ToArray();
        }

        private static List<double> ComputeCorners(double xCentroid, double ycentroid, double xWidth, double yWidth) {
            List<double> cornersCamera = new List<double> {
                xCentroid - xWidth / 2, // xMin
                xCentroid + xWidth / 2, // xMax
                ycentroid - yWidth / 2, // yMin
                ycentroid + yWidth / 2  // yMax
            };

            return cornersCamera;
        }

        /// <summary>
        /// TODO this code does need to be unit tested to ensure that the math is correct 
        /// TODO REGRESSION TEST: Quad crosses rectangle x border, and is completely between y borders
        /// </summary>
        /// <param name="quad">The quad.</param>
        /// <param name="cornersCamera">The corners camera.</param>
        /// <returns>true upon match</returns>
        private bool QuadMatchesRectangle(QuadTreeNode<T> quad, List<double> cornersCamera) {
            var pointInX = quad.Centroid.xCentroid >= cornersCamera[0] &&
                           quad.Centroid.xCentroid <= cornersCamera[1];
            var pointInY = quad.Centroid.yCentroid >= cornersCamera[2] &&
                           quad.Centroid.yCentroid <= cornersCamera[3];

            if (pointInX && pointInY) {
                return true;
            }

            var borderInBetweenX =
                    // Touching left border
                    quad.Centroid.xCentroid - quad.Centroid.xWidth / 2 <= cornersCamera[0]
                    && quad.Centroid.xCentroid + quad.Centroid.xWidth / 2 >= cornersCamera[0]
                    // Touching right border
                    || quad.Centroid.xCentroid - quad.Centroid.xWidth / 2 <= cornersCamera[1]
                    && quad.Centroid.xCentroid + quad.Centroid.xWidth / 2 >= cornersCamera[1]
                    // Between left and right border
                    || quad.Centroid.xCentroid - quad.Centroid.xWidth / 2 >= cornersCamera[0]
                    && quad.Centroid.xCentroid + quad.Centroid.xWidth / 2 <= cornersCamera[1]
                ;
            var borderInBetweenY =
                    // Touching upper border
                    quad.Centroid.yCentroid - quad.Centroid.yWidth / 2 <= cornersCamera[2]
                    && quad.Centroid.yCentroid + quad.Centroid.yWidth / 2 >= cornersCamera[2]
                    // Touching lower border
                    || quad.Centroid.yCentroid - quad.Centroid.yWidth / 2 <= cornersCamera[3]
                    && quad.Centroid.yCentroid + quad.Centroid.yWidth / 2 >= cornersCamera[3]
                    // Between upper and lower border
                    || quad.Centroid.yCentroid - quad.Centroid.yWidth / 2 >= cornersCamera[2]
                    && quad.Centroid.yCentroid + quad.Centroid.yWidth / 2 <= cornersCamera[3]
                ;
            if (borderInBetweenX && borderInBetweenY) {
                return true;
            }
            return false;
        }

        // todo check function to query through two different dimensions
        public void ReturnLeafs(double x, double y, double xWidth, double yWidth, List<QuadTreeNode<T>> listResult) {
            if (this.IsLeaf()) {
                // check if there is a matching element in the database of bags nodes containing objects? 
                listResult.Add(this);
                //yield return this;
            }
            // Else, return the quadrants that match
            else {
                QuadTreeNode<T>[] subQuads = ReturnMatchingQuadrants(x, y, xWidth, yWidth);
                foreach (var subQuad in subQuads) {
                    //foreach (var returnLeaf in subQuad.ReturnLeafs(raVal, decVal, fovVal))
                    //    { yield return returnLeaf;}
                    subQuad.ReturnLeafs(x, y, xWidth, yWidth, listResult);
                }
            }
        }

        public void ReturnLeafs(double raVal, double decVal, double fovVal, List<QuadTreeNode<T>> listResult) {
            if (this.IsLeaf()) {
                // check if there is a matching element in the database of bags nodes containing objects? 
                listResult.Add(this);
                //yield return this;
            }
            // Else, return the quadrants that match
            else {
                QuadTreeNode<T>[] subQuads = ReturnMatchingQuadrants(raVal, decVal, fovVal, fovVal);
                foreach (var subQuad in subQuads) {
                    //foreach (var returnLeaf in subQuad.ReturnLeafs(raVal, decVal, fovVal))
                    //    { yield return returnLeaf;}
                    subQuad.ReturnLeafs(raVal, decVal, fovVal, fovVal, listResult);
                }
            }
        }

        public void ReturnAllLeafs(List<QuadTreeNode<T>> listResult) {
            if (this.IsLeaf()) {
                // check if there is a matching element in the database of bags nodes containing objects? 
                listResult.Add(this);
                //yield return this;
            }
            // Else, return the quadrants that match
            else {
                foreach (var subQuad in this.SubQuads) {
                    //foreach (var returnLeaf in subQuad.ReturnLeafs(raVal, decVal, fovVal))
                    //    { yield return returnLeaf;}
                    subQuad.ReturnAllLeafs(listResult);
                }
            }
        }

        public void ReturnLeafsNames(double raVal, double decVal, double fovValX, double fovValY, ref string listResult) {
            if (this.IsLeaf()) {
                // check if there is a matching element in the database of bags nodes containing objects? 
                listResult += " " + (this.Guid);
                //yield return this;
            }
            // Else, return the quadrants that match
            else {
                QuadTreeNode<T>[] subQuads = ReturnMatchingQuadrants(raVal, decVal, fovValX, fovValY);
                foreach (var subQuad in subQuads) {
                    //foreach (var returnLeaf in subQuad.ReturnLeafs(raVal, decVal, fovVal))
                    //    { yield return returnLeaf;}
                    subQuad.ReturnLeafsNames(raVal, decVal, fovValX, fovValY, ref listResult);
                }
            }
        }


        // Leaf determined by either containing objects (leaf) or none (node)
        public bool IsLeaf() {
            return this.SubQuads == null;
        }

        public QuadTreeNode<T> GetSubQuads(int index) {
            return SubQuads[index];
        }

        public bool TryGenerateChildren(Action<string, QuadTreeNode<T>> registerQuadTree) {
            Console.WriteLine("---- TryGenerateChildren----");
            if (this.IsLeaf()) {
                // i.e. no other thread has already done this 
                // Locks
                lock (this.ObjectsInside) {
                    // avoid two threads running this method
                    if (this.IsLeaf()) {
                        // in case another thread beat us as we waited for the lock
                        var newquads = new QuadTreeNode<T>[4];
                        // Create sub quadtree
                        var cptSubTree = 0;
                        for (var i = 0; i < 2; i++) {
                            for (var j = 0; j < 2; j++) {
                                double newXCentroid = this.Centroid.xCentroid +
                                                      (i == 0 ? (-this.Centroid.xWidth / 4) : this.Centroid.xWidth / 4);
                                double newYCentroid = this.Centroid.yCentroid +
                                                      (j == 0 ? (-this.Centroid.yWidth / 4) : this.Centroid.yWidth / 4);
                                double newCentroidWidthX = this.Centroid.xWidth / 2;
                                double newCentroidWidthY = this.Centroid.yWidth / 2;

                                // Critical 
                                newquads[cptSubTree] = new QuadTreeNode<T>(newXCentroid, newYCentroid, newCentroidWidthX, newCentroidWidthY, this.TreeId);
                                //newquads[cptSubTree] = new QuadTreeNode<T>(newXCentroid, newYCentroid, newCentroidWidth);
                                registerQuadTree(newquads[cptSubTree].Guid, newquads[cptSubTree]);
                                cptSubTree++;
                            }
                        }

                        this.SubQuads = newquads;
                        return true;
                    }
                }
            }
            return false;
        }

        public int GetDepth() {
            int maxDepth = 0;
            if (this.IsLeaf()) {
                return maxDepth;
            }

            return 1 + this.SubQuads.Max(q => q.GetDepth());
        }

        public int GetNumberElements() {
            var rez = 0;
            if (this.IsLeaf()) {
                rez = this.ObjectsInside.Count
                    + this.Counters.GetOrAdd("Quad" + this.Guid + "_objectsPushedToMongo", 0);
            } else {
                if (this.SubQuads != null) {
                    foreach (var sq in this.SubQuads) {
                        rez += sq.GetNumberElements();
                    }
                }
            }
            return rez;
        }

        /// <summary>
        /// work our way through the quadtree finding leaves which overlap with the defined rectangle 
        /// </summary>
        /// <param name="xcenter">The xcenter.</param>
        /// <param name="ycenter">The ycenter.</param>
        /// <param name="xWidth">Width of the x.</param>
        /// <param name="yWidth">Width of the y.</param>
        /// <returns></returns>
        public List<QuadTreeNode<T>> ReturnMatchingLeaves(double xcenter, double ycenter, double xWidth, double yWidth) {

            List<QuadTreeNode<T>> matchingleaves = new List<QuadTreeNode<T>>();
            Stack<QuadTreeNode<T>> workList = new Stack<QuadTreeNode<T>>();// holds matching quadtree bits

            if (QuadMatchesRectangle(this, ComputeCorners(xcenter, ycenter, xWidth, yWidth))) {
                workList.Push(this);
            }


            while (workList.Any()) {
                var q = workList.Pop();


                if (q.IsLeaf()) {
                    matchingleaves.Add(q);
                } else {
                    foreach (var sq in q.ReturnMatchingQuadrants(xcenter, ycenter, xWidth, yWidth)) {
                        workList.Push(sq);// only add things which match
                    }
                }
            }


            return matchingleaves;
        }

        /// <summary>
        /// work our way through the quadtree finding leaves which overlap with the defined rectangle 
        /// todo this is a sparse implementation working from the top down 
        /// algorithm: 
        /// set up - take root node
        /// 
        /// order leaves by # elements in tree 
        /// then for each 
        ///    Replace node with children to leaf list iff they overlap with target
        /// 
        /// stop when # leafs requested is reached 
        /// </summary>
        /// <param name="xcenter">The xcenter.</param>
        /// <param name="ycenter">The ycenter.</param>
        /// <param name="xWidth">Width of the x.</param>
        /// <param name="yWidth">Width of the y.</param>
        /// <param name="bags"># bags to return</param>
        /// <returns></returns>
        public List<QuadTreeNode<T>> ReturnSparseMatchingLeaves(double xcenter, double ycenter, double xWidth,
            double yWidth, int bags) {

            // todo this is a sparse implementation working from the top down 
            // algorithm: 
            // set up - take root node
            // 
            // order leaves by # elements in tree 
            //  then for each 
            //    Replace node with children to leaf list iff they overlap with target
            // 
            // stop when # leafs requested is reached or recursion (no changes)


            List<QuadTreeNode<T>> matchingleaves = new List<QuadTreeNode<T>> { this };

            //Need to ensure all the quads has bags in it otherwise the json file can not be found
          
            // todo this method is a hack which is filtering out all of the sparse quad tree bags               
           // matchingleaves = ClearEmptyNode(matchingleaves, xcenter, ycenter, xWidth, yWidth);
            
            bool changes = true;
            //todo if we make sparse bags bigger than normal then we would need to have this condition as follows:
            // matchingleaves.Sum(l => l.IsLeaf() ? 1 : 4); 

            // todo alternatively we could simply count the number of objects contained 
            while (matchingleaves.Count < bags && changes) {
                
                changes = false;

                //var array = matchingleaves.OrderByDescending(b => b.ItemsInThisTree).ToArray();
                var array = matchingleaves.OrderBy(b => b.Depth).ToArray();
                //ef  done we could optimise to do direct 1-1 child replacements 
     //ef           for (int expansionfactor = 1; expansionfactor <= 4 && !changes; expansionfactor++) {// todo note this may cause issues with blocks of density
                for (var q = 0; q < array.Length && !changes; q++) {
                    // move to array to stop messing with the underlying collection
                    // exit after a single change - the ordering above will help us move through the tree
                    var leaf = array[q];

                    if (leaf.IsLeaf()) continue;
                    var matchingChildren = leaf.ReturnMatchingQuadrants(xcenter, ycenter, xWidth, yWidth);
                    //ef                   if (matchingChildren.Length == expansionfactor) {
                    matchingleaves.Remove(leaf);
                    matchingleaves.AddRange(matchingChildren);
                    changes = true;
                    //ef                   }
                    //ef               }
                }
                
                // todo we should do sort order by height in the quad tree? 
            
            }
            return matchingleaves;
        }
        private static List<QuadTreeNode<T>> ClearEmptyNode(List<QuadTreeNode<T>> nodelist, double xcenter, double ycenter, double xWidth, double yWidth) {
            var somelist = new List<QuadTreeNode<T>>();
            var nodeArrBefore = somelist.ToArray();
            var nodeListAfter = nodelist;
            while (nodeArrBefore.Length != nodeListAfter.Count) {
                nodeArrBefore = nodeListAfter.ToArray();
                foreach (QuadTreeNode<T> node in nodeArrBefore) {
                    if (node.IsLeaf()) {
                        continue;
                    }
                    var children = node.ReturnMatchingQuadrants(xcenter, ycenter, xWidth, yWidth);
                    if (children.Length == 4) {
                        nodeListAfter.AddRange(children);
                        nodeListAfter.Remove(node);
                    }
                }
            }
            return nodeListAfter;
        }
    }
}