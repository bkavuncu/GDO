using System.Collections.Generic;
using GDO.Core;

namespace GDO.Apps.SigmaGraph
{
    public class PartitionedGraphState
    {
        private readonly int _numGraphPartitions;
        private readonly ISet<int> _availablePartitionIds;

        public PartitionedGraphState(Section section)
        {
            _numGraphPartitions = section.Rows * section.Cols;
            _availablePartitionIds = new HashSet<int>();
        }

        public bool AllAvailable => _availablePartitionIds.Count == _numGraphPartitions;

        public void SetAllUnavailable()
        {
            _availablePartitionIds.Clear();
        }

        public void SetAvailable(int clientId)
        {
            _availablePartitionIds.Add(clientId);
        }
    }
}