﻿using System;
using System.Diagnostics;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using GDO.Core;
using GDO.Utility;
using Newtonsoft.Json;
using System.Net;
using log4net;

/* transcoded from javascript distributeGraph.js

*/

namespace GDO.Apps.Graph
{

    public class GraphApp : IAppInstance {
        private static readonly ILog Log = LogManager.GetLogger(typeof(GraphApp));

        public int Id { get; set; }
        public string AppName { get; set; }
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
            public List<string> labels { get; set; }
        }

        public class LinkPartition
        {
            public PartitionPos partitionPos { get; set; }
            public List<Link> links { get; set; }
        }

        public class NodeData
        {
            public string id { get; set; }
            public string label { get; set; }
            public Pos pos { get; set; }
            public List<string> adj { get; set; }  // adj = list of connectedNodes
        }

        // init is run when 'Deploy' is clicked
        public void init(int instanceId, string appName, Section section, AppConfiguration configuration)
        {
            try {
                this.Id = instanceId;
                this.AppName = appName;
                this.Section = section;
                this.Configuration = configuration;
                Directory.CreateDirectory(System.Web.HttpContext.Current.Server.MapPath("~/") + @"Web\Graph\graph");
            }
            catch (Exception e) {
                Log.Error("failed to launch the Graphs App",e);
            }
        }

        public PartitionPos checkPartitionPos(Pos pos)
        {
            PartitionPos partitionPos = new PartitionPos();
            // previously bug: didn't divide Section.Height by Section.Rows, which makes it divide by the dimension of whole section, hence all nodes appear in the first file
            partitionPos.row = (int)(Math.Floor(pos.y / (Section.Height / (double) Section.Rows))); // cast it to int; Section.Height/Section.Rows to get height of single display
            partitionPos.col = (int)(Math.Floor(pos.x / (Section.Width / (double) Section.Cols)));

            return partitionPos;
        }

        // ********************************************************* 
        // Global variables
        // *********************************************************
        // make labels public so that it can be access by ProcessSearch()
        public List<string> labels = null;
        public List<NodeData> nodesData = null;
        public bool zoomedIn = false;
        RectDimension rectDim = null;

        // 0 means local, 1 means http
        public int inputSourceType = 1;

