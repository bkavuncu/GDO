using System;
using System.Diagnostics;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using GDO.Core;
using Newtonsoft.Json;
using GDO.Apps.Graph.Domain;
using log4net;

namespace GDO.Apps.Graph
{

    public class GraphApp : IBaseAppInstance {
        private static readonly ILog Log = LogManager.GetLogger(typeof(GraphApp));

        public int Id { get; set; }
        public string AppName { get; set; }
        public Section Section { get; set; }
        public AppConfiguration Configuration { get; set; }
        public bool IntegrationMode { get; set; }
        public IVirtualAppInstance ParentApp { get; set; }

        private List<GraphNode> Nodes = new List<GraphNode>();
        private List<GraphLink> Links = new List<GraphLink>();
        public string FolderNameDigit;

        public void Init(int instanceId, string appName, Section section, AppConfiguration configuration, bool integrationMode)
        {
            try {
                this.Id = instanceId;
                this.AppName = appName;
                this.Section = section;
                this.Configuration = configuration;
                Directory.CreateDirectory(System.Web.HttpContext.Current.Server.MapPath("~/Web/Graph/graph"));
            }
            catch (Exception e) {
                Log.Error("failed to launch the Graphs App",e);
            }
        }

        // ********************************************************* 
        // Global variables
        // *********************************************************
        // make labels public so that it can be access by ProcessSearch()
        public bool zoomedIn;//only has two zoom levels
        RectDimension rectDim;

        // @param: name of data file (TODO: change it to folder name, that stores nodes and links files)
        // return name of folder that stores processed data
        public string ProcessGraph(string inputFolder, bool zoomed, string folderName)
        {
            Stopwatch sw = new Stopwatch();

            string graphMLfile = System.Web.HttpContext.Current.Server.MapPath("~/Web/Graph/" + inputFolder + "/"+ inputFolder + @".graphml");
            GraphDataReader.ReadGraphMLData(sw, graphMLfile, out Links, out Nodes, out rectDim);



            #region calculate viewport and scales
            int singleDisplayWidth = Section.Width / Section.Cols;
            int singleDisplayHeight = Section.Height / Section.Rows;


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
            Scales scales = new Scales
            {
                X = totalWidth/rectDim.Width,
                Y = totalHeight/rectDim.Height
            };


            float scaleDown = (float)0.9; // to make graph smaller and nearer to (0, 0)

            #endregion

            #region scale nodes and links
            sw.Restart();

            // scale nodes to full gdo dimension
            foreach (GraphNode n in Nodes)
            {
                n.Pos.X *= scales.X * scaleDown;
                n.Pos.Y *= scales.Y * scaleDown;

                // add padding on x, y to centralise graph after being scaled down
                n.Pos.X += totalWidth * (1 - scaleDown) / 2;
                n.Pos.Y += totalHeight * (1 - scaleDown) / 2;
            }

            // scale links to full gdo dimension
            /*  // OK, as startPos and EndPos are REFERENCES to the position of their corresponding nodes, it is not neccessary to update them!
            
            foreach (GraphLink l in Links)
            {
                l.StartPos.X *= scales.X * scaleDown;
                l.StartPos.Y *= scales.Y * scaleDown;
                l.EndPos.X *= scales.X * scaleDown;
                l.EndPos.Y *= scales.Y * scaleDown;

                l.StartPos.X += totalWidth * (1 - scaleDown) / 2;
                l.StartPos.Y += totalHeight * (1 - scaleDown) / 2;
                l.EndPos.X += totalWidth * (1 - scaleDown) / 2;
                l.EndPos.Y += totalHeight * (1 - scaleDown) / 2;
            } */

            sw.Stop();
            Debug.WriteLine("Time to scale links & nodes: " + sw.ElapsedMilliseconds + "ms");
            GraphAppHub.self.LogTime("Time to scale links & nodes: " + sw.ElapsedMilliseconds + "ms");

            #endregion

            #region Distribute data across browser

            var partitions = GraphPartitioning.InitializeNodePartition(totalRows, totalCols);

            // 1. Distribute nodes & labels
            sw.Restart();
            // Set up a 2D array to store nodes data in each partition
            partitions = GraphPartitioning.DistributeNodesInPartitions(partitions, Nodes, Section);
            sw.Stop();
            Debug.WriteLine("Time taken to distribute nodes across browsers: " + sw.ElapsedMilliseconds + "ms");
            GraphAppHub.self.LogTime("Time taken to distribute nodes across browsers: " + sw.ElapsedMilliseconds + "ms");

            // 2. Distribute links
            sw.Restart();
            // Set up a 2D array to store nodes data in each partition
            partitions = GraphPartitioning.DistributeLinksInPartitions(partitions,Links, singleDisplayWidth, singleDisplayHeight,Section);
            sw.Stop();
            Debug.WriteLine("Time taken to distribute links across browsers: " + sw.ElapsedMilliseconds + "ms");
            GraphAppHub.self.LogTime("Time taken to distribute links across browsers: " + sw.ElapsedMilliseconds + "ms");


            // write to individual browser file
            // i. create sub-directories to store partition files
            String basePath = System.Web.HttpContext.Current.Server.MapPath("~/Web/Graph/graph/");
            CreateTempFolder(folderName, basePath);

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
            WriteNodeFiles(totalRows, totalCols, nodesPath, partitions);
            sw.Stop();
            Debug.WriteLine("Time taken to write nodes file: " + sw.ElapsedMilliseconds + "ms");
            GraphAppHub.self.LogTime("Time taken to write nodes file: " + sw.ElapsedMilliseconds + "ms");


            // write labels to files
            sw.Restart();
            WriteLabelFiles(totalRows, totalCols, labelsPath, partitions);
            sw.Stop();
            Debug.WriteLine("Time taken to write labels file: " + sw.ElapsedMilliseconds + "ms");
            GraphAppHub.self.LogTime("Time taken to write labels file: " + sw.ElapsedMilliseconds + "ms");


            // write links to files
            sw.Restart();
            WriteLinkFiles(totalRows, totalCols, linksPath, partitions);
            sw.Stop();
            Debug.WriteLine("Time taken to write links file: " + sw.ElapsedMilliseconds + "ms");
            GraphAppHub.self.LogTime("Time taken to write links file: " + sw.ElapsedMilliseconds + "ms");
            

            return this.FolderNameDigit;
            #endregion
        }

