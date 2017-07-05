using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Threading.Tasks;
using GDO.Core;
using Newtonsoft.Json;

namespace GDO.Apps.SigmaGraph.Domain {
    public static class SigmaGraphProcessor {
        public static void ProcessGraph(GraphInfo graphinfo, string filename, bool zoomed, string folderName, string indexFile, string folderid,Section section) {
//create Dictionary for quick search of Nodes by ID
            var nodeDictionary = SetupNodesDictionary(graphinfo);

            //compute node adjacencies  
            ComputeNodeAdjacencies(graphinfo, nodeDictionary);

            #region calculate viewport and scales

            int singleDisplayWidth = section.Width / section.Cols;
            int singleDisplayHeight = section.Height / section.Rows;

            // set up total width and height, which differ for non-zoomed and zoomed version
            int totalRows, totalCols;
            int totalWidth, totalHeight;

            if (!zoomed) {
                totalWidth = section.Width;
                totalHeight = section.Height;
                totalRows = section.Rows;
                totalCols = section.Cols;
            }
            else {
                // current zooming is pre-set to include two extra rows and two extra cols (regardless of section dimension)
                totalWidth = section.Width + 2 * singleDisplayWidth;
                totalHeight = section.Height + 2 * singleDisplayHeight;
                totalRows = section.Rows + 2;
                totalCols = section.Cols + 2;
            }

            // transform data to GDO dimension
            Scales scales = new Scales {
                X = totalWidth / graphinfo.RectDim.Width,
                Y = totalHeight / graphinfo.RectDim.Height
            };

            float scaleDown = (float) 0.9; // to make graph smaller and nearer to (0, 0)

            #endregion

            #region scale nodes and links

            Stopwatch sw = new Stopwatch();

            // scale nodes to full gdo dimension
            foreach (GraphNode n in graphinfo.Nodes) {
                n.Pos.X *= scales.X * scaleDown;
                n.Pos.Y *= scales.Y * scaleDown;

                // add padding on x, y to centralise graph after being scaled down
                n.Pos.X += totalWidth * (1 - scaleDown) / 2;
                n.Pos.Y += totalHeight * (1 - scaleDown) / 2;
            }

            sw.Stop();
            Debug.WriteLine("Time to scale links & nodes: " + sw.ElapsedMilliseconds + "ms");
            SigmaGraphAppHub.self.LogTime("Time to scale links & nodes: " + sw.ElapsedMilliseconds + "ms");

            #endregion

            #region Distribute data across browsers

            var partitions = SigmaGraphPartitioning.InitializeNodePartition(totalRows, totalCols);

            // 1. Distribute nodes & labels
            sw.Restart();
            Debug.WriteLine("About to DistributeNodesInPartitions");
            // Set up a 2D array to store nodes data in each partition
            partitions = SigmaGraphPartitioning.DistributeNodesInPartitions(partitions, graphinfo.Nodes, section);
            sw.Stop();
            Debug.WriteLine("Time taken to distribute nodes across browsers: " + sw.ElapsedMilliseconds + "ms");
            SigmaGraphAppHub.self.LogTime("Time taken to distribute nodes across browsers: " + sw.ElapsedMilliseconds + "ms");

            // 2. Distribute links
            sw.Restart();
            // Set up a 2D array to store nodes data in each partition
            Debug.WriteLine("About to distribute Links");
            partitions =
                SigmaGraphPartitioning.DistributeLinksInPartitions(partitions, graphinfo.Links, singleDisplayWidth, singleDisplayHeight,section);
            sw.Stop();
            Debug.WriteLine("Time taken to distribute links across browsers: " + sw.ElapsedMilliseconds + "ms");
            SigmaGraphAppHub.self.LogTime("Time taken to distribute links across browsers: " + sw.ElapsedMilliseconds + "ms");

            // write to individual browser file
            // i. create sub-directories to store partition files
            Debug.WriteLine("Writing partition files");
            SigmaGraphAppHub.self.LogTime("Writing partition files");
            String basePath = System.Web.HttpContext.Current.Server.MapPath("~/Web/SigmaGraph/graph/");
            CreateTempFolder(folderName, basePath,folderid);


            string nodesPath, linksPath;
                
            if (!zoomed) {
                Directory.CreateDirectory(basePath + folderid + @"\normal");
                Directory.CreateDirectory(basePath + folderid + @"\normal\nodes");
                Directory.CreateDirectory(basePath + folderid + @"\normal\links");

                nodesPath = basePath + folderid + @"\normal\nodes\";
                linksPath = basePath + folderid + @"\normal\links\";
            }
            else {
                Directory.CreateDirectory(basePath + folderid + @"\zoomed");
                Directory.CreateDirectory(basePath + folderid + @"\zoomed\nodes");
                Directory.CreateDirectory(basePath + folderid + @"\zoomed\links");
                Directory.CreateDirectory(basePath + folderid + @"\zoomed\labels");

                nodesPath = basePath + folderid + @"\zoomed\nodes\";
                linksPath = basePath + folderid + @"\zoomed\links\";
            }


            // ii. write to files
            WriteAllNodesFile(nodesPath, graphinfo.Nodes);
            WriteNodeFiles(totalRows, totalCols, nodesPath, partitions);
            WriteLinkFiles(totalRows, totalCols, linksPath, partitions);

            Debug.WriteLine("Writen partition files");

            #endregion

            // log to index file  
            File.AppendAllLines(indexFile, new[] {filename + "|" + folderid + "|" + section.Width + "|" + section.Height});
        }

