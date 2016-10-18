using GDO.Core;
using System.Diagnostics;
using Newtonsoft.Json.Linq;
using GDO.Core.Apps;
using System;

namespace GDO.Apps.XNATImaging
{
    public class XNATImagingApp : IBaseAppInstance
    {
        public int Id { get; set; }
        public string AppName { get; set; }
        public Section Section { get; set; }
        public AppConfiguration Configuration { get; set; }
        public bool IntegrationMode { get; set; }
        public IAdvancedAppInstance ParentApp { get; set; }

        public string Name { get; set; }
        public string Host { get; set; }
        public string ExperimentName { get; set; }
        public string PatientId { get; set; }
        public string MriUrl { get; set; }

        public dynamic CurrentCoord { get; set; }
        public double ScreenMin { get; set; }
        public double ScreenMax { get; set; }
        public string CurrentOrientation { get; set; }
        public dynamic MarkingCoords { get; set; }
        public string ColorTable { get; set; }

        // List of available Patients and Corresponding Experiments
        public string[] Patients = {"AD201713", "AD201714", "AD201752" };
        public string[] Experiments = { "GSK131086_000001", "GSK131086_000002", "GSK131086_000005" };

        public string[] mriColors = { "red", "green", "blue", "yellow" };
        string[] AllModes = { "title", "topText", "subText", "mri", "zoom", "pdf" };

        // parameters for default configuration
        public string[] DefaultTextStrings = { "Multiple Sclerosis Imaging", "T1", "T2/FLAIR", "Baseline", "Followup", "Data Imaging Analysis"};
        public string[] DefaultMriUrls = { "t1_baseline.nii.gz", "t2_baseline.nii.gz", "t1_followup.nii.gz", "t2_followup.nii.gz" };
        public string[] DefaultModalityStrings = { "T1 Baseline", "T2 Baseline", "T1 Followup", "T2 Followup" };
        public string[] DefaultZoomUrls = { "t1_baseline.nii.gz", "t1_baseline.nii.gz", "t1_followup.nii.gz" };
        public string[] DefaultPdfUrls = { "msmetrix_report-1.pdf", "msmetrix_report-2.pdf" };
        public string[] DefaultBaselineOverlays = { "gm_baseline.nii.gz", "labeled_lesions_baseline.nii.gz" };
        public string[] DefaultFollowupOverlays = { "gm_followup.nii.gz", "labeled_lesions_followup.nii.gz" };

        public void Init()
        {
            InitConfigurations();
        }

        public void Init(int instanceId, string appName, Section section, AppConfiguration configuration)
        {
            Id = instanceId;
            AppName = appName;
            Section = section;
            Configuration = configuration;
        }

        public void SetName(string name)
        {
            Name = name;
        }

        public string GetName()
        {
            return Name;
        }

        public void SetImage(dynamic currentCoord, double screenMin, double screenMax,
                                   string currentOrientation,
                                   dynamic markingCoords,
                                   string colorTable)
        {
            CurrentCoord = currentCoord;
            ScreenMin = screenMin;
            ScreenMax = screenMax;
            CurrentOrientation = currentOrientation;
            MarkingCoords = markingCoords;
            ColorTable = colorTable;
        }

        // Generates blank configuration file
        public JObject GenerateBlankConfigurationFile()
        {
            JObject appConfig = JObject.FromObject(new
            {
                appName = AppName,
                host = Host,
                experimentName = ExperimentName,
                patient = PatientId,
                controlUrl = "t1_baseline.nii.gz",
                mriUrl = MriUrl,
                mriUrlList = new JArray(),
                pdfUrl = "../../Scripts/XNATImaging/pdf/",
                defaultOrientation = "sagittal",
                worldSpace = true
            });

            JArray screenConfigsArray = new JArray();
            for (int i = 0; i < Cave.Cols; i++)
            {
                for (int j = 0; j < Cave.Rows; j++)
                {
                    JObject screenConfig = new JObject();
                    if (i == 0 && j == 0)
                    {
                        screenConfig = AddTextConfig(AllModes[0], AppName);
                    }
                    else {
                        screenConfig = AddBlankConfig();
                    }

                    screenConfigsArray.Add(JObject.FromObject(new 
                    {
                        col = i,
					    row = j,
					    config = screenConfig

                    }
				));
                }
            }

            appConfig.Add(new JProperty("screens", screenConfigsArray));
		    return appConfig;
        }


