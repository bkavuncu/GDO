﻿using GDO.Core;
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
        public string PatientName { get; set; }

        public dynamic CurrentCoord { get; set; }
        public double WindowWidth { get; set; }
        public double WindowCenter { get; set; }

        string[] AllModes = { "title", "topText", "subText", "mri", "zoom", "pdf" };

        // parameters for default configuration
        string[] DefaultTextStrings = { "Multiple Sclerosis Imaging", "T1", "T2/FLAIR", "Baseline", "Followup", "PDF Reports"};
        string[] DefaultMriUrls = { "t1_baseline.nii.gz", "t2_baseline.nii.gz", "t1_followup.nii.gz", "t2_followup.nii.gz" };
        string[] DefaultModalityStrings = { "T1 Baseline", "T2 Baseline", "T1 Followup", "T2 Followup" };
        string[] DefaultZoomUrls = { "t1_baseline.nii.gz", "patient_t1_baseline.nii.gz", "patient_t1_baseline.nii.gz" };
        string[] DefaultPdfUrls = { "140926_msmetrix_report-3.pdf", "msmetrix_report-2.pdf", "150925_msmetrix_report-3.pdf" };

        public void Init()
        {
            //Debug.WriteLine(AppName);
            //AppName = "Multiple Sclerosis Imaging";
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

        public void SetImage(int currentCoord, double windowWidth, double windowCenter)
        {
            CurrentCoord = currentCoord;
            WindowWidth = windowWidth;
            WindowCenter = windowCenter;
        }

        // Generates blank configuration file
        public string GenerateBlankConfigurationFile()
        {
            JObject appConfig = JObject.FromObject(new
            {
                appName = AppName,
                localHost = "http://localhost:12332/",
                testServerHost = "http://dsigdotesting.doc.ic.ac.uk/",
                experimentName = "GSK131086_000001",
                patient = "AD201713",
                controlUrl = "t1_baseline.nii.gz",
                mriUrl = "Scripts/XNATImaging/Scans/",
                mriUrlList = new JArray(),
                pdfUrl = "../../Scripts/XNATImaging/pdf/",
                defaultOrientation = "sagittal",
                worldSpace = false
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
		    return appConfig.ToString();
        }


        // Method to generate default Configuration File
        public string GenerateDefaultConfigurationFile(string[] textStrings, string[] mriUrls, string[] modalityStrings, string[] zoomUrls, string[] pdfUrls)
        {
            JObject appConfig = JObject.FromObject(new
            {
                appName = AppName,
                localHost = "http://localhost:12332/",
                testServerHost = "http://dsigdotesting.doc.ic.ac.uk/",
                experimentName = "GSK131086_000001",
                patient = "AD201713",
                controlUrl = "t1_baseline.nii.gz",
                mriUrl = "Scripts/XNATImaging/Scans/",
                mriUrlList = new JArray(),
                pdfUrl = "../../Scripts/XNATImaging/pdf/",
                defaultOrientation = "sagittal",
                worldSpace = false
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
                            screenConfig = AddMriConfig(mode, mriUrls[mriCounter], modalityStrings[mriCounter]);
                        }
                        mriCounter++;
                    }
                    if (mode == AllModes[4])
                    {
                        if (zoomCol > 11)
                        {
                            zoomCol = 0;
                        }
                        if ((int)Math.Floor(zoomCounter / 12.0) < zoomUrls.Length)
                        {
                            screenConfig = AddZoomConfig(mode, (int) Math.Floor(zoomCol/4.0), j, zoomUrls[(int) Math.Floor(zoomCounter/12.0)], (int)Math.Floor(zoomCounter / 12.0));
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
            return appConfig.ToString();
        }

        private JObject AddTextConfig(string mode, string text)
        {
            return JObject.FromObject(new 
            {
                mode,
		        text

            });
        }

        private JObject AddMriConfig(string mode, string url, string modality)
        {
            return JObject.FromObject(new 
            {
                mode,
		        url,
		        orthogonal = true,
                modality,
		        imageData = JObject.FromObject(new 
                {
                    x = 0,
			        y = 0,
			        z = 0,
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
            JArray overlays = new JArray("lesion_filled_image_baseline.nii.gz", "gm_baseline.nii.gz", "labeled_lesions_baseline.nii.gz");
            string modality = "";

            if (zoomCounter == 0)
            {
                switchable = true;
                overlays = new JArray();
                modality = "T1 Baseline";
            }
            return JObject.FromObject(new 
            {
                mode,
		        switchable,
		        url,
                overlays,
		        orthogonal = true,
		        zoomOffset = new JArray(colOffset, row),
                displaySize = new JArray(3, 4),
                modality,
                imageData = JObject.FromObject(new 
                {
                    x = 0,
			        y = 0,
			        z = 0,
			        view = "Sagittal",
			        screenMin = 0,
			        screenMax = 0,
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
                imageData = JObject.FromObject(new
                {
                    x = 0,
                    y = 0,
                    z = 0,
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
            if (col == 12)
            {
                return "";
            }
            if (col < 16)
            {
                if (row == 0)
                {
                    if (col == 13)
                    {
                        return AllModes[0];
                    }
                    return "";
                }
                return AllModes[5];
            }
            return "";
        }

        // test method
        public void InitConfigurations()
        {
            Debug.WriteLine(Configuration.Name);

            var jsonString = Configuration.Json.ToString();
            dynamic config = JObject.Parse(jsonString);

            JArray mriUrlList = new JArray();
            foreach (var screen in config.screens)
            {
                if (screen.config.mode == "mri")
                {
                    Debug.WriteLine("MRI!");
                    mriUrlList.Add(JObject.FromObject(new
                    {
                        modality = screen.config.modality.ToString(),
                        url = screen.config.url.ToString()
                    }));
                }
            }
            config.mriUrlList.Replace(mriUrlList);
            Configuration.Json = config.DeepClone();
            Debug.WriteLine(Configuration.Json);

            //Debug.WriteLine(Configuration.Json);
            //Debug.WriteLine(GenerateBlankConfigurationFile());
            //Debug.WriteLine(GenerateDefaultConfigurationFile(DefaultTextStrings, DefaultMriUrls, DefaultModalityStrings, DefaultZoomUrls, DefaultPdfUrls));
        }
    }
}