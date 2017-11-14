using Newtonsoft.Json;
using GDO.Utility;

namespace GDO.Apps.Maps.Core
{
    public class Base
    {
        [JsonProperty(Order = -2)]
        public IntegerParameter Id { get; set; }

        [JsonProperty(Order = -2)]
        public StringParameter Name { get; set; }

        [JsonProperty(Order = -2)]
        public StringParameter ClassName { get; set; }

        [JsonProperty(Order = -2)]
        public StringParameter Description { get; set; }

        [JsonProperty(Order = -2)]
        public StringParameter ObjectType { get; set; }

        public Base()
        {
            Id = new IntegerParameter
            {
                Name = "Id",
                Description = "Id",
                Priority = (int) GDO.Utility.Priorities.System,
                IsEditable = false,
                IsVisible = true,
                IsProperty = false,
            };

            Name = new StringParameter
            {
                Name = "Name",
                Description = "Name",
                Priority = (int) GDO.Utility.Priorities.System,
                IsEditable = true,
                IsVisible = true,
                IsProperty = false,
            };

            ClassName = new StringParameter
            {
                Name = "Class Name",
                Description = "Name of the Class",
                Priority = (int) GDO.Utility.Priorities.System,
                IsEditable = false,
                IsVisible = true,
                IsProperty = false,
            };

            Description = new StringParameter
            {
                Name = "Description",
                Description = "Description of the Object",
                Priority = (int)GDO.Utility.Priorities.System,
                IsEditable = false,
                IsVisible = false,
                IsProperty = false,
                InputType = (int)InputTypes.TextArea,
        };

            ObjectType = new StringParameter
            {
                Name = "Type",
                Description = "Type of JS Object",
                Priority = (int) GDO.Utility.Priorities.System,
                IsEditable = false,
                IsVisible = false,
                IsProperty = false,
            };
        }
    }
}