using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Utility;

namespace GDO.Apps.Maps.Core.DataSources
{
    public class DynamicFile : Data
    {
        public FileInputParameter File { get; set; }

        public DynamicFile()
        {
            ClassName.Value = this.GetType().Name;
            Description.Value = "Dynamic File";

            File = new FileInputParameter
            {
                Name = "File",
                Description = "Relative path of the file.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true,
                IsProperty = false,
            };
        }
    }
}