        // Method to generate default Configuration File
        public JObject GenerateDefaultConfigurationFile(string[] textStrings, string[] mriUrls, string[] modalityStrings, string[] zoomUrls, string[] pdfUrls)
        {
            JObject appConfig = JObject.FromObject(new
            {
                appName = AppName,
                host = Host,
                experimentName = ExperimentName,
                patient = PatientId,
                controlUrl = "t1_baseline.nii.gz",
                mriUrl = MriUrl,
                mriUrlList = new JArray(),
                pdfUrl = "../../Scripts/XNATImaging/pdf/",
                defaultOrientation = "sagittal",
                worldSpace = true
            });
            
            int textCounter = 0;
            int mriCounter = 0;
            int zoomCounter = 0;
            int zoomCol = 0;
            int pdfCounter = 0;
            JArray screenConfigsArray = new JArray();

            for (int i = 0; i < Cave.Cols; i++)
            {
                for (int j = 0; j < Cave.Rows; j++)
                {
                    JObject screenConfig = new JObject();
                    string mode = GetMode(i, j);
                    if (mode == AllModes[0] || mode == AllModes[1] || mode == AllModes[2])
                    {
                        if (textCounter < textStrings.Length)
                        {
                            screenConfig = AddTextConfig(mode, textStrings[textCounter]);
                        }
                        textCounter++;
                    }
                    if (mode == AllModes[3])
                    {
                        if (mriCounter < mriUrls.Length && mriCounter < modalityStrings.Length)
                        {
                            screenConfig = AddMriConfig(mode, mriUrls[mriCounter], modalityStrings[mriCounter], mriColors[mriCounter]);
                        }
                        mriCounter++;
                    }
                    if (mode == AllModes[4])
                    {
                        if (zoomCol > 11)
                        {
                            zoomCol = 0;
                        }
                        if ((int)Math.Floor(zoomCounter / 16.0) < zoomUrls.Length)
                        {
                            screenConfig = AddZoomConfig(mode, (int) Math.Floor(zoomCol/4.0), j, zoomUrls[(int) Math.Floor(zoomCounter/16.0)], (int)Math.Floor(zoomCounter / 16.0));
                        }
                        zoomCol++;
                        zoomCounter++;
                    }
                    if (mode == AllModes[5])
                    {
                        if ((int) Math.Floor(pdfCounter / 3.0) < pdfUrls.Length)
                        {
                            screenConfig = AddPdfConfig(mode, j, pdfUrls[(int) Math.Floor(pdfCounter/3.0)]);
                        }
                        pdfCounter++;
                    }

                    screenConfigsArray.Add(JObject.FromObject(new
                    {
                        col = i,
                        row = j,
                        config = screenConfig
                    }));
                }
            }

            appConfig.Add(new JProperty("screens", screenConfigsArray));
            return appConfig;
        }

        private JObject AddTextConfig(string mode, string text)
        {
            return JObject.FromObject(new 
            {
                mode,
		        text

            });
        }

        private JObject AddMriConfig(string mode, string url, string modality, string color)
        {
            return JObject.FromObject(new 
            {
                mode,
		        url,
		        orthogonal = true,
                modality,
                color,
		        imageData = JObject.FromObject(new 
                {
                    coord = new JObject(),
                    view = "Sagittal",
			        screenMin = 0,
			        screenMax = 0,
			        markers = new JObject()

                })
	        });
        }

