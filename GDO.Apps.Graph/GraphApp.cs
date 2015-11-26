using System;
using System.Diagnostics;
using System.Collections.Generic;
using System.IO;
using GDO.Core;
using Newtonsoft.Json;
using GDO.Apps.Graph.Domain;
using log4net;

namespace GDO.Apps.Graph
{

    public class GraphApp : IAppInstance {
        private static readonly ILog Log = LogManager.GetLogger(typeof(GraphApp));

        public int Id { get; set; }
        public string AppName { get; set; }
        public Section Section { get; set; }
        public AppConfiguration Configuration { get; set; }

        private List<GraphNode> Nodes = new List<GraphNode>();
        private List<GraphLink> Links = new List<GraphLink>();
        public string FolderNameDigit;

        // init is run when 'Deploy' is clicked
        public void init(int instanceId, string appName, Section section, AppConfiguration configuration)
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

        public bool zoomedIn;//only has two zoom levels
        RectDimension rectDim;

        // @param: name of data file (TODO: change it to folder name, that stores nodes and links files)
        // return name of folder that stores processed data
        public string ProcessGraph(string inputFolder, bool zoomed, string folderName)
        {
            string graphMLfile = System.Web.HttpContext.Current.Server.MapPath("~/Web/Graph/" + inputFolder + "/"+ inputFolder + @".graphml");
            GraphDataReader.ReadGraphMLData(graphMLfile, out Links, out Nodes, out rectDim);

            //create Dictionaries for quick search of Labels and Nodes
            SetupLabelDictionary();
            SetupNodeDictionary();

            //compute node adjacencies
            ComputeNodeAdjacencies();


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
                totalWidth = Section.Width + 2 * singleDisplayWidth;
                totalHeight = Section.Height + 2 * singleDisplayHeight;
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
            Stopwatch sw = new Stopwatch();

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

            #region Distribute data across browsers

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
                Directory.CreateDirectory(basePath + FolderNameDigit + @"\zoomed\labels");

                nodesPath = basePath + FolderNameDigit + @"\zoomed\nodes\\";
                linksPath = basePath + FolderNameDigit + @"\zoomed\links\\";
            }


            // ii. write to files
            WriteNodeFiles(totalRows, totalCols, nodesPath, partitions);
            WriteLinkFiles(totalRows, totalCols, linksPath, partitions);
            #endregion

            return this.FolderNameDigit;
        }


        private static void WriteNodeFiles(int totalRows, int totalCols, string linksPath, Partition[,] partitions)
        {
            Stopwatch sw = new Stopwatch();
            sw.Start();
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
            sw.Stop();
            Debug.WriteLine("Time taken to write nodes file: " + sw.ElapsedMilliseconds + "ms");
            GraphAppHub.self.LogTime("Time taken to write nodes file: " + sw.ElapsedMilliseconds + "ms");
        }

        private static void WriteLinkFiles(int totalRows, int totalCols, string linksPath, Partition[,] partitions)
        {
            Stopwatch sw = new Stopwatch();
            sw.Start();
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
            sw.Stop();
            Debug.WriteLine("Time taken to write links file: " + sw.ElapsedMilliseconds + "ms");
            GraphAppHub.self.LogTime("Time taken to write links file: " + sw.ElapsedMilliseconds + "ms");
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


        // ***********************
        // global dictionary variables
        // ***********************
        // map label to index within labels array
        Dictionary<string, int> labelDict;
        // map node ID to index within nodes data array
        Dictionary<string, int> nodeDict;

        // set up label dictionary to prepare for search
        private void SetupLabelDictionary()
        {
            Stopwatch sw = new Stopwatch();
            sw.Start();

            this.labelDict = new Dictionary<string, int>();

            for (int i = 0; i < Nodes.Count; i++)
            {
                try       // TODO HACK improve this checking!!
                {
                    this.labelDict.Add(Nodes[i].Label, i);
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


        private void SetupNodeDictionary()
        {
            Stopwatch sw = new Stopwatch();
            sw.Start();

            this.nodeDict = new Dictionary<string, int>();

            for (int i = 0; i < Nodes.Count; i++)
            {
                this.nodeDict.Add(Nodes[i].ID, i);
            }
            sw.Stop();
            Debug.WriteLine("Time taken to set up nodes dictionary: " + sw.ElapsedMilliseconds + "ms");
            GraphAppHub.self.LogTime("Time taken to set up nodes dictionary: " + sw.ElapsedMilliseconds + "ms");
        }
        
        /** 
        * Auxiliar function to compute the neighbours of each node and store that information within the Node objects themselves
        */
        private void ComputeNodeAdjacencies()
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


        public void UpdateZoomVar(bool value)
        {
            zoomedIn = value;
        }
    }
}

