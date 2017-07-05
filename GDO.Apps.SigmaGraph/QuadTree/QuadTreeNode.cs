using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using SpaceStructures.QuadTrees;

namespace GDO.Apps.SigmaGraph.QuadTree {
    /// <summary>
    /// The basic Node of the Quad Tree 
    /// </summary>
    /// <typeparam name="T">type held within the quadtree</typeparam>
    
    public class QuadTreeNode<T> where T : IQuadable<double> {
        public string Guid = System.Guid.NewGuid().ToString();
        public string CreationTime;
        public QuadCentroid centroid;
        public QuadTreeNode<T>[] SubQuads { get; set; }
        //internal QuadTreeNode<T>[] SubQuads { get; set; }
        public readonly ConcurrentBag<T> ObjectsInside = new ConcurrentBag<T>();
        public readonly ConcurrentDictionary<string, int> Counters = new ConcurrentDictionary<string, int>();

        public string treeId;

        public string nameNode { get; set; }

        public QuadTreeNode(double xCentroid, double yCentroid, double xWidth, double yWidth) : this(new QuadCentroid(xCentroid, yCentroid, xWidth,yWidth)) {}
        public QuadTreeNode(QuadCentroid centroid) { this.centroid = centroid; CreationTime = DateTime.Now.ToString("s/m/H/dd/M/yyyy"); }

        // Critical
        public QuadTreeNode(QuadCentroid centroid, string treeId) {
            this.centroid = centroid;
            this.treeId = treeId; 
        }
        public QuadTreeNode(double xCentroid, double yCentroid, double xWidth, double yWidth, string treeId) : this(new QuadCentroid(xCentroid, yCentroid, xWidth,yWidth)) {
            this.treeId = treeId;
        }

        public QuadTreeNode<T> ReturnQuadrant(double x, double y) {
            double xCentroid = this.centroid.xCentroid;
            double yCentroid = this.centroid.yCentroid;
            bool infMiddleX = x < xCentroid;
            bool infMiddleY = y < yCentroid;
            int indexOfPointed;
            if (infMiddleX) { indexOfPointed = infMiddleY ? 0 : 1; } else { indexOfPointed = infMiddleY ? 2 : 3; }
            return this.GetSubQuads(indexOfPointed);
        }

        public QuadTreeNode<T>[] ReturnQuadrants(double x, double y, double xWidth,double yWidth)
        {
            // A new filtering algorithm, using the xWidth, verifying for the 4 child of the nodesolo

            List<double> cornersCamera = new List<double>();
            cornersCamera.Add(x - xWidth/2 ); // xMin
            cornersCamera.Add(x + xWidth/2 ); // xMax
            cornersCamera.Add(y - yWidth/2 ); // yMin
            cornersCamera.Add(y + yWidth/2 ); // yMax

            List<int> indexOfPointed = new List<int>();
            List<string> indexGuids = new List<string>();
            // Naive algorithm, but seems ok
            // for each corner, verify if coordinates within the centroids +- xWidth/2 and then add it to the list of matching sub quad trees

            for (var j = 0; j < this.SubQuads.Length; j++) {

                var pointInX = SubQuads[j].centroid.xCentroid >= cornersCamera[0] && SubQuads[j].centroid.xCentroid <= cornersCamera[1];
                var pointInY = SubQuads[j].centroid.yCentroid >= cornersCamera[2] && SubQuads[j].centroid.yCentroid <= cornersCamera[3];

                if (pointInX && pointInY) {
                    if (indexOfPointed.All(item => item != j)) {
                        indexOfPointed.Add(j);
                        indexGuids.Add(SubQuads[j].Guid);
                    }
                } else {
                    var borderInBetweenX =
                    // Touching left border
                        SubQuads[j].centroid.xCentroid - SubQuads[j].centroid.xWidth / 2 <=  cornersCamera[0]  
                        && SubQuads[j].centroid.xCentroid + SubQuads[j].centroid.xWidth / 2 >= cornersCamera[0] 
                    // Touching right border
                    || SubQuads[j].centroid.xCentroid - SubQuads[j].centroid.xWidth / 2 <= cornersCamera[1]
                        && SubQuads[j].centroid.xCentroid + SubQuads[j].centroid.xWidth / 2 >= cornersCamera[1]
                        ;
                    var borderInBetweenY =
                        // Touching left border
                        SubQuads[j].centroid.yCentroid - SubQuads[j].centroid.yWidth / 2 <= cornersCamera[2]
                        && SubQuads[j].centroid.yCentroid + SubQuads[j].centroid.yWidth / 2 >= cornersCamera[2]
                    // Touching right border
                    || SubQuads[j].centroid.yCentroid - SubQuads[j].centroid.yWidth / 2 <= cornersCamera[3]
                        && SubQuads[j].centroid.yCentroid + SubQuads[j].centroid.yWidth / 2 >= cornersCamera[3]
                        ;

            // todo removed for json       Debug.WriteLine("Guid: " + this.Guid + ", cornersCamera: " + cornersCamera() +
            //                       ", SubQuads[j].centroid " + SubQuads[j].centroid.ToJson()
            //                       + ", inBetweenX : " + borderInBetweenX + ", inBetweenY: " + borderInBetweenY);
                    if (borderInBetweenX && borderInBetweenY) {
                        Debug.WriteLine("InBetweenX && inBetweenY");
                        // What was that for?
                        if (indexOfPointed.All(item => item != j)) {
                            indexOfPointed.Add(j);
                            indexGuids.Add(SubQuads[j].Guid);
                        }
                    }
                }
            }
            
            return this.GetSubQuadss(indexOfPointed);
        }