        private JObject AddZoomConfig(string mode, int colOffset, int row, string url, int zoomCounter)
        {
            bool switchable = false;
            JArray overlays = new JArray();
            JArray displaySize = null;
            string modality = "";
            int screenMax = 0;

            if (zoomCounter == 0)
            {
                switchable = true;
                modality = "T1 Baseline";
                displaySize = new JArray(3, 4);
            } else if (zoomCounter == 1)
            {
                modality = "T1 Baseline with T2 lesions overlayed";
                overlays = new JArray(DefaultBaselineOverlays[0], DefaultBaselineOverlays[1]);
                displaySize = new JArray(4, 4);
                screenMax = 649;
            } else if (zoomCounter == 2)
            {
                modality = "T1 Followup with T2 lesions overlayed";
                overlays = new JArray(DefaultFollowupOverlays[0], DefaultFollowupOverlays[1]);
                displaySize = new JArray(4, 4);
                screenMax = 649;
            }
            return JObject.FromObject(new 
            {
                mode,
		        switchable,
		        url,
                overlays,
		        orthogonal = true,
		        zoomOffset = new JArray(colOffset, row),
                displaySize,
                modality,
                imageData = JObject.FromObject(new 
                {
                    coord = new JObject(),
			        view = "Sagittal",
			        screenMin = 0,
			        screenMax,
			        markers = new JObject()

                })
	        });
        }
        
        private JObject AddPdfConfig(string mode, int row, string url)
        {
            return JObject.FromObject(new
            {
                mode,
                url,
                displaySize = new JArray(1, 3),
                zoomOffset = new JArray(0, row - 1),
                scale = 3.1
            });
        }

        private JObject AddBlankConfig()
        {
            return JObject.FromObject(new
            {
                mode = "",
                url = "",
                switchable = false,
                orthogonal = true,
                displaySize = new JArray(),
                zoomOffset = new JArray(),
                scale = 3,
                text = "",
                modality = "",
                color = "",
                imageData = JObject.FromObject(new
                {
                    coord = new JObject(),
                    view = "Sagittal",
                    screenMin = 0,
                    screenMax = 0,
                    markers = new JObject()

                })
            });
        }

        // Maps screens to mode based on column and row in cave
        private string GetMode(int col, int row)
        {

            if (col == 0)
            {
                if (row == 0)
                {
                    return AllModes[0];
                }
                if (row < 3)
                {
                    return AllModes[2];
                }
                return "";
            }
            if (col < 3)
            {
                if (row == 0)
                {
                    return AllModes[1];
                }
                if (row < 3)
                {
                    return AllModes[3];
                }
                return "";
            }
            if (col < 12)
            {
                return AllModes[4];
            }
            if (col <= 13)
            {
                return "";
            }
            if (col < 16)
            {
                if (row == 0)
                {
                    if (col == 14)
                    {
                        return AllModes[0];
                    }
                    return "";
                }
                return AllModes[5];
            }
            return "";
        }

        public JArray GetMriList()
        {
            var jsonString = Configuration.Json.ToString();
            dynamic config = JObject.Parse(jsonString);

            JArray mriUrlList = new JArray();
            foreach (var screen in config.screens)
            {
                if (screen.config.mode == "mri")
                {
                    mriUrlList.Add(JObject.FromObject(new
                    {
                        modality = screen.config.modality.ToString(),
                        url = screen.config.url.ToString()
                    }));
                }
            }
            return mriUrlList;
        }

        // test method
        public void InitConfigurations()
        {
            Debug.WriteLine(Configuration.Name);

            var jsonString = Configuration.Json.ToString();
            dynamic config = JObject.Parse(jsonString);
            
            Host = config.host;
            PatientId = config.patient;
            ExperimentName = config.experimentName;
            MriUrl = config.mriUrl;

            //Debug.WriteLine(Configuration.Json);
            //Debug.WriteLine(GenerateBlankConfigurationFile());
            //Debug.WriteLine(GenerateDefaultConfigurationFile(DefaultTextStrings, DefaultMriUrls, DefaultModalityStrings, DefaultZoomUrls, DefaultPdfUrls));
        }
    }
}