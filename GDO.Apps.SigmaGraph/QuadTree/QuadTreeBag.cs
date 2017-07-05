using System;
using System.Collections.Generic;


// ReSharper disable InconsistentNaming matching MongoDb
// ReSharper disable MemberCanBePrivate.Global needs to be global for serialization
// ReSharper disable AutoPropertyCanBeMadeGetOnly.Global setter needed for serialization 
namespace GDO.Apps.SigmaGraph.QuadTree
{

    public class QuadTreeBag<T> {


        public Guid _id { get; set; }

        // Critical
        public string treeId { get; set; }

        /// <summary>
        /// Gets or sets the unique identifier - this is id of the quad tree NODE theese objects belonged to 
        /// </summary>
        public string quadId { get; set; }
        /// <summary>
        /// Gets or sets the unique identifier - this is the unique id of this bag
        /// </summary>
        public string bagId { get; set; }
        public List<T> Objects { get; set; }
        /// <summary>
        /// whether or not the bag needs some rework or not
        /// </summary>
        public bool NeedsRework { get; set; }

        #region ctors 
        //public QuadTreeBag(string s, List<T> lso) {
        //    bagId = System.Guid.NewGuid().ToString();
        //    quadId = s;
        //    Objects = lso;
        //}

        // Critical
        public QuadTreeBag(string s, List<T> lso, string treeId) {
            bagId = System.Guid.NewGuid().ToString();
            quadId = s;
            Objects = lso;
            this.treeId = treeId;
        }


        #endregion

        // Add object or list to a GuidObject based on its id
        public void AddToGuidQuad(string s, T so) {
            if (quadId == null) {
                quadId = s;
            }
            Objects.Add(so);
        }
        public void AddToGuidQuad(string s, List<T> so) {
            if (quadId == null) {
                quadId = s;
            }
            this.Objects.AddRange(so);
        }

    }
}