        // @param: name of data file (TODO: change it to folder name, that stores nodes and links files)
        // return name of folder that stores processed data
        public string ProcessGraph(string inputFolder, bool zoomed, string folderName)
        {
            string nodesFilePath, linksFilePath, labelsFilePath;

            if (inputSourceType == 1)
            {
                // server file
                nodesFilePath = @"http://dsigdopreprod.doc.ic.ac.uk/DavidChia/" + inputFolder + @"/nodesPos.bin";//TODO make these local 
                linksFilePath = @"http://dsigdopreprod.doc.ic.ac.uk/DavidChia/" + inputFolder + @"/linksPos.bin";
                labelsFilePath = @"http://dsigdopreprod.doc.ic.ac.uk/DavidChia/" + inputFolder + @"/labels.json";
            }
            else
            {
                // local file
                nodesFilePath = System.Web.HttpContext.Current.Server.MapPath("~/") + @"\Web\Graph\nodesPos.bin";
                linksFilePath = System.Web.HttpContext.Current.Server.MapPath("~/") + @"\Web\Graph\linksPos.bin";
                labelsFilePath = System.Web.HttpContext.Current.Server.MapPath("~/") + @"\Web\Graph\labels.json";
            }


            rectDim = new RectDimension();
            List<Node> nodes = new List<Node>();
            List<Link> links = new List<Link>();

            Stopwatch sw = new Stopwatch();

            if (inputSourceType == 1)
            {
                sw.Start();

                // read from HTTP
                HttpWebRequest req = (HttpWebRequest)WebRequest.Create(nodesFilePath);
                WebResponse resp = req.GetResponse();

                using (Stream stream = resp.GetResponseStream())
                using (MemoryStream ms = new MemoryStream())
                {
                    int count = 0;
                    do
                    {
                        byte[] buf = new byte[1024];
                        count = stream.Read(buf, 0, 1024);
                        ms.Write(buf, 0, count);
                    } while (stream.CanRead && count > 0);

                    using (BinaryReader reader = new BinaryReader(ms))
                    {
                        // Set position to beginning of stream
                        reader.BaseStream.Position = 0;

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


                            //Debug.WriteLine("Node pos x: " + node.pos.x);
                            //Debug.WriteLine("Node pos y: " + node.pos.y);
                            //Debug.WriteLine("Node numlinks: " + node.numLinks);

                        }

                        Debug.WriteLine("nodes list length: " + nodes.Count);

                    }

                }

                sw.Stop();
                Debug.WriteLine("Time taken to read nodesPos.bin file: " + sw.ElapsedMilliseconds + "ms");
                GraphAppHub.self.LogTime("Time taken to read nodesPos.bin file: " + sw.ElapsedMilliseconds + "ms");

                sw.Restart();

                // read from HTTP
                req = (HttpWebRequest)WebRequest.Create(linksFilePath);
                resp = req.GetResponse();

                using (Stream stream = resp.GetResponseStream()) {
                    using (MemoryStream ms = new MemoryStream()) {
                        int count = 0;
                        do {
                            byte[] buf = new byte[1024];
                            count = stream.Read(buf, 0, 1024);
                            ms.Write(buf, 0, count);
                        } while (stream.CanRead && count > 0);

                        using (BinaryReader reader = new BinaryReader(ms)) {
                            // Set position to beginning of stream
                            reader.BaseStream.Position = 0;

                            // Set up variables: offset (index of byte array)  and length (no. of bytes)
                            int offset = 0;
                            int length = (int) reader.BaseStream.Length;

                            Debug.WriteLine("links list length: " + links.Count);

                            while (offset < length) {
                                Link link = new Link();
                                link.startPos = new Pos();
                                link.endPos = new Pos();

                                link.startPos.x = reader.ReadSingle();
                                link.startPos.y = reader.ReadSingle();
                                link.endPos.x = reader.ReadSingle();
                                link.endPos.y = reader.ReadSingle();

                                links.Add(link);

                                offset += 16;


                                //Debug.WriteLine("Start pos x: " + link.startPos.x);
                                //Debug.WriteLine("Start pos y: " + link.startPos.y);
                                //Debug.WriteLine("End pos x: " + link.endPos.x);
                                //Debug.WriteLine("End pos y: " + link.endPos.y);

                            }

                            Debug.WriteLine("links list length: " + links.Count);

                        }

                    }
                }
                sw.Stop();
                Debug.WriteLine("Time taken to read linksPos.bin file: " + sw.ElapsedMilliseconds + "ms");
                GraphAppHub.self.LogTime("Time taken to read linksPos.bin file: " + sw.ElapsedMilliseconds + "ms");


                // read labels.json from HTTP
                sw.Restart();

                Debug.WriteLine("Reading from: " + labelsFilePath);

                WebClient client = new WebClient();
                StreamReader file = new StreamReader(client.OpenRead(labelsFilePath));

                JsonTextReader jReader = new JsonTextReader(file);
                JsonSerializer serializer = new JsonSerializer();
                labels = serializer.Deserialize<List<string>>(jReader);


                // debugging

                //for (int i = 0; i < labels.Count; i++)
                //{
                //    Debug.WriteLine("label " + i + ": " + labels[i]);
                //}

                sw.Stop();
                Debug.WriteLine("Time taken to read labels.json file: " + sw.ElapsedMilliseconds + "ms");
                GraphAppHub.self.LogTime("Time taken to read labels.json file: " + sw.ElapsedMilliseconds + "ms");
            }
            else
            {
                sw.Start();

                // to read from local file
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


                        //Debug.WriteLine("Node pos x: " + node.pos.x);
                        //Debug.WriteLine("Node pos y: " + node.pos.y);
                        //Debug.WriteLine("Node numlinks: " + node.numLinks);

                    }