        private static void WriteAllNodesFile(string nodesPath, List<GraphNode> nodes)
        {   
            // writes a json file containing the information about all nodes in the graph; all browsers will need this information for searching
            using (StreamWriter streamWriter = new StreamWriter(nodesPath +  @"all" + @".json")
            {
                AutoFlush = true
            })
            {
                JsonWriter jsonWriter = new JsonTextWriter(streamWriter);
                JsonSerializer serializer = new JsonSerializer();
                serializer.Serialize(jsonWriter, nodes);
            }
        }

        private static void WriteNodeFiles(int totalRows, int totalCols, string linksPath, Partition[,] partitions)
        {
            Stopwatch sw = new Stopwatch();
            sw.Start();
            Parallel.For(0,totalCols, j => { 
                //for (int j = 0; j < totalCols; ++j) {
                for (int i = 0; i < totalRows; ++i)
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
            });
            sw.Stop();
            Debug.WriteLine("Time taken to write nodes file: " + sw.ElapsedMilliseconds + "ms");
            SigmaGraphAppHub.self.LogTime("Time taken to write nodes file: " + sw.ElapsedMilliseconds + "ms");
        }

        private static void WriteLinkFiles(int totalRows, int totalCols, string linksPath, Partition[,] partitions)
        {
            Stopwatch sw = new Stopwatch();
            sw.Start();
            Parallel.For(0, totalCols, j => {
                //for (int j = 0; j < totalCols; ++j)
                {
                    for (int i = 0; i < totalRows; ++i) {
                        using (StreamWriter streamWriter = new StreamWriter(linksPath + i + @"_" + j + @".json") {
                            AutoFlush = true
                        }) {
                            JsonWriter jsonWriter = new JsonTextWriter(streamWriter);
                            JsonSerializer serializer = new JsonSerializer();
                            serializer.Serialize(jsonWriter, partitions[i, j].Links);
                        }
                    }
                }
            });
            sw.Stop();
            Debug.WriteLine("Time taken to write links file: " + sw.ElapsedMilliseconds + "ms");
            SigmaGraphAppHub.self.LogTime("Time taken to write links file: " + sw.ElapsedMilliseconds + "ms");
        }

        private static void CreateTempFolder(string folderName, string basePath,string folderNameDigit)
        {
            if (folderName == null)
            {
                // Generate random numbers as folder name
                Random randomDigitGenerator = new Random();
                while (Directory.Exists(basePath + folderNameDigit))
                {
                    folderNameDigit = randomDigitGenerator.Next(10000, 99999).ToString();   
                }
                Directory.CreateDirectory(basePath + folderNameDigit);
            }
            else
            {
                folderNameDigit = folderName;
            }
        }

        private static Dictionary<string, GraphNode> SetupNodesDictionary(GraphInfo graphinfo)
        {
            Stopwatch sw = new Stopwatch();
            sw.Start();

            var _nodesDictionary = new Dictionary<string, GraphNode>();
            foreach (GraphNode n in graphinfo.Nodes)
            {
                try       // TODO improve this checking
                {
                    _nodesDictionary.Add(n.ID, n);
                }
                catch (Exception e)
                {
                    Debug.WriteLine(e + "Node '" + n.ID + "' already exists!");
                    SigmaGraphAppHub.self.LogTime(e + "Node '" + n.ID + "' already exists!");
                }
            }
            sw.Stop();
            Debug.WriteLine("Time taken to set up nodes dictionary: " + sw.ElapsedMilliseconds + "ms");
            SigmaGraphAppHub.self.LogTime("Time taken to set up nodes dictionary: " + sw.ElapsedMilliseconds + "ms");

            return _nodesDictionary;
        }

        private static void ComputeNodeAdjacencies(GraphInfo graphinfo, Dictionary<string, GraphNode> nodeDictionary)
        {
            Stopwatch sw = new Stopwatch();
            sw.Start();

            foreach (GraphLink l in graphinfo.Links)
            {
                //add the target to the source Adj variable
                GraphNode n = nodeDictionary[l.Source];
                n.Adj.Add(l.Target);
                n.NumLinks++;

                //add the source to the target Adj variable
                n = nodeDictionary[l.Target];
                n.Adj.Add(l.Source);
                n.NumLinks++;
            }
            sw.Stop();
            Debug.WriteLine("Time taken to compute adjacencies: " + sw.ElapsedMilliseconds + "ms");
            SigmaGraphAppHub.self.LogTime("Time taken to compute adjacencies: " + sw.ElapsedMilliseconds + "ms");
        }
    }
}