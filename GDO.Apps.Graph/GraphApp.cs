using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Web;
using GDO.Core;
using GDO.Utility;
using Newtonsoft.Json;

/* transcoding from javascript distributeGraph.js

*/

namespace GDO.Apps.Graph
{

    public class GraphApp : IAppInstance
    {
        public int Id { get; set; }
        public Section Section { get; set; }
        public AppConfiguration Configuration { get; set; }

        /*
        public string ImageName { get; set; }
        public string ImageNameDigit { get; set; }
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


        // init is run when 'Deploy' is clicked
        public void init(int instanceId, Section section, AppConfiguration configuration)
        {
            this.Id = instanceId;
            this.Section = section;
            this.Configuration = configuration;
            Directory.CreateDirectory(System.Web.HttpContext.Current.Server.MapPath("~/") + @"\Web\Graph\graph");
        }

        public int checkBrowserPos(Pos pos)
        {
            BrowserPos browserPos = new BrowserPos();
            browserPos.row = Math.Floor(pos.y / Section.Height);
            browserPos.col = Math.Floor(pos.x / Section.Width);
        }


        public void ProcessGraph()   // add parameter string filename later, also may need to change return type
        {

            StreamReader file = File.OpenText(System.Web.HttpContext.Current.Server.MapPath("~/") + @"\Web\Graph\output.json");
            JsonTextReader reader = new JsonTextReader(file);
            JsonSerializer serializer = new JsonSerializer();
            GraphCompleteData graphData = serializer.Deserialize<GraphCompleteData>(reader);

            //System.Diagnostics.Debug.WriteLine(graphData.rectDimension.height);


            StreamWriter sw = new StreamWriter(System.Web.HttpContext.Current.Server.MapPath("~/") + @"\Web\Graph\new_output.json");
            sw.AutoFlush = true;
            JsonWriter writer = new JsonTextWriter(sw);
            serializer.Serialize(writer, graphData.nodes);

            List<Node> nodes = graphData.nodes;
            List<Link> links = graphData.links;
            RectDimension rectDimension = graphData.rectDimension;

            // transform data to GDO dimension
            Scales scales = new Scales();
            scales.x = Section.Width / rectDimension.width;
            scales.y = Section.Height / rectDimension.height;

            Double scaleDown = 0.9; // to make graph smaller and nearer to (0, 0)

            for (int i = 0; i < nodes.Count; i++)
            {
                nodes[i].pos.x *= scales.x * scaleDown;
                nodes[i].pos.y *= scales.y * scaleDown;

                // add padding on x, y to centralise graph after being scaled down
                nodes[i].pos.x += Section.Width * (1 - scaleDown)/2;
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


            GraphPartitionData[,] partitionData = new GraphPartitionData[Section.Row, Section.Col];


                /*
                    this.ImageName = imageName;

                    String basePath = System.Web.HttpContext.Current.Server.MapPath("~/") + @"\Web\Graph\images\\";
                    String path1 = basePath + ImageName;
                    Random imgDigitGenerator = new Random();
                    while (Directory.Exists(basePath + ImageNameDigit))
                    {
                        this.ImageNameDigit = imgDigitGenerator.Next(10000, 99999).ToString();
                    }
                    String path2 = basePath + ImageNameDigit + "\\origin.png";
                    Directory.CreateDirectory(basePath + ImageNameDigit);
                    Image img1 = Image.FromFile(path1);
                    img1.Save(path2, ImageFormat.Png);
                    //File.Move(path1, path2);


                    //create origin
                    Image image = Image.FromFile(path2);
                    //image.Save(basePath + ImageNameDigit + "\\origin.png", ImageFormat.Png);
                    //File.Delete(path1);

                    //create thumnail
                    Image thumb = image.GetThumbnailImage(200 * image.Width / image.Height, 200, () => false, IntPtr.Zero);
                    thumb.Save(basePath + ImageNameDigit + "\\thumb.png", ImageFormat.Png);

                    double scaleWidth = (Section.Width + 0.000) / image.Width;
                    double scaleHeight = (Section.Height + 0.000) / image.Height;
                    int imageScaledWidth;
                    int imageScaledHeight;

                    int tempImageCols;
                    int tempImageRows;


                    if (scaleWidth > scaleHeight && mode == (int)Mode.FILL ||
                        scaleWidth < scaleHeight && mode == (int)Mode.FIT)
                    {
                        imageScaledWidth = (image.Width - 1) / Section.Cols + 1; // ceiling
                        imageScaledHeight = (imageScaledWidth * (Section.Height / Section.Rows) - 1) / (Section.Width / Section.Cols) + 1;
                        tempImageCols = Section.Cols;
                        tempImageRows = Math.Max(Section.Rows, (image.Height - 1) / imageScaledHeight + 1); // ceiling
                    }
                    else
                    {
                        imageScaledHeight = (image.Height - 1) / Section.Rows + 1; // ceiling
                        imageScaledWidth = (imageScaledHeight * (Section.Width / Section.Cols) - 1) / (Section.Height / Section.Rows) + 1; // ceiling and keep ratio
                        tempImageCols = Math.Max(Section.Cols, (image.Width - 1) / imageScaledWidth + 1); // ceiling
                        tempImageRows = Section.Rows;
                    }
                    Tiles = new Image[tempImageCols, tempImageRows];
                    for (int i = 0; i < tempImageCols; i++)
                    {
                        for (int j = 0; j < tempImageRows; j++)
                        {
                            // each tile is assigned to a newly constructed Bitmap, with the size of each browser
                            // Bitmap is a descendant of Image
                            Tiles[i, j] = new Bitmap((Section.Width / Section.Cols), (Section.Height / Section.Rows));

                            // assign Bitmap to graphics
                            Graphics graphics = Graphics.FromImage(Tiles[i, j]);

                            // then draw image using DrawImage which is part of systems.drawing
                            // Draws the specified portion of the specified Image at the specified location and with the specified size.



                            graphics.DrawImage(image,
                                new Rectangle(0, 0, (Section.Width / Section.Cols), (Section.Height / Section.Rows)),
                                new Rectangle(i * imageScaledWidth, j * imageScaledHeight, imageScaledWidth, imageScaledHeight),
                                GraphicsUnit.Pixel);
                            graphics.Dispose();
                            path2 = basePath + ImageNameDigit + "\\" + "crop" + @"_" + i + @"_" + j + @".png";
                            Tiles[i, j].Save(path2, ImageFormat.Png);
                        }
                    }
                    return this.ImageNameDigit;
                 */
            }
    }
}
