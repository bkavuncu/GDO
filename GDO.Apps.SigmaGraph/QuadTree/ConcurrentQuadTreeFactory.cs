using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using GDO.Apps.SigmaGraph.Domain;

namespace GDO.Apps.SigmaGraph.QuadTree
{
    /// <summary>
    /// A class for coordinating the creation of quad trees using concurrent methods
    /// </summary>
#pragma warning disable 693 - type parameter has the same name  db805 - i dont see any problems with this.
    public class ConcurrentQuadTreeFactory<T> : AConcurrentQuadTreeFactory<T> where T : IQuadable<double>
    {
#pragma warning restore 693

        /// <summary>
        /// The _shed bags - index by QuadID and 
        /// </summary>
        private readonly ConcurrentDictionary<string, ConcurrentBag<QuadTreeBag<T>>>
            _shedBags= new ConcurrentDictionary<string, ConcurrentBag<QuadTreeBag<T>>>();

        private readonly ConcurrentBag<QuadTreeBag<T>> _bagsForRework
            = new ConcurrentBag<QuadTreeBag<T>>();
        private readonly ConcurrentBag<string> quadIdsWhichHaveBeenReworked = new ConcurrentBag<string>();

        public ConcurrentQuadTreeFactory(QuadCentroid centroid,
            int maxbags = 10, int maxobjectPerBag = 500, int maxWorklistSize = 250, int delay = 5)
        {
            Console.WriteLine("---- ConcurrentQuadTreeFactory ----");
            Maxbags = maxbags;
            MaxobjectPerBag = maxobjectPerBag;
            MaxWorklistSize = maxWorklistSize;
            this.Delay = delay;
            this.QuadTree = new QuadTree<T>(centroid,               
                ShedObjects,
                MarkObjectsForRework,
                RegisterQuad, maxBagsBeforeSplit: Maxbags,
                maxObjectsPerBag: MaxobjectPerBag);
        }

        protected override void ShedObjects(QuadTreeBag<T> bag)
        {
            Console.WriteLine("---- ShedObjects ----");

            this._shedBags.AddOrUpdate(bag.quadId, new ConcurrentBag<QuadTreeBag<T>> { bag },
                (guid, objs) => {
                    objs.Add(bag);
                    return objs;
                }
            );

            if (quadIdsWhichHaveBeenReworked.Contains(bag.quadId))
            {
                MarkObjectsForRework(bag.quadId);
            }
        }

        protected override void RegisterQuad(string guid, QuadTreeNode<T> quad)
        {
            this.Quads.AddOrUpdate(guid, quad, (dupguid, dupquad) => {
                throw new ArgumentException("guid colission");
#pragma warning disable 162  i know this code is unreachablee
                return dupquad;
#pragma warning restore 162
            });
        }

        protected override void MarkObjectsForRework(string quadGuid)
        {
            Console.WriteLine("---- MarkObjectsForRework ----");

            quadIdsWhichHaveBeenReworked.Add(quadGuid);

            // pull all the bags for the quad tree
            ConcurrentBag<QuadTreeBag<T>> bagtoReWork = _shedBags.GetOrAdd(quadGuid, new ConcurrentBag<QuadTreeBag<T>>());

            // place those bags within the rework list
            QuadTreeBag<T> bag;
            while (bagtoReWork.TryTake(out bag))
            {
                this._bagsForRework.Add(bag);
            }
        }

        public override bool HasCleanState()
        {
            var hasCleanState = Worklist.IsEmpty && ReworkQueueEmpty();
            if (!hasCleanState)
            {
                Console.WriteLine("Bad state");
            }
            return hasCleanState;
        }

        public override int TotalObjectsInStorage()
        {
            return this._shedBags.Sum(quadbags => quadbags.Value.Sum(b => b.Objects.Count));
        }

        public override string PrintState()
        {
            StringBuilder sb = new StringBuilder();
            sb.Append(base.PrintState());
            sb.AppendLine($"reworklist = {this._bagsForRework.Count}");
            sb.AppendLine($"shedlist = {this._shedBags.Count}");
            return sb.ToString();
        }

        protected override bool ReworkQueueEmpty()
        {
            return this._bagsForRework.IsEmpty;
        }

        public override bool GetReworkBag(out QuadTreeBag<T> bag)
        {
            return this._bagsForRework.TryTake(out bag); // pass by reference (twice)
        }

        public override string PrintShedBags()
        {
            return this._shedBags.Aggregate("number of bags " + this._shedBags.Count,
                (acc, next) => acc + Environment.NewLine +
                               next.Key + "=" + next.Value.Count + "bags " +
                               next.Value.Aggregate("", (n, a) => n + "," + a.Objects.Count + (a.NeedsRework ? "!" : "")));
        }

        // todo Remove after tests. Should never be called
        public override bool GetReworkBag(out QuadTreeBag<T> bag, string treeId) {
            return this._bagsForRework.TryTake(out bag); // pass by reference (twice)
        }

        public override QuadTreeBag<T>[] GetBagsForQuad(QuadTreeNode<T> quad) {
            ConcurrentBag<QuadTreeBag<T>> res;
            if (this._shedBags.TryGetValue(quad.Guid, out res)) {
                return res.ToArray();
            }
            return new QuadTreeBag<T>[0];
        }

        public override Dictionary<string, QuadTreeNode<T>> SelectLeafs() {
            return this.Quads.Where(q => q.Value.IsLeaf()).ToDictionary(q => q.Key, q => q.Value);
        }
    }
}