                    Debug.WriteLine("nodes list length: " + nodes.Count);

                }

                sw.Stop();
                Debug.WriteLine("Time taken to read nodesPos.bin file: " + sw.ElapsedMilliseconds + "ms");
                GraphAppHub.self.LogTime("Time taken to read nodesPos.bin file: " + sw.ElapsedMilliseconds + "ms");

                sw.Restart();

                // to read from local file
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


                        //Debug.WriteLine("Start pos x: " + link.startPos.x);
                        //Debug.WriteLine("Start pos y: " + link.startPos.y);
                        //Debug.WriteLine("End pos x: " + link.endPos.x);
                        //Debug.WriteLine("End pos y: " + link.endPos.y);

                    }

                    Debug.WriteLine("links list length: " + links.Count);

                }


                sw.Stop();
                Debug.WriteLine("Time taken to read linksPos.bin file: " + sw.ElapsedMilliseconds + "ms");
                GraphAppHub.self.LogTime("Time taken to read linksPos.bin file: " + sw.ElapsedMilliseconds + "ms");


                // read labels.json local file
                sw.Restart();

                Debug.WriteLine("Reading from: " + labelsFilePath);

                StreamReader file = File.OpenText(labelsFilePath);

                JsonTextReader jReader = new JsonTextReader(file);
                JsonSerializer serializer = new JsonSerializer();
                labels = serializer.Deserialize<List<string>>(jReader);


                // debugging

                //for (int i = 0; i < labels.Count; i++)
                //{
                //    Debug.WriteLine("label " + i + ": " + labels[i]);
                //}

                sw.Stop();
                Debug.WriteLine("Time taken to read labels.json file: " + sw.ElapsedMilliseconds + "ms");
                GraphAppHub.self.LogTime("Time taken to read labels.json file: " + sw.ElapsedMilliseconds + "ms");


            }


            int singleDisplayWidth = (int)(Section.Width / Section.Cols);
            int singleDisplayHeight = (int)(Section.Height / Section.Rows);


            // set up total width and height, which differ for non-zoomed and zoomed version

            int totalRows, totalCols;
            int totalWidth, totalHeight;

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
            Debug.WriteLine("Time to scale links & nodes: " + sw.ElapsedMilliseconds + "ms");
            GraphAppHub.self.LogTime("Time to scale links & nodes: " + sw.ElapsedMilliseconds + "ms");


            // Distribute data across browser

            // 1. Distribute nodes & labels
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
                    nodesPartitions[i, j].labels = new List<string>();
                }
            }

            // distribute nodes into respective partitions
            for (int i = 0; i < nodes.Count; i++)
            {
                PartitionPos nodePartitionPos = checkPartitionPos(nodes[i].pos);
                nodesPartitions[nodePartitionPos.row, nodePartitionPos.col].nodes.Add(nodes[i]);
                nodesPartitions[nodePartitionPos.row, nodePartitionPos.col].labels.Add(labels[i]);
            }


            sw.Stop();
            Debug.WriteLine("Time taken to distribute nodes across browsers: " + sw.ElapsedMilliseconds + "ms");
            GraphAppHub.self.LogTime("Time taken to distribute nodes across browsers: " + sw.ElapsedMilliseconds + "ms");

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
            Debug.WriteLine("Time taken to distribute links across browsers: " + sw.ElapsedMilliseconds + "ms");
            GraphAppHub.self.LogTime("Time taken to distribute links across browsers: " + sw.ElapsedMilliseconds + "ms");


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


            string nodesPath, linksPath, labelsPath;

            if (!zoomed)
            {
                Directory.CreateDirectory(basePath + FolderNameDigit + @"\normal");
                Directory.CreateDirectory(basePath + FolderNameDigit + @"\normal\nodes");
                Directory.CreateDirectory(basePath + FolderNameDigit + @"\normal\links");
                Directory.CreateDirectory(basePath + FolderNameDigit + @"\normal\labels");

                nodesPath = basePath + FolderNameDigit + @"\normal\nodes\\";
                linksPath = basePath + FolderNameDigit + @"\normal\links\\";
                labelsPath = basePath + FolderNameDigit + @"\normal\labels\\";
            }
            else
            {
                Directory.CreateDirectory(basePath + FolderNameDigit + @"\zoomed");
                Directory.CreateDirectory(basePath + FolderNameDigit + @"\zoomed\nodes");
                Directory.CreateDirectory(basePath + FolderNameDigit + @"\zoomed\links");
                Directory.CreateDirectory(basePath + FolderNameDigit + @"\zoomed\labels");

                nodesPath = basePath + FolderNameDigit + @"\zoomed\nodes\\";
                linksPath = basePath + FolderNameDigit + @"\zoomed\links\\";
                labelsPath = basePath + FolderNameDigit + @"\zoomed\labels\\";
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
            Debug.WriteLine("Time taken to write nodes file: " + sw.ElapsedMilliseconds + "ms");
            GraphAppHub.self.LogTime("Time taken to write nodes file: " + sw.ElapsedMilliseconds + "ms");
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

            // write labels to files
            sw.Restart();

            for (int i = 0; i < totalRows; ++i)
            {
                for (int j = 0; j < totalCols; ++j)
                {
                    StreamWriter streamWriter = new StreamWriter(labelsPath + i + @"_" + j + @".json");
                    streamWriter.AutoFlush = true;
                    JsonWriter jsonWriter = new JsonTextWriter(streamWriter);
                    JsonSerializer serializer = new JsonSerializer();
                    serializer.Serialize(jsonWriter, nodesPartitions[i, j].labels);
                }
            }

            sw.Stop();
            Debug.WriteLine("Time taken to write labels file: " + sw.ElapsedMilliseconds + "ms");
            GraphAppHub.self.LogTime("Time taken to write labels file: " + sw.ElapsedMilliseconds + "ms");

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
            Debug.WriteLine("Time taken to write links file: " + sw.ElapsedMilliseconds + "ms");
            GraphAppHub.self.LogTime("Time taken to write links file: " + sw.ElapsedMilliseconds + "ms");
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


        public void ReadNodesData(string inputFolder)
        {
            string nodesDataFilePath;

            Stopwatch sw = new Stopwatch();
            sw.Start();

            if (inputSourceType == 1)   // server file
            {
                nodesDataFilePath = @"http://dsigdopreprod.doc.ic.ac.uk/DavidChia/" + inputFolder + @"/nodes.json";

                WebClient client = new WebClient();
                StreamReader file = new StreamReader(client.OpenRead(nodesDataFilePath));
                JsonTextReader reader = new JsonTextReader(file);
                JsonSerializer serializer = new JsonSerializer();
                nodesData = serializer.Deserialize<List<NodeData>>(reader);

            }
            else // local file
            {
                nodesDataFilePath = System.Web.HttpContext.Current.Server.MapPath("~/") + @"\Web\Graph\nodes.json";

                StreamReader file = File.OpenText(nodesDataFilePath);
                JsonTextReader reader = new JsonTextReader(file);
                JsonSerializer serializer = new JsonSerializer();
                nodesData = serializer.Deserialize<List<NodeData>>(reader);
            }

            sw.Stop();
            Debug.WriteLine("Time taken to read nodes.json file: " + sw.ElapsedMilliseconds + "ms");
            GraphAppHub.self.LogTime("Time taken to read nodes.json file: " + sw.ElapsedMilliseconds + "ms");

            /*
            // debug
            for (int i = 0; i < nodesData.Count; i++)
            {
                Debug.WriteLine("nodesData " + i + " : " + nodesData[i].id);
                Debug.WriteLine("nodesData " + i + " : " + nodesData[i].label);
                Debug.WriteLine("nodesData " + i + " : " + nodesData[i].pos.x);
                Debug.WriteLine("nodesData " + i + " : " + nodesData[i].adj.Count);
            }
            */

        }

        // ***********************
        // global dictionary variables
        // ***********************
        // map label to index within labels array
        Dictionary<string, int> labelDict = null;
        // map node ID to index within nodes data array
        Dictionary<string, int> nodeDict = null;

        // set up label dictionary to prepare for search
        public void SetupLabelDictionary()
        {
            Stopwatch sw = new Stopwatch();
            sw.Start();

            labelDict = new Dictionary<string, int>();

            for (int i = 0; i < labels.Count; i++)
            {
                labelDict.Add(labels[i], i);
            }

            sw.Stop();
            Debug.WriteLine("Time taken to set up label dictionary: " + sw.ElapsedMilliseconds + "ms");
            GraphAppHub.self.LogTime("Time taken to set up label dictionary: " + sw.ElapsedMilliseconds + "ms");


            //Debug.WriteLine("Index for label YLR386W (4): " + labelDict["YLR386W"]);
            //Debug.WriteLine("Index for label YOR042W (2358): " + labelDict["YOR042W"]);
        }


        public void SetupNodeDictionary()
        {
            Stopwatch sw = new Stopwatch();
            sw.Start();

            nodeDict = new Dictionary<string, int>();

            for (int i = 0; i < nodesData.Count; i++)
            {
                nodeDict.Add(nodesData[i].id, i);
            }

            sw.Stop();
            Debug.WriteLine("Time taken to set up nodes dictionary: " + sw.ElapsedMilliseconds + "ms");
            GraphAppHub.self.LogTime("Time taken to set up nodes dictionary: " + sw.ElapsedMilliseconds + "ms");


            //Debug.WriteLine("Index for node ID 4943 (2): " + nodeDict[4943]);
            //Debug.WriteLine("Index for node ID 7299 (2358): " + nodeDict[7299]);
        }



        public class SelectedNode
        {
            public Pos pos { get; set; }
            public string label { get; set; }
        }

        // ***********************
        // global dictionary variables
        // ***********************
        // map label to index within labels array
        Dictionary<string, int> labelDict = new Dictionary<string, int>();
        // map node ID to index within nodes data array
        Dictionary<int, int> nodeDict = null;

        // set up label dictionary to prepare for search
        public void SetupLabelDictionary()
        {
            Stopwatch sw = new Stopwatch();
            sw.Start();

            labelDict = new Dictionary<string, int>();

            for (int i = 0; i < labels.Count; i++)
            {
                labelDict.Add(labels[i], i);
            }

            sw.Stop();
            Debug.WriteLine("Time taken to set up label dictionary: " + sw.ElapsedMilliseconds + "ms");
            GraphAppHub.self.LogTime("Time taken to set up label dictionary: " + sw.ElapsedMilliseconds + "ms");


            //Debug.WriteLine("Index for label YLR386W (4): " + labelDict["YLR386W"]);
            //Debug.WriteLine("Index for label YOR042W (2358): " + labelDict["YOR042W"]);
        }


        public void SetupNodeDictionary()
        {
            Stopwatch sw = new Stopwatch();
            sw.Start();

            nodeDict = new Dictionary<int, int>();

            for (int i = 0; i < nodesData.Count; i++)
            {
                nodeDict.Add(nodesData[i].id, i);
            }

            sw.Stop();
            Debug.WriteLine("Time taken to set up nodes dictionary: " + sw.ElapsedMilliseconds + "ms");
            GraphAppHub.self.LogTime("Time taken to set up nodes dictionary: " + sw.ElapsedMilliseconds + "ms");


            //Debug.WriteLine("Index for node ID 4943 (2): " + nodeDict[4943]);
            //Debug.WriteLine("Index for node ID 7299 (2358): " + nodeDict[7299]);
        }



        public class SelectedNode
        {
            public Pos pos { get; set; }
            public string label { get; set; }
        }


        // @param: keywords of search query
        // if keywords are valid, returns name of folder that stores result; otherwise returns null
        public string ProcessSearch(string keywords)
        {
            if (!labelDict.ContainsKey(keywords))
            {
                return null;
            }

            int index = labelDict[keywords];

            List<SelectedNode> nodeList = new List<SelectedNode>();
            // Debug
            // GraphAppHub.self.LogTime("Search result: index " + index);

            // 1. Add nodes to nodeList

            // add central node, accessed using index obtained from labelDict
            NodeData centralNode = nodesData[index];

            SelectedNode central = new SelectedNode();
            central.pos = new Pos();
            central.pos.x = centralNode.pos.x;
            central.pos.y = centralNode.pos.y;

            central.label = centralNode.label;

            nodeList.Add(central);

            //Debug.WriteLine("Central node label: " + nodeList[0].label);

            // loop through connected nodes and add them to node list
            for (int i = 0; i < centralNode.adj.Count; ++i)
            {
                int currentIndex = nodeDict[centralNode.adj[i]];

                NodeData currentNode = nodesData[currentIndex];

                SelectedNode current = new SelectedNode();
                current.pos = new Pos();
                current.pos.x = currentNode.pos.x;
                current.pos.y = currentNode.pos.y;

                current.label = currentNode.label;

                nodeList.Add(current);
            }

            // log no. of connected nodes
            GraphAppHub.self.LogTime("No. of connected nodes: " + (nodeList.Count - 1));

            // 2. Scale position of nodes based on GDO config, using code from above
            // (scale in advance, so there's no need to scale links later)

            int singleDisplayWidth = (int)(Section.Width / Section.Cols);
            int singleDisplayHeight = (int)(Section.Height / Section.Rows);

            // set up total width and height, which differ for non-zoomed and zoomed version
            int totalRows, totalCols;
            int totalWidth, totalHeight;

            if (!zoomedIn)
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


            // scale nodes to full gdo dimension
            for (int i = 0; i < nodeList.Count; ++i)
            {
                nodeList[i].pos.x *= scales.x * scaleDown;
                nodeList[i].pos.y *= scales.y * scaleDown;

                // add padding on x, y to centralise graph after being scaled down
                nodeList[i].pos.x += totalWidth * (1 - scaleDown) / 2;
                nodeList[i].pos.y += totalHeight * (1 - scaleDown) / 2;
            }


            

            /*
            Debug.WriteLine("Count of nodeList: " + nodeList.Count);
            for (int i = 0; i < nodeList.Count; ++i)
            {
                Debug.WriteLine("Node " + i + " label : " + nodeList[i].label);
            }
            */



            // 3. Add links to linkList
            // set central node's pos as the startPos of each link
            // set its connectedNode's pos as the endPos
            List<Link> linkList = new List<Link>();

            for (int i = 0; i < nodeList.Count - 1; ++i)
            {
                Link currentLink = new Link();
                currentLink.startPos = nodeList[0].pos;
                currentLink.endPos = nodeList[i + 1].pos;
                linkList.Add(currentLink);
            }

            //Debug.WriteLine("Count of linkList (nodeList count - 1): " + linkList.Count);

            // 4. Write to files

            String basePath = System.Web.HttpContext.Current.Server.MapPath("~/") + @"\Web\Graph\graph\\";

            Directory.CreateDirectory(basePath + FolderNameDigit + @"\search");
            String searchPath = basePath + FolderNameDigit + @"\search\\";

            // Generate random numbers as folder name
            Random randomDigitGenerator = new Random();
            String folderName = randomDigitGenerator.Next(10000, 99999).ToString();

            while (Directory.Exists(searchPath + folderName))
            {
                folderName = randomDigitGenerator.Next(10000, 99999).ToString();
            }

            Directory.CreateDirectory(searchPath + folderName);

            String outputPath = searchPath + folderName + @"\\";

            Debug.WriteLine("Writing to nodes.json file");
            StreamWriter streamWriter = new StreamWriter(outputPath + @"nodes.json");
            streamWriter.AutoFlush = true;
            JsonWriter jsonWriter = new JsonTextWriter(streamWriter);
            JsonSerializer serializer = new JsonSerializer();
            serializer.Serialize(jsonWriter, nodeList);

            Debug.WriteLine("Finished writing nodes.json file");

            Debug.WriteLine("Writing to links.json file");
            StreamWriter streamWriter2 = new StreamWriter(outputPath + @"links.json");
            streamWriter2.AutoFlush = true;
            JsonWriter jsonWriter2 = new JsonTextWriter(streamWriter2);
            JsonSerializer serializer2 = new JsonSerializer();
            serializer2.Serialize(jsonWriter2, linkList);

            Debug.WriteLine("Finished writing links.json file");

            Debug.WriteLine("Search folder name: " + folderName);

            return folderName;

        }

        public void UpdateZoomVar(bool value)
        {
            zoomedIn = value;
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

            Debug.WriteLine("Reading from: " + filePath);

            WebClient client = new WebClient();

            // error exception is being handled centrally at GraphAppHub
            // it will throw exception up the stack if file cannot be read
            
            //StreamReader file = new StreamReader(client.OpenRead(filePath));
            StreamReader file = File.OpenText(filePath); //for local file

            JsonTextReader reader = new JsonTextReader(file);
            JsonSerializer serializer = new JsonSerializer();
            GraphCompleteData graphData = serializer.Deserialize<GraphCompleteData>(reader);

            sw.Stop();
            Debug.WriteLine("Time taken to read input file: " + sw.ElapsedMilliseconds);


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
            Debug.WriteLine("Time to scale links & nodes: " + sw.ElapsedMilliseconds);


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
            Debug.WriteLine("Time taken to distribute nodes across browsers: " + sw.ElapsedMilliseconds);

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
            Debug.WriteLine("Time taken to distribute links across browsers: " + sw.ElapsedMilliseconds);

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
            Debug.WriteLine("Time taken to write file: " + sw.ElapsedMilliseconds);

            return this.FolderNameDigit;
        }
    }
}
*/
