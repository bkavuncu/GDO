using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Utility;

namespace GDO.Apps.Maps.Core.DataSources
{
    public class LocalFile : Data
    {
        public FileInputParameter Url { get; set; }

        public LocalFile()
        {
            ClassName.Value = this.GetType().Name;
            Description.Value = "Local File";

            Url = new FileInputParameter
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