        private static void WriteLabelFiles(int totalRows, int totalCols, string labelsPath, Partition[,] partitions)
        {
            for (int i = 0; i < totalRows; ++i)
            {
                for (int j = 0; j < totalCols; ++j)
                {
                    using (StreamWriter streamWriter = new StreamWriter(labelsPath + i + @"_" + j + @".json")
                    {
                        AutoFlush = true
                    })
                    {
                        List<string> labels = partitions[i, j].Nodes.Select(n => n.Label).ToList();   //create list of labels of the nodes in partition (i,j)
                        JsonWriter jsonWriter = new JsonTextWriter(streamWriter);
                        JsonSerializer serializer = new JsonSerializer();
                        serializer.Serialize(jsonWriter, labels);
                    }
                }
            }
        }

        private static void WriteNodeFiles(int totalRows, int totalCols, string linksPath, Partition[,] partitions)
        {
            for (int i = 0; i < totalRows; ++i)
            {
                for (int j = 0; j < totalCols; ++j)
                {
                    using (StreamWriter streamWriter = new StreamWriter(linksPath + i + @"_" + j + @".json")
                    {
                        AutoFlush = true
                    })
                    {
                        JsonWriter jsonWriter = new JsonTextWriter(streamWriter);
                        JsonSerializer serializer = new JsonSerializer();
                        serializer.Serialize(jsonWriter, partitions[i, j].Nodes);
                    }
                }
            }
        }

        private static void WriteLinkFiles(int totalRows, int totalCols, string linksPath, Partition[,] partitions)
        {
            for (int i = 0; i < totalRows; ++i)
            {
                for (int j = 0; j < totalCols; ++j)
                {
                    using (StreamWriter streamWriter = new StreamWriter(linksPath + i + @"_" + j + @".json")
                    {
                        AutoFlush = true
                    })
                    {
                        JsonWriter jsonWriter = new JsonTextWriter(streamWriter);
                        JsonSerializer serializer = new JsonSerializer();
                        serializer.Serialize(jsonWriter, partitions[i,j].Links);
                    }
                }
            }
        }

        private void CreateTempFolder(string folderName, string basePath)
        {
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
        }


