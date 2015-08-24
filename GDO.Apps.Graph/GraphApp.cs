using System;
using System.Diagnostics;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using GDO.Core;
using GDO.Utility;
using Newtonsoft.Json;
using System.Net;

/* transcoded from javascript distributeGraph.js

*/

namespace GDO.Apps.Graph
{

    public class GraphApp : IAppInstance
    {
        public int Id { get; set; }
        public Section Section { get; set; }
        public AppConfiguration Configuration { get; set; }

        public string FolderNameDigit { get; set; }
        /*
        public string ImageName { get; set; }
        
        public int DisplayMode { get; set; }
        public Image[,] Tiles { get; set; }
        */

        // set up classes for graph data
        public class RectDimension
        {
            public double width { get; set; }
            public double height { get; set; }
        }

        public class Pos
        {
            public double x { get; set; }
            public double y { get; set; }
        }

        public class Node
        {
            public int id { get; set; }
            public Pos pos { get; set; }
        }


        public class LinkPos
        {
            public Pos from { get; set; }
            public Pos to { get; set; }
        }

        public class Link
        {
            public int fromId { get; set; }
            public int toId { get; set; }
            public LinkPos pos { get; set; }
        }

        public class GraphCompleteData
        {
            public RectDimension rectDimension { get; set; }
            public List<Node> nodes { get; set; }
            public List<Link> links { get; set; }
        }



        // extra classes for individual browser's output
        public class BrowserPos
        {
            public int row { get; set; }
            public int col { get; set; }
        }


        public class GraphPartitionData
        {
            public BrowserPos browserPos { get; set; }
            public List<Node> nodes { get; set; }
            public List<Link> links { get; set; }

        }

        public class Scales
        {
            public double x { get; set; }
            public double y { get; set; }
        }


        /*
        public class Intersection
        {
            public Pos pos { get; set; }
            public string type { get; set; }
            public int number { get; set; }

        }
        */

        // init is run when 'Deploy' is clicked
        public void init(int instanceId, Section section, AppConfiguration configuration)
        {
            this.Id = instanceId;
            this.Section = section;
            this.Configuration = configuration;
            Directory.CreateDirectory(System.Web.HttpContext.Current.Server.MapPath("~/") + @"\Web\Graph\graph");
        }

        public BrowserPos checkBrowserPos(Pos pos)
        {
            BrowserPos browserPos = new BrowserPos();
            // previously bug: didn't divide Section.Height by Section.Rows, which makes it divide by the dimension of whole section, hence all nodes appear in the first file
            browserPos.row = (int)(Math.Floor(pos.y / (Section.Height / Section.Rows))); // cast it to int
            browserPos.col = (int)(Math.Floor(pos.x / (Section.Width / Section.Cols)));
            return browserPos;
        }


