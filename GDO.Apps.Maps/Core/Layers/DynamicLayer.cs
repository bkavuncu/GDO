using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Utility;

namespace GDO.Apps.Maps.Core.Layers
{
    public class DynamicLayer : Layer
    {
        public LinkParameter Source { get; set; }
        public TimeParameter StartTime { get; set; }
        public TimeParameter EndTime { get; set; }
        public IntegerParameter CurrentTime { get; set; }
        public IntegerParameter WaitTime { get; set; }
        public TimeParameter TimeStep { get; set; }

        public BooleanParameter IsLooping { get; set; }
        public BooleanParameter IsPlaying { get; set; }


        public DynamicLayer()
        {
            ClassName.Value = this.GetType().Name;

            Source = new LinkParameter
            {
                Name = "Source",
                PropertyName = "source",
                Description = "The source for this layer",
                Priority = (int)GDO.Utility.Priorities.Required,
                IsEditable = false,
                IsVisible = true,
                LinkedParameter = "sources",
                ClassTypes = new string[1] { "DynamicVectorSource", },
            };

            StartTime = new TimeParameter
            {
                Name = "Start Time",
                Description = "Starting Time of the Animation",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = true,
                IsProperty = false,
            };

            EndTime = new TimeParameter
            {
                Name = "End Time",
                Description = "Ending Time of the Animation",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = true,
                IsProperty = false,
            };

            CurrentTime = new IntegerParameter
            {
                Name = "Last Animation Frame",
                Description = "In Epoch Time from Start Time",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = false,
                IsProperty = false,
                Value = 0,
            };

            TimeStep = new TimeParameter
            {
                Name = "Time Step",
                Description = "Each Step of the Animation",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = true,
                IsDuration = true,
                IsProperty = false,
            };

            WaitTime = new IntegerParameter
            {
                Name = "Wait Time",
                Description = "Duration of each timestep in animation",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = true,
                IsProperty = false,
            };

            IsLooping = new BooleanParameter
            {
                Name = "Loop Animation",
                Description = "When set to true, the layer animation will loop",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsProperty = false,
                IsEditable = true,
                IsVisible = true,
                DefaultValue = false
            };

            IsPlaying = new BooleanParameter
            {
                Name = "Is Playing",
                Description = "If layer is currently animating",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsProperty = false,
                IsEditable = false,
                IsVisible = false,
                DefaultValue = false
            };
        }
    }
}