        public void ComputeNodeAdjacencies()
        {
            Stopwatch sw = new Stopwatch();
            sw.Start();

            foreach (GraphLink l in Links)
            {
                //add the target to the source Adj variable
                int sourceIndex = nodeDict[l.Source];
                Nodes[sourceIndex].Adj.Add(l.Target);
                Nodes[sourceIndex].NumLinks++;

                //add the source to the target Adj variable
                int targetIndex = nodeDict[l.Target];
                Nodes[targetIndex].Adj.Add(l.Source);
                Nodes[targetIndex].NumLinks++;
            }

            sw.Stop();
            Debug.WriteLine("Time taken to compute adjacencies: " + sw.ElapsedMilliseconds + "ms");
            GraphAppHub.self.LogTime("Time taken to compute adjacencies: " + sw.ElapsedMilliseconds + "ms");

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

            for (int i = 0; i < Nodes.Count; i++)
            {
                try  // TODO improve this checking!!
                {
                    labelDict.Add(Nodes[i].Label, i);
                }
                catch (Exception e)
                {
                    Debug.WriteLine(e + "Key '" + Nodes[i].Label + "' already exists!");
                    GraphAppHub.self.LogTime(e + "Key '" + Nodes[i].Label + "' already exists!");
                }
            }


            sw.Stop();
            Debug.WriteLine("Time taken to set up label dictionary: " + sw.ElapsedMilliseconds + "ms");
            GraphAppHub.self.LogTime("Time taken to set up label dictionary: " + sw.ElapsedMilliseconds + "ms");

        }


        public void SetupNodeDictionary()
        {
            Stopwatch sw = new Stopwatch();
            sw.Start();

            nodeDict = new Dictionary<string, int>();

            for (int i = 0; i < Nodes.Count; i++)
            {
                nodeDict.Add(Nodes[i].ID, i);
            }

            sw.Stop();
            Debug.WriteLine("Time taken to set up nodes dictionary: " + sw.ElapsedMilliseconds + "ms");
            GraphAppHub.self.LogTime("Time taken to set up nodes dictionary: " + sw.ElapsedMilliseconds + "ms");
        }


        private class SelectedNode
        {
            public Position Pos { get; set; }
            public string Label { get; set; }
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

            // 1. Add nodes to nodeList
            // add central node, accessed using index obtained from labelDict
            GraphNode centralNode = Nodes[index];
            SelectedNode central = new SelectedNode
            {
                Pos = new Position
                {
                    X = centralNode.Pos.X,
                    Y = centralNode.Pos.Y
                },
                Label = centralNode.Label
            };
            nodeList.Add(central);


            // loop through connected nodes and add them to node list
            foreach (string t in centralNode.Adj)
            {
                int currentIndex = nodeDict[t];

                GraphNode currentNode = Nodes[currentIndex];

                SelectedNode current = new SelectedNode
                {
                    Pos = new Position
                    {
                        X = currentNode.Pos.X,
                        Y = currentNode.Pos.Y
                    },
                    Label = currentNode.Label
                };
                nodeList.Add(current);
            }

            // log no. of connected nodes
            GraphAppHub.self.LogTime("No. of connected nodes: " + (nodeList.Count - 1));

            /*
            // 2. Scale position of nodes based on GDO config, using code from above
            // (scale in advance, so there's no need to scale links later)

            int singleDisplayWidth = (int)(Section.Width / Section.Cols);
            int singleDisplayHeight = (int)(Section.Height / Section.Rows);

            // set up total width and height, which differ for non-zoomed and zoomed version
            int totalWidth, totalHeight;

            if (!zoomedIn)
            {
                totalWidth = Section.Width;
                totalHeight = Section.Height;
            }
            else
            { // current zooming is pre-set to include two extra rows and two extra cols (regardless of section dimension)
                totalWidth = Section.Width + (2 * singleDisplayWidth);
                totalHeight = Section.Height + (2 * singleDisplayHeight);
            }


            // transform data to GDO dimension
            Scales scales = new Scales
            {
                X = totalWidth/rectDim.Width,
                Y = totalHeight/rectDim.Height
            };


            float scaleDown = (float)0.9; // to make graph smaller and nearer to (0, 0)


            // scale nodes to full gdo dimension
            foreach (SelectedNode t in nodeList)
            {
                t.Pos.X *= scales.X * scaleDown;
                t.Pos.Y *= scales.Y * scaleDown;

                // add padding on x, y to centralise graph after being scaled down
                t.Pos.X += totalWidth * (1 - scaleDown) / 2;
                t.Pos.Y += totalHeight * (1 - scaleDown) / 2;
            }
            */


            // 3. Add links to linkList
            // set central node's pos as the StartPos of each link
            // set its connectedNode's pos as the EndPos
            List<GraphLink> linkList = new List<GraphLink>();

            for (int i = 0; i < nodeList.Count - 1; ++i)
            {
                GraphLink currentLink = new GraphLink
                {
                    StartPos = nodeList[0].Pos,
                    EndPos = nodeList[i + 1].Pos,
                    Source = nodeList[0].Label,
                    Target = nodeList[i + 1].Label,
                    Weight = 2
                };
                linkList.Add(currentLink);
            }

            // 4. Write to files

            String basePath = System.Web.HttpContext.Current.Server.MapPath("~/Web/Graph/graph/");
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

