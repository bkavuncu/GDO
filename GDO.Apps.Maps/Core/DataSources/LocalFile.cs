﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Utility;

namespace GDO.Apps.Maps.Core.DataSources
{
    public class LocalFile : Data
    {
        public LinkDatalistParameter File { get; set; }

        public LocalFile()
        {
            ClassName.Value = this.GetType().Name;
            Description.Value = "Local File";

            File = new LinkDatalistParameter
            {
                Name = "File",
                Description = "Relative path of the file.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = true,
                IsProperty = false,
                LinkedParameter = "file",
                LinkedProperty = "Url",
                ClassTypes = new string[1] { "File" },
            };
        }
    }
}