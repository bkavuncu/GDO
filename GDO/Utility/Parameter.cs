using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Security.Permissions;
using System.Web;

namespace GDO.Utility
{
    public enum VisualisationTypes
    {
        Boolean = 1,
        String = 2,
        Number = 3,
        Slider = 4,
        Color = 5,
        Dropdown = 6,
        DataList = 7
    }

    public enum Priorities
    {
        High = 3,
        Normal = 2,
        Low = 1,    
    }

    public class Parameter
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public int Priority { get; set; }
        public int VisualisationType { get; set; }
        public bool IsEditable { get; set; }
    }

    public class IntegerParameter : Parameter
    {
        public int? Value { get; set; }
        public int? MinValue { get; set; }
        public int? MaxValue { get; set; }
    }

    public class FloatParameter : Parameter
    {
        public float? Value { get; set; }
        public float? MinValue { get; set; }
        public float? MaxValue { get; set; }
    }

    public class DoubleParameter : Parameter
    {
        public double? Value { get; set; }
        public double? MinValue { get; set; }
        public double? MaxValue { get; set; }
    }

    public class StringParameter : Parameter
    {
        public string Value { get; set; }
    }

    public class BooleanParameter : Parameter
    {
        public bool Value { get; set; }
    }

    public class ArrayParameter : Parameter
    {
        public string[] Values { get; set; }
    }

    //How to use:
    /*
            Test = new IntegerParameter
            {
                Name = "Test",
                Description = "Test is a Test",
                Priority = (int)GDO.Utility.Priorities.Low,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Slider,
                IsEditable = true,
                Value = 5,
                MinValue = 0,
                MaxValue = 10
            };
    */
}