        private QuadTreeNode<T>[] GetSubQuadss(List<int> indexOfPointed) {
            List<QuadTreeNode<T>> listNodes = new List<QuadTreeNode<T>>();
            for (var i = 0; i < indexOfPointed.Count; i++) {
                listNodes.Add(SubQuads[indexOfPointed[i]]);
            }
            return listNodes.ToArray();
        }

        // todo check function to query through two different dimensions
        public void ReturnLeafs(double x, double y, double xWidth, double yWidth, List<QuadTreeNode<T>> listResult)
        {
            if (this.IsLeaf())
            {
                // check if there is a matching element in the database of bags nodes containing objects? 
                listResult.Add(this);
                //yield return this;
            }
            // Else, return the quadrants that match
            else
            {
                QuadTreeNode<T>[] subQuads = ReturnQuadrants(x, y, xWidth,yWidth);
                foreach (var subQuad in subQuads)
                {
                    //foreach (var returnLeaf in subQuad.ReturnLeafs(raVal, decVal, fovVal))
                    //    { yield return returnLeaf;}
                    subQuad.ReturnLeafs(x, y, xWidth,yWidth, listResult);
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
            else
            {
                QuadTreeNode<T>[] subQuads = ReturnQuadrants(raVal, decVal, fovVal,fovVal);
                foreach (var subQuad in subQuads) {
                    //foreach (var returnLeaf in subQuad.ReturnLeafs(raVal, decVal, fovVal))
                    //    { yield return returnLeaf;}
                    subQuad.ReturnLeafs(raVal, decVal,fovVal, fovVal, listResult);
                }
            }
        }

        public void ReturnAllLeafs(List<QuadTreeNode<T>> listResult)
        {
            if (this.IsLeaf())
            {
                // check if there is a matching element in the database of bags nodes containing objects? 
                listResult.Add(this);
                //yield return this;
            }
            // Else, return the quadrants that match
            else
            {
                foreach (var subQuad in  this.SubQuads)
                {
                    //foreach (var returnLeaf in subQuad.ReturnLeafs(raVal, decVal, fovVal))
                    //    { yield return returnLeaf;}
                    subQuad.ReturnAllLeafs(listResult);
                }
            }
        }



        public void ReturnLeafsNames(double raVal, double decVal, double fovValX,double fovValY, ref string listResult)
        {
            if (this.IsLeaf())
            {
                // check if there is a matching element in the database of bags nodes containing objects? 
                listResult += " "+(this.Guid);
                //yield return this;
            }
            // Else, return the quadrants that match
            else
            {
                // todo 
                QuadTreeNode<T>[] subQuads = ReturnQuadrants(raVal, decVal, fovValX,fovValY);
                foreach (var subQuad in subQuads)
                {
                    //foreach (var returnLeaf in subQuad.ReturnLeafs(raVal, decVal, fovVal))
                    //    { yield return returnLeaf;}
                    subQuad.ReturnLeafsNames(raVal, decVal, fovValX,fovValY, ref listResult);
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
                                double newXCentroid = this.centroid.xCentroid +
                                                      (i == 0 ? (-this.centroid.xWidth / 4) : this.centroid.xWidth / 4);
                                double newYCentroid = this.centroid.yCentroid +
                                                      (j == 0 ? (-this.centroid.yWidth / 4) : this.centroid.yWidth / 4);
                                double newCentroidWidthX = this.centroid.xWidth / 2;
                                double newCentroidWidthY = this.centroid.yWidth / 2;

                                // Critical 
                                newquads[cptSubTree] = new QuadTreeNode<T>(newXCentroid, newYCentroid, newCentroidWidthX, newCentroidWidthY, this.treeId);
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
            }
            else {
                if (this.SubQuads != null) {
                    foreach (var sq in this.SubQuads) {
                        rez += sq.GetNumberElements();
                    }
                }
            }
            return rez;
        }

    }
}