        public string ProcessGraph(string fileName) 
        {

            //string fileName = @"output_10000nodes_15000links.json";   
           
            //string filePath = @"http://dsigdopreprod.doc.ic.ac.uk/DavidChia/" + fileName;
            string filePath = System.Web.HttpContext.Current.Server.MapPath("~/") + @"\Web\Graph\output.json";    //local file

            System.Diagnostics.Debug.WriteLine("Reading from: " + filePath);

            WebClient client = new WebClient();

            // error exception is being handled centrally at GraphAppHub
            // it will throw exception up the stack if file cannot be read
            
            //StreamReader file = new StreamReader(client.OpenRead(filePath));
            StreamReader file = File.OpenText(filePath); //for local file

            JsonTextReader reader = new JsonTextReader(file);
            JsonSerializer serializer = new JsonSerializer();
            GraphCompleteData graphData = serializer.Deserialize<GraphCompleteData>(reader);


            List<Node> nodes = graphData.nodes;
            List<Link> links = graphData.links;
            RectDimension rectDimension = graphData.rectDimension;

            int singleDisplayHeight = (int)(Section.Height / Section.Rows);
            int singleDisplayWidth = (int)(Section.Width / Section.Cols);

            // transform data to GDO dimension
            Scales scales = new Scales();
            scales.x = Section.Width / rectDimension.width;
            scales.y = Section.Height / rectDimension.height;

            Double scaleDown = 0.9; // to make graph smaller and nearer to (0, 0)

            Stopwatch sw = new Stopwatch();
            sw.Start();

            for (int i = 0; i < nodes.Count; i++)
            {
                nodes[i].pos.x *= scales.x * scaleDown;
                nodes[i].pos.y *= scales.y * scaleDown;

                // add padding on x, y to centralise graph after being scaled down
                nodes[i].pos.x += Section.Width * (1 - scaleDown) / 2;
                nodes[i].pos.y += Section.Height * (1 - scaleDown) / 2;
            }

            for (int i = 0; i < links.Count; i++)
            {
                links[i].pos.from.x *= scales.x * scaleDown;
                links[i].pos.from.y *= scales.y * scaleDown;
                links[i].pos.to.x *= scales.x * scaleDown;
                links[i].pos.to.y *= scales.y * scaleDown;

                links[i].pos.from.x += Section.Width * (1 - scaleDown) / 2;
                links[i].pos.from.y += Section.Height * (1 - scaleDown) / 2;
                links[i].pos.to.x += Section.Width * (1 - scaleDown) / 2;
                links[i].pos.to.y += Section.Height * (1 - scaleDown) / 2;
            }

            sw.Stop();
            System.Diagnostics.Debug.WriteLine("Time to scale links & nodes: " + sw.ElapsedMilliseconds);


            // distribute data across browser
            sw.Restart();

            GraphPartitionData[,] partitionData = new GraphPartitionData[Section.Rows, Section.Cols];

            // previously forgot to initialise elements within array
            for (int i = 0; i < Section.Rows; i++)
            {
                for (int j = 0; j < Section.Cols; j++)
                {
                    partitionData[i, j] = new GraphPartitionData();
                    // previously forgot to initialise objects within object; check if this is the right way
                    partitionData[i, j].browserPos = new BrowserPos();
                    partitionData[i, j].browserPos.row = i;
                    partitionData[i, j].browserPos.col = j;
                    partitionData[i, j].nodes = new List<Node>();
                    partitionData[i, j].links = new List<Link>();
                }
            }


            // distribute nodes
            for (int i = 0; i < nodes.Count; i++)
            {
                BrowserPos nodeBrowserPos = checkBrowserPos(nodes[i].pos);
                partitionData[nodeBrowserPos.row, nodeBrowserPos.col].nodes.Add(nodes[i]);
            }

            sw.Stop();
            System.Diagnostics.Debug.WriteLine("Time taken to distribute nodes across browsers: " + sw.ElapsedMilliseconds);

            sw.Restart();

            // distribute links
            for (int i = 0; i < links.Count; i++)
            {
                Link link = links[i];

                Pos startPos, endPos;

                // set starting point to the one with smaller x, without changing original data
                if (link.pos.from.x > link.pos.to.x)
                {
                    startPos = link.pos.to;
                    endPos = link.pos.from;
                }
                else
                {
                    startPos = link.pos.from;
                    endPos = link.pos.to;
                }

                BrowserPos startBrowserPos = checkBrowserPos(startPos);
                BrowserPos endBrowserPos = checkBrowserPos(endPos);

                // note:
                // colDiff will always be >= 0, since we have set starting point's x to be smaller
                // rowDiff may be < 0

                int colDiff = endBrowserPos.col - startBrowserPos.col;
                int rowDiff = endBrowserPos.row - startBrowserPos.row;

                // find lines between the two points to check for intersection
                List<int> horizontalLines = new List<int>(); // y = a
                List<int> verticalLines = new List<int>(); // x = b

                for (int j = 0; j < colDiff; ++j)
                {
                    verticalLines.Add((startBrowserPos.col + 1 + j) * singleDisplayWidth);
                }

                if (rowDiff > 0)
                {
                    for (int j = 0; j < rowDiff; ++j)
                    {
                        horizontalLines.Add((startBrowserPos.row + 1 + j) * singleDisplayHeight);
                    }
                }
                else if (rowDiff < 0)
                {
                    for (int j = -rowDiff; j > 0; --j)
                    {
                        horizontalLines.Add((startBrowserPos.row + 1 - j) * singleDisplayHeight);
                    }
                }

                // check for different cases & push link onto respective browser

                // START OF IMPROVED INTERSECTION ALGORITHM
                // cases:
                // 1. both in the same partition
                // 2. both in different partitions

                if (rowDiff == 0 && colDiff == 0)
                {
                    partitionData[startBrowserPos.row, startBrowserPos.col].links.Add(link);
                }
                else
                {
                    // 1. find intersections
                    //    - get vertical and horizontal lines in between
                    //    - calculate intersections with these lines using line equation
                    // 2. add start and end points to intersections array; and sort the array by x
                    // 3. loop through array; for every two consecutive points, find the partition it belongs to, and add to it

                    // calculate line equation y = mx + c
                    var m = (endPos.y - startPos.y) / (endPos.x - startPos.x);
                    var c = startPos.y - (m * startPos.x);

                    // get intersection points
                    List<Pos> intersections = new List<Pos>();

                    // check for x intersection with horizontal line (y = a)
                    for (int j = 0; j < horizontalLines.Count; ++j)
                    {
                        int y = horizontalLines[j];
                        Pos intersection = new Pos();

                        intersection.x = (y - c) / m;
                        intersection.y = y;
                        
                        intersections.Add(intersection);
                    }

                    // check for y intersection with vertical line (x = b)
                    for (int j = 0; j < verticalLines.Count; ++j)
                    {
                        int x = verticalLines[j];
                        Pos intersection = new Pos();
         
                        intersection.x = x;
                        intersection.y = (m * x) + c;
                        
                        intersections.Add(intersection);
                    }

                    intersections.Add(startPos);
                    intersections.Add(endPos);

                    // sort list of intersections by x coordinate using Linq
                    List<Pos> sortedIntersections = intersections.OrderBy(o => o.x).ToList();


                    // TODO: check if there's a need for garbage collection
                    intersections = sortedIntersections;

                    // place link into respective browsers
                    for (int j = 0; j < intersections.Count - 1; ++j)
                    {  // intersections.length - 1 because the loop handles two intersections at a time

                        // calculate midPoint, and use it to calculate partition position
                        // greatly simplify calculation, rather than using both start, end points and calculate using other ways

                        Pos midPoint = new Pos();
                        midPoint.x = (intersections[j].x + intersections[j + 1].x) / 2;
                        midPoint.y = (intersections[j].y + intersections[j + 1].y) / 2;

                        BrowserPos segmentPos = checkBrowserPos(midPoint);

                        partitionData[segmentPos.row, segmentPos.col].links.Add(link);
                      
                    }


                }


                /*
                // regardless of where the end point is, the starting browser definitely should have the link
                // equivalently to basic case where colDiff == 0 && rowDiff == 0
                partitionData[startBrowserPos.row, startBrowserPos.col].links.Add(link);

                // cases:
                // 1. both in the same browser
                // 2. both in different browsers, but on the same row or same col
                // 3. both in different browsers, diff row and diff col

                if (rowDiff != 0 && colDiff == 0)
                {
                    // no colDiff means all are on same column, but different rows
                    if (rowDiff > 0)
                    {
                        for (int j = 0; j < rowDiff; ++j)
                        {
                            partitionData[startBrowserPos.row + 1 + j, startBrowserPos.col].links.Add(link);
                        }
                    }
                    else
                    { //rowDiff < 0
                        for (int j = -rowDiff; j > 0; --j)
                        {  // previous bug, didn't put - in front of rowDiff, this condition will always be false, since rowDiff is negative at the start
                            partitionData[startBrowserPos.row - j, startBrowserPos.col].links.Add(link);
                        }
                    }
                }
                else if (rowDiff == 0 && colDiff != 0)
                {
                    for (int j = 0; j < colDiff; ++j)
                    {
                        partitionData[startBrowserPos.row, startBrowserPos.col + 1 + j].links.Add(link);
                    }
                }
                else if (rowDiff != 0 && colDiff != 0)
                {
                    // check for intersections & place into respective browsers

                    // calculate line equation y = mx + c
                    var m = (endPos.y - startPos.y) / (endPos.x - startPos.x);
                    var c = startPos.y - (m * startPos.x);

                    // get intersection points
                    List<Intersection> intersections = new List<Intersection>();

                    // check for x intersection with horizontal line (y = a)
                    for (int j = 0; j < horizontalLines.Count; ++j)
                    {
                        int y = horizontalLines[j];
                        Intersection intersection = new Intersection();
                        intersection.pos = new Pos();
                        intersection.pos.x = (y - c) / m;
                        intersection.pos.y = y;
                        intersection.type = "horizontal";
                        intersection.number = (int)(Math.Floor(intersection.pos.x / singleDisplayWidth));
                        // to get which col it belongs to

                        intersections.Add(intersection);
                    }

                    // check for y intersection with vertical line (x = b)
                    for (int j = 0; j < verticalLines.Count; ++j)
                    {
                        int x = verticalLines[j];
                        Intersection intersection = new Intersection();
                        intersection.pos = new Pos();
                        intersection.pos.x = x;
                        intersection.pos.y = (m * x) + c;
                        intersection.type = "vertical";
                        intersection.number = (int)(Math.Floor(intersection.pos.y / singleDisplayHeight));
                        // to get which row it belongs to

                        intersections.Add(intersection);
                    }

                    // sort list of intersections by x coordinate using Linq
                    List<Intersection> sortedIntersections = intersections.OrderBy(o => o.pos.x).ToList();


                    foreach (Intersection intersection in sortedIntersections)
                    {
                        System.Diagnostics.Debug.WriteLine("Intersection's x coordinate: " + intersection.pos.x);
                    }

                    // TODO: check if there's a need for garbage collection
                    intersections = sortedIntersections;

                    // place link into respective browsers based on intersection points
                    for (int j = 0; j < intersections.Count - 1; ++j)
                    {  // intersections.length - 1 because the loop handles two intersections at a time

                        if (intersections[j].type == "vertical" && intersections[j + 1].type == "horizontal")
                        {
                            partitionData[intersections[j].number, intersections[j + 1].number].links.Add(link);
                        }
                        else if (intersections[j].type == "horizontal" && intersections[j + 1].type == "vertical")
                        {
                            partitionData[intersections[j + 1].number, intersections[j].number].links.Add(link);
                        }
                        else if (intersections[j].type == "vertical" && intersections[j + 1].type == "vertical")
                        {
                            partitionData[intersections[j].number, (int)(intersections[j].pos.x / singleDisplayWidth)].links.Add(link);
                        }
                        else if (intersections[j].type == "horizontal" && intersections[j + 1].type == "horizontal")
                        {
                            // Math.min is used to find the smaller y and get its row
                            partitionData[(int)(Math.Min(intersections[j].pos.y, intersections[j + 1].pos.y) / singleDisplayHeight), intersections[j].number].links.Add(link);
                        }
                    }

                    // for other cases, link is already added to the last browser; except for this case
                    partitionData[endBrowserPos.row, endBrowserPos.col].links.Add(link);
                }
                */

            }

            sw.Stop();
            System.Diagnostics.Debug.WriteLine("Time taken to distribute links across browsers: " + sw.ElapsedMilliseconds);

            // write to individual browser file
            // create sub-directory to store partition files

            String basePath = System.Web.HttpContext.Current.Server.MapPath("~/") + @"\Web\Graph\graph\\";

            // Generate random numbers as folder name
            Random randomDigitGenerator = new Random();

            while (Directory.Exists(basePath + FolderNameDigit))
            {
                this.FolderNameDigit = randomDigitGenerator.Next(10000, 99999).ToString();
            }

            Directory.CreateDirectory(basePath + FolderNameDigit);

            sw.Restart();

            // write to file
            for (int i = 0; i < Section.Rows; i++)
            {
                for (int j = 0; j < Section.Cols; j++)
                {
                    //TODO: replace autoflush by 'using', to flush the last buffer right away
                    StreamWriter streamWriter = new StreamWriter(basePath + FolderNameDigit + "\\" + "partition" + @"_" + i + @"_" + j + @".json");
                    streamWriter.AutoFlush = true;
                    JsonWriter jsonWriter = new JsonTextWriter(streamWriter);
                    serializer.Serialize(jsonWriter, partitionData[i, j]);
                }
            }

            sw.Stop();
            System.Diagnostics.Debug.WriteLine("Time taken to write file: " + sw.ElapsedMilliseconds);

            return this.FolderNameDigit;
        }
    }
}
