using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices.ComTypes;
using System.Web;
using GDO.Apps.Maps.Core.Layers;
using GDO.Utility;
using Newtonsoft.Json;

namespace GDO.Apps.Maps.Core
{
    public class Animation : Base
    {

        [JsonProperty(Order = -1)]
        public TimeParameter StartTime { get; set; }
        [JsonProperty(Order = -1)]
        public TimeParameter EndTime { get; set; }
        [JsonProperty(Order = -1)]
        public DoubleParameter CurrentTime { get; set; }
        [JsonProperty(Order = -1)]
        public TimeParameter TimeStep { get; set; }
        [JsonProperty(Order = -1)]
        public IntegerParameter WaitTime { get; set; }
        [JsonProperty(Order = -1)]
        public BooleanParameter IsLooping { get; set; }
        [JsonProperty(Order = -1)]
        public BooleanParameter IsPlaying { get; set; }

        public Animation() : base ()
        {
            ClassName.Value = this.GetType().Name;

            ClassName.Value = this.GetType().Name;

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

            CurrentTime = new DoubleParameter
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