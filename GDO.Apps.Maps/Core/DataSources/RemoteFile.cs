using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Utility;

namespace GDO.Apps.Maps.Core.DataSources
{
    public class RemoteFile : Data
    {
        public StringParameter Url { get; set; }

        public RemoteFile()
        {
            ClassName.Value = this.GetType().Name;
            Description.Value = "Remote File";

            Url = new StringParameter
            {
                Name = "Url",
                Description = "Relative path of the file.",
                Priority = (int)GDO.Utility.Priorities.Required,
                IsEditable = false,
                IsVisible = true,
            };
        }
    }
}