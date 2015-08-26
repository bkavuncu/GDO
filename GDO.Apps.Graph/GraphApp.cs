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


        public class Pos
        {
            public float x { get; set; }
            public float y { get; set; }
        }

        public class PartitionPos
        {
            public int row { get; set; }
            public int col { get; set; }
        }

        public class RectDimension
        {
            public float width { get; set; }
            public float height { get; set; }
        }

        public class Scales
        {
            public float x { get; set; }
            public float y { get; set; }
        }

        public class Node
        {
            public Pos pos { get; set; }
            public int numLinks { get; set; }
        }

        public class Link
        {
            public Pos startPos { get; set; }
            public Pos endPos { get; set; }
        }

        public class NodePartition
        {
            public PartitionPos partitionPos { get; set; }
            public List<Node> nodes { get; set; }
        }

        public class LinkPartition
        {
            public PartitionPos partitionPos { get; set; }
            public List<Link> links { get; set; }
        }


        // init is run when 'Deploy' is clicked
        public void init(int instanceId, Section section, AppConfiguration configuration)
        {
            this.Id = instanceId;
            this.Section = section;
            this.Configuration = configuration;
            Directory.CreateDirectory(System.Web.HttpContext.Current.Server.MapPath("~/") + @"\Web\Graph\graph");
        }

        public PartitionPos checkPartitionPos(Pos pos)
        {
            PartitionPos partitionPos = new PartitionPos();
            // previously bug: didn't divide Section.Height by Section.Rows, which makes it divide by the dimension of whole section, hence all nodes appear in the first file
            partitionPos.row = (int)(Math.Floor(pos.y / (Section.Height / Section.Rows))); // cast it to int; Section.Height/Section.Rows to get height of single display
            partitionPos.col = (int)(Math.Floor(pos.x / (Section.Width / Section.Cols)));

            return partitionPos;
        }

        // @param: name of data file (TODO: change it to folder name, that stores nodes and links files)
        // return name of folder that stores processed data
        public string ProcessGraph(string fileName, bool zoomed, string folderName)
        {

            // local file
            string nodesFilePath = System.Web.HttpContext.Current.Server.MapPath("~/") + @"\Web\Graph\nodesPos.bin";

            string linksFilePath = System.Web.HttpContext.Current.Server.MapPath("~/") + @"\Web\Graph\linksPos.bin";

            // server file
            // string nodesFilePath = @"http://dsigdopreprod.doc.ic.ac.uk/DavidChia/" + folderName + @"/nodesPos.bin";
            // string linksFilePath = @"http://dsigdopreprod.doc.ic.ac.uk/DavidChia/" + folderName + @"/linksPos.bin";

            // WebClient client = new WebClient();
            // using (BinaryReader reader = new BinaryReader(client.OpenRead(nodesFilePath)))

            RectDimension rectDim = new RectDimension();
            List<Node> nodes = new List<Node>();
            List<Link> links = new List<Link>();

            Stopwatch sw = new Stopwatch();
            sw.Start();

            using (BinaryReader reader = new BinaryReader(File.Open(nodesFilePath, FileMode.Open)))
            {

                // Set up variables: offset (index of byte array)  and length (no. of bytes)
                int offset = 0;

                // Use BaseStream
                int length = (int)reader.BaseStream.Length;

                // ReadSingle reads 4-byte floating point value & auto advance stream position by 4 bytes
                // reads in dimension of rect first
                rectDim.width = reader.ReadSingle();
                rectDim.height = reader.ReadSingle();

                offset += 8;

                Debug.WriteLine("Rect width: " + rectDim.width);
                Debug.WriteLine("Rect height: " + rectDim.height);


                Debug.WriteLine("nodes list length: " + nodes.Count);

                while (offset < length)
                {
                    Node node = new Node();
                    node.pos = new Pos();
                    node.pos.x = reader.ReadSingle();
                    node.pos.y = reader.ReadSingle();
                    node.numLinks = (int)reader.ReadSingle();

                    nodes.Add(node);

                    offset += 12;

                    /*
                    Debug.WriteLine("Node pos x: " + node.pos.x);
                    Debug.WriteLine("Node pos y: " + node.pos.y);
                    Debug.WriteLine("Node numlinks: " + node.numLinks);
                    */
                }

                Debug.WriteLine("nodes list length: " + nodes.Count);

            }

            sw.Stop();
            System.Diagnostics.Debug.WriteLine("Time taken to read nodesPos.bin file: " + sw.ElapsedMilliseconds);

            sw.Restart();

            using (BinaryReader reader = new BinaryReader(File.Open(linksFilePath, FileMode.Open)))
            {

                // Set up variables: offset (index of byte array)  and length (no. of bytes)
                int offset = 0;
                int length = (int)reader.BaseStream.Length;


                Debug.WriteLine("links list length: " + links.Count);

                while (offset < length)
                {
                    Link link = new Link();
                    link.startPos = new Pos();
                    link.endPos = new Pos();

                    link.startPos.x = reader.ReadSingle();
                    link.startPos.y = reader.ReadSingle();
                    link.endPos.x = reader.ReadSingle();
                    link.endPos.y = reader.ReadSingle();

                    links.Add(link);

                    offset += 16;

                    /*
                    Debug.WriteLine("Start pos x: " + link.startPos.x);
                    Debug.WriteLine("Start pos y: " + link.startPos.y);
                    Debug.WriteLine("End pos x: " + link.endPos.x);
                    Debug.WriteLine("End pos y: " + link.endPos.y);
                    */
                }

                Debug.WriteLine("links list length: " + links.Count);

            }

            sw.Stop();
            System.Diagnostics.Debug.WriteLine("Time taken to read linksPos.bin file: " + sw.ElapsedMilliseconds);


            int singleDisplayWidth = (int)(Section.Width / Section.Cols);
            int singleDisplayHeight = (int)(Section.Height / Section.Rows);


            // set up total width and height, which differ for non-zoomed and zoomed version
            int totalWidth, totalHeight;
            int totalRows, totalCols;

            if (!zoomed)
            {
                totalWidth = Section.Width;
                totalHeight = Section.Height;
                totalRows = Section.Rows;
                totalCols = Section.Cols;
            }
            else
            { // current zooming is pre-set to include two extra rows and two extra cols (regardless of section dimension)
                totalWidth = Section.Width + (2 * singleDisplayWidth);
                totalHeight = Section.Height + (2 * singleDisplayHeight);
                totalRows = Section.Rows + 2;
                totalCols = Section.Cols + 2;
            }


            // transform data to GDO dimension
            Scales scales = new Scales();

            scales.x = totalWidth / rectDim.width;
            scales.y = totalHeight / rectDim.height;

            float scaleDown = (float)0.9; // to make graph smaller and nearer to (0, 0)


            sw.Restart();

            // scale nodes to full gdo dimension
            for (int i = 0; i < nodes.Count; ++i)
            {
                nodes[i].pos.x *= scales.x * scaleDown;
                nodes[i].pos.y *= scales.y * scaleDown;

                // add padding on x, y to centralise graph after being scaled down
                nodes[i].pos.x += totalWidth * (1 - scaleDown) / 2;
                nodes[i].pos.y += totalHeight * (1 - scaleDown) / 2;
            }

            // scale links to full gdo dimension
            for (int i = 0; i < links.Count; ++i)
            {
                links[i].startPos.x *= scales.x * scaleDown;
                links[i].startPos.y *= scales.y * scaleDown;
                links[i].endPos.x *= scales.x * scaleDown;
                links[i].endPos.y *= scales.y * scaleDown;

                links[i].startPos.x += totalWidth * (1 - scaleDown) / 2;
                links[i].startPos.y += totalHeight * (1 - scaleDown) / 2;
                links[i].endPos.x += totalWidth * (1 - scaleDown) / 2;
                links[i].endPos.y += totalHeight * (1 - scaleDown) / 2;
            }

            sw.Stop();
            System.Diagnostics.Debug.WriteLine("Time to scale links & nodes: " + sw.ElapsedMilliseconds);



            // Distribute data across browser

            // 1. Distribute nodes
            sw.Restart();

            // Set up a 2D array to store nodes data in each partition
            NodePartition[,] nodesPartitions = new NodePartition[totalRows, totalCols];

            // initialise elements within array
            for (int i = 0; i < totalRows; i++)
            {
                for (int j = 0; j < totalCols; j++)
                {
                    nodesPartitions[i, j] = new NodePartition();

                    // initialise objects within element
                    nodesPartitions[i, j].partitionPos = new PartitionPos();
                    nodesPartitions[i, j].partitionPos.row = i;
                    nodesPartitions[i, j].partitionPos.col = j;
                    nodesPartitions[i, j].nodes = new List<Node>();
                }
            }

            // distribute nodes into respective partitions
            for (int i = 0; i < nodes.Count; i++)
            {
                PartitionPos nodePartitionPos = checkPartitionPos(nodes[i].pos);
                nodesPartitions[nodePartitionPos.row, nodePartitionPos.col].nodes.Add(nodes[i]);
            }

            sw.Stop();
            System.Diagnostics.Debug.WriteLine("Time taken to distribute nodes across browsers: " + sw.ElapsedMilliseconds);

            // debugging code: check no. of nodes distributed to each partition
            for (int i = 0; i < totalRows; ++i)
            {
                for (int j = 0; j < totalCols; ++j)
                {
                    Debug.WriteLine("Nodes count in partition " + i + "_" + j + ": " + nodesPartitions[i, j].nodes.Count);
                }
            }





            // 2. Distribute links
            sw.Restart();

            // Set up a 2D array to store nodes data in each partition
            LinkPartition[,] linksPartitions = new LinkPartition[totalRows, totalCols];

            // initialise elements within array
            for (int i = 0; i < totalRows; i++)
            {
                for (int j = 0; j < totalCols; j++)
                {
                    linksPartitions[i, j] = new LinkPartition();

                    // initialise objects within element
                    linksPartitions[i, j].partitionPos = new PartitionPos();
                    linksPartitions[i, j].partitionPos.row = i;
                    linksPartitions[i, j].partitionPos.col = j;

                    linksPartitions[i, j].links = new List<Link>();
                }
            }

            // distribute links into respective partitions
            for (int i = 0; i < links.Count; i++)
            {
                Link link = links[i];

                Pos startPos, endPos;

                // set starting point to the one with smaller x, without changing original data
                if (link.startPos.x > link.endPos.x)
                {
                    startPos = link.endPos;
                    endPos = link.startPos;
                }
                else
                {
                    startPos = link.startPos;
                    endPos = link.endPos;
                }

                PartitionPos startPartitionPos = checkPartitionPos(startPos);
                PartitionPos endPartitionPos = checkPartitionPos(endPos);

                // note:
                // colDiff will always be >= 0, since we have set starting point's x to be smaller
                // rowDiff may be < 0

                int colDiff = endPartitionPos.col - startPartitionPos.col;
                int rowDiff = endPartitionPos.row - startPartitionPos.row;

                // find lines between the two points to check for intersection
                List<int> horizontalLines = new List<int>(); // y = a
                List<int> verticalLines = new List<int>(); // x = b

                for (int j = 0; j < colDiff; ++j)
                {
                    verticalLines.Add((startPartitionPos.col + 1 + j) * singleDisplayWidth);
                }

                if (rowDiff > 0)
                {
                    for (int j = 0; j < rowDiff; ++j)
                    {
                        horizontalLines.Add((startPartitionPos.row + 1 + j) * singleDisplayHeight);
                    }
                }
                else if (rowDiff < 0)
                {
                    for (int j = -rowDiff; j > 0; --j)
                    {
                        horizontalLines.Add((startPartitionPos.row + 1 - j) * singleDisplayHeight);
                    }
                }

                // check for different cases & push link onto respective browser

                // START OF IMPROVED INTERSECTION ALGORITHM
                // cases:
                // 1. both in the same partition
                // 2. both in different partitions

                if (rowDiff == 0 && colDiff == 0)
                {
                    linksPartitions[startPartitionPos.row, startPartitionPos.col].links.Add(link);
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

                        PartitionPos segmentPos = checkPartitionPos(midPoint);

                        var linkSegment = new Link();
                        linkSegment.startPos = intersections[j];
                        linkSegment.endPos = intersections[j + 1];

                        linksPartitions[segmentPos.row, segmentPos.col].links.Add(linkSegment);
                    }

                }

            }

            sw.Stop();
            System.Diagnostics.Debug.WriteLine("Time taken to distribute links across browsers: " + sw.ElapsedMilliseconds);

            // debugging code: check no. of links distributed to each partition
            for (int i = 0; i < totalRows; ++i)
            {
                for (int j = 0; j < totalCols; ++j)
                {
                    Debug.WriteLine("Links count in partition " + i + "_" + j + ": " + linksPartitions[i, j].links.Count);
                }
            }





            // write to individual browser file
            // i. create sub-directories to store partition files

            String basePath = System.Web.HttpContext.Current.Server.MapPath("~/") + @"\Web\Graph\graph\\";

            if (folderName == null)
            {
                // Generate random numbers as folder name
                Random randomDigitGenerator = new Random();

                while (Directory.Exists(basePath + FolderNameDigit))
                {
                    this.FolderNameDigit = randomDigitGenerator.Next(10000, 99999).ToString();
                }

                Directory.CreateDirectory(basePath + FolderNameDigit);

            }
            else
            {
                this.FolderNameDigit = folderName;
            }


            string nodesPath, linksPath;

            if (!zoomed)
            {
                Directory.CreateDirectory(basePath + FolderNameDigit + @"\normal");
                Directory.CreateDirectory(basePath + FolderNameDigit + @"\normal\nodes");
                Directory.CreateDirectory(basePath + FolderNameDigit + @"\normal\links");

                nodesPath = basePath + FolderNameDigit + @"\normal\nodes\\";
                linksPath = basePath + FolderNameDigit + @"\normal\links\\";
            }
            else
            {
                Directory.CreateDirectory(basePath + FolderNameDigit + @"\zoomed");
                Directory.CreateDirectory(basePath + FolderNameDigit + @"\zoomed\nodes");
                Directory.CreateDirectory(basePath + FolderNameDigit + @"\zoomed\links");

                nodesPath = basePath + FolderNameDigit + @"\zoomed\nodes\\";
                linksPath = basePath + FolderNameDigit + @"\zoomed\links\\";
            }



            // ii. write to files

            // write nodes files
            sw.Restart();

            for (int i = 0; i < totalRows; ++i)
            {
                for (int j = 0; j < totalCols; ++j)
                {
                    using (BinaryWriter writer = new BinaryWriter(
       File.Open(nodesPath + i + "_" + j + ".bin", FileMode.Create)))
                    {
                        writer.Write((float)nodesPartitions[i, j].partitionPos.row);
                        writer.Write((float)nodesPartitions[i, j].partitionPos.col);

                        for (int k = 0; k < nodesPartitions[i, j].nodes.Count; ++k)
                        {
                            writer.Write(nodesPartitions[i, j].nodes[k].pos.x);
                            writer.Write(nodesPartitions[i, j].nodes[k].pos.y);
                            writer.Write((float)nodesPartitions[i, j].nodes[k].numLinks);
                        }
                    }
                }
            }

            sw.Stop();
            System.Diagnostics.Debug.WriteLine("Time taken to write nodes file: " + sw.ElapsedMilliseconds);

            /*
            // for debugging: check if writing into binary file is correct
            using (BinaryReader reader = new BinaryReader(File.Open(nodesPath + "0_0.bin", FileMode.Open)))
            {

                // Set up variables: offset (index of byte array)  and length (no. of bytes)
                int offset = 0;

                // Use BaseStream
                int length = (int)reader.BaseStream.Length;

                Debug.WriteLine("Total byte length: " + length);

                Debug.WriteLine("Partition row: " + reader.ReadSingle());
                Debug.WriteLine("Partition col: " + reader.ReadSingle());
                offset += 8;


                while (offset < length)
                {
                    Debug.WriteLine("Node pos x: " + reader.ReadSingle());
                    Debug.WriteLine("Node pos y: " + reader.ReadSingle());
                    Debug.WriteLine("Node numlinks: " + reader.ReadSingle());

                    offset += 12;
                }

            }
            */



            // write links to files
            sw.Restart();

            for (int i = 0; i < totalRows; ++i)
            {
                for (int j = 0; j < totalCols; ++j)
                {
                    using (BinaryWriter writer = new BinaryWriter(
       File.Open(linksPath + i + "_" + j + ".bin", FileMode.Create)))
                    {
                        writer.Write((float)linksPartitions[i, j].partitionPos.row);
                        writer.Write((float)linksPartitions[i, j].partitionPos.col);

                        for (int k = 0; k < linksPartitions[i, j].links.Count; ++k)
                        {
                            writer.Write(linksPartitions[i, j].links[k].startPos.x);
                            writer.Write(linksPartitions[i, j].links[k].startPos.y);
                            writer.Write(linksPartitions[i, j].links[k].endPos.x);
                            writer.Write(linksPartitions[i, j].links[k].endPos.y);
                        }
                    }
                }
            }

            sw.Stop();
            System.Diagnostics.Debug.WriteLine("Time taken to write links file: " + sw.ElapsedMilliseconds);

            /*
            // for debugging: check if writing into binary file is correct
            using (BinaryReader reader = new BinaryReader(File.Open(linksPath + "0_0.bin", FileMode.Open)))
            {

                // Set up variables: offset (index of byte array)  and length (no. of bytes)
                int offset = 0;

                // Use BaseStream
                int length = (int)reader.BaseStream.Length;

                Debug.WriteLine("Total byte length: " + length);

                Debug.WriteLine("Partition row: " + reader.ReadSingle());
                Debug.WriteLine("Partition col: " + reader.ReadSingle());
                offset += 8;


                while (offset < length)
                {
                    Debug.WriteLine("Start pos x: " + reader.ReadSingle());
                    Debug.WriteLine("Start pos y: " + reader.ReadSingle());
                    Debug.WriteLine("End pos x: " + reader.ReadSingle());
                    Debug.WriteLine("End pos y: " + reader.ReadSingle());

                    offset += 16;
                }

            }
            */



            return this.FolderNameDigit;
        }
    }
}







/*

//function processGraph() is called by clicking on 'Render Graph' button on Control page
//it is now set to read from a specified local file whenever the button is clicked


namespace GDO.Apps.Graph
{

    public class GraphApp : IAppInstance
    {
        public int Id { get; set; }
        public Section Section { get; set; }
        public AppConfiguration Configuration { get; set; }

        public string FolderNameDigit { get; set; }


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


        
        //public class Intersection
        //{
        //    public Pos pos { get; set; }
         //   public string type { get; set; }
          //  public int number { get; set; }

        //}
        

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
            Stopwatch sw = new Stopwatch();
            sw.Start();

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

            sw.Stop();
            System.Diagnostics.Debug.WriteLine("Time taken to read input file: " + sw.ElapsedMilliseconds);


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

            sw.Restart();

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
*/
