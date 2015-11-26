using System;
using System.Collections.Generic;
using System.Linq;
using GDO.Apps.Graph.Domain;
using GDO.Core;

namespace GDO.Apps.Graph
{
    internal static class GraphPartitioning
    {
        private static PartitionPos PartionPosition(Position pos,Section section)
        {
            // previously bug: didn't divide Section.Height by Section.Rows, which makes it divide by the dimension of whole section, hence all nodes appear in the first file
            // cast it to int; Section.Height/Section.Rows to get height of single display

            return new PartitionPos
            {
                Row = (int) Math.Floor(pos.Y/(section.Height/(double) section.Rows)),
                Col = (int) Math.Floor(pos.X/(section.Width/(double) section.Cols))
            };
        }


        internal static Partition[,] InitializeNodePartition(int totalRows, int totalCols)
        {
            var nodesPartitions = new Partition[totalRows, totalCols];

            // initialise elements within array
            for (int i = 0; i < totalRows; i++)
            {
                for (int j = 0; j < totalCols; j++)
                {
                    nodesPartitions[i, j] = new Partition
                    {
                        partitionPos = new PartitionPos
                        {
                            Row = i,
                            Col = j
                        },
                        Nodes = new List<GraphNode>(),
                        Links = new List<GraphLink>()
                    };
                }
            }
            return nodesPartitions;
        }

        internal static Partition[,] DistributeNodesInPartitions(Partition[,] partitions, List<GraphNode> nodes, Section section)
        {
            // distribute nodes into respective partitions
            foreach (GraphNode n in nodes)
            {
                PartitionPos nodePartitionPos = PartionPosition(n.Pos, section);
                partitions[nodePartitionPos.Row, nodePartitionPos.Col].Nodes.Add(n);
            }
            return partitions;
        }

        internal static Partition[,] DistributeLinksInPartitions(Partition[,] partitions, List<GraphLink> links, int singleDisplayWidth,
            int singleDisplayHeight, Section section)
        {

            // distribute links into respective partitions
            foreach (GraphLink link in links)
            {
                Position startPos, endPos;

                // set starting point to the one with smaller x, without changing original data
                if (link.StartPos.X > link.EndPos.X)
                {
                    startPos = link.EndPos;
                    endPos = link.StartPos;
                }
                else
                {
                    startPos = link.StartPos;
                    endPos = link.EndPos;
                }

                PartitionPos startPartitionPos = PartionPosition(startPos, section);
                PartitionPos endPartitionPos = PartionPosition(endPos, section);

                // colDiff will always be >= 0, since we have set starting point's x to be smaller
                // rowDiff may be < 0

                int colDiff = endPartitionPos.Col - startPartitionPos.Col;
                int rowDiff = endPartitionPos.Row - startPartitionPos.Row;

                // find lines between the two points to check for intersection
                List<int> horizontalLines = new List<int>(); // y = a
                List<int> verticalLines = new List<int>(); // x = b

                for (int j = 0; j < colDiff; ++j)
                {
                    verticalLines.Add((startPartitionPos.Col + 1 + j)*singleDisplayWidth);
                }

                if (rowDiff > 0)
                {
                    for (int j = 0; j < rowDiff; ++j)
                    {
                        horizontalLines.Add((startPartitionPos.Row + 1 + j)*singleDisplayHeight);
                    }
                }
                else if (rowDiff < 0)
                {
                    for (int j = -rowDiff; j > 0; --j)
                    {
                        horizontalLines.Add((startPartitionPos.Row + 1 - j)*singleDisplayHeight);
                    }
                }

                // check for different cases & push link onto respective browser

                // START OF IMPROVED INTERSECTION ALGORITHM
                // cases:
                // 1. Nodes in the same partition
                // 2. Nodes in different partitions

                if (rowDiff == 0 && colDiff == 0)
                {
                    partitions[startPartitionPos.Row, startPartitionPos.Col].Links.Add(link);
                }
                else
                {
                    // 1. find intersections
                    //    - get vertical and horizontal lines in between
                    //    - calculate intersections with these lines using line equation
                    // 2. add start and end points to intersections array; and sort the array by x
                    // 3. loop through array; for every two consecutive points, find the partition it belongs to, and add to it

                    // calculate line equation y = mx + c
                    var m = (endPos.Y - startPos.Y)/(endPos.X - startPos.X);
                    var c = startPos.Y - m * startPos.X;

                    // get intersection points
                    // check for x intersection with horizontal line (y = a)
                    List<Position> intersections = horizontalLines.Select(y => new Position
                    {
                        X = (y - c)/m,
                        Y = y
                    }).ToList();
                    // check for y intersection with vertical line (x = b)
                    intersections.AddRange(verticalLines.Select(x => new Position
                    {
                        X = x,
                        Y = (m*x) + c
                    }));

                    intersections.Add(startPos);
                    intersections.Add(endPos);

                    // sort list of intersections by x coordinate using Linq
                    List<Position> sortedIntersections = intersections.OrderBy(o => o.X).ToList();


                    // TODO: check if there's a need for garbage collection
                    intersections = sortedIntersections;

                    // place link into respective browsers
                    for (int j = 0; j < intersections.Count - 1; ++j)
                    {
                        // intersections.length - 1 because the loop handles two intersections at a time

                        // calculate midPoint, and use it to calculate partition position
                        // greatly simplify calculation, rather than using both start, end points and calculate using other ways

                        Position midPoint = new Position
                        {
                            X = (intersections[j].X + intersections[j + 1].X)/2,
                            Y = (intersections[j].Y + intersections[j + 1].Y)/2
                        };

                        PartitionPos segmentPos = PartionPosition(midPoint, section);

                        var linkSegment = new GraphLink
                        {
                            StartPos = intersections[j],
                            EndPos = intersections[j + 1]
                        };

                        partitions[segmentPos.Row, segmentPos.Col].Links.Add(linkSegment);
                    }
                }
            }
            return partitions;
        }

    }
}