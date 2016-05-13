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
        Boolean = 1, //Basic on/off button
        String = 2, //String input
        Number = 3, //Number input
        Slider = 4, //Slider with Min-Max
        Color = 5, //Color Picker
        Datalist = 6, //If Array use Array, if not use link
        Array = 7 //Input with multiple cols for the array size
    }

    public enum ParameterTypes
    {
        Boolean = 0,
        Integer = 1,
        NullableInteger = 2,
        IntegerRange = 3,
        Float = 4,
        FloatRange = 5,
        Double = 6,
        DoubleRange = 7,
        String = 8,
        Link = 9,
        BooleanArray = 10,
        IntegerArray = 11,
        FloatArray = 12,
        DoubleArray = 13,
        StringArray = 14
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
        public int ParameterType { get; set; }
        public int VisualisationType { get; set; }
        public bool IsEditable { get; set; }
        public bool IsVisible { get; set; }
    }
    public class BooleanParameter : Parameter
    {
        public bool? Value { get; set; }
        public new int ParameterType = 0;
    }

    public class IntegerParameter : Parameter
    {
        public int Value { get; set; }
        public int? Increment { get; set; }
        public new int ParameterType = 1;
    }

    public class NullableIntegerParameter : Parameter
    {
        public int? Value { get; set; }
        public int? Increment { get; set; }
        public new int ParameterType = 2;
    }

    public class IntegerRangeParameter : Parameter
    {
        public int? Value { get; set; }
        public int? MinValue { get; set; }
        public int? MaxValue { get; set; }
        public int? Increment { get; set; }
        public new int ParameterType = 3;
    }

    public class FloatParameter : Parameter
    {
        public float? Value { get; set; }
        public float? Increment { get; set; }
        public new int ParameterType = 4;
    }

    public class FloatRangeParameter : Parameter
    {
        public float? Value { get; set; }
        public float? MinValue { get; set; }
        public float? MaxValue { get; set; }
        public float? Increment { get; set; }
        public new int ParameterType = 5;
    }

    public class DoubleParameter : Parameter
    {
        public double? Value { get; set; }
        public double? Increment { get; set; }
        public new int ParameterType = 6;
    }

    public class DoubleRangeParameter : Parameter
    {
        public double? Value { get; set; }
        public double? MinValue { get; set; }
        public double? MaxValue { get; set; }
        public double? Increment { get; set; }
        public new int ParameterType = 7;
    }

    public class StringParameter : Parameter
    {
        public string Value { get; set; }
        public new int ParameterType = 8;
    }

    public class LinkParameter : Parameter
    {
        public int? Value { get; set; }
        public string LinkedParameter { get; set; }
        public new int ParameterType = 9;
    }

    public class BooleanArrayParameter : Parameter
    {
        public bool[] Values { get; set; }
        public int Length { get; set; }
        public new int ParameterType = 10;
    }

    public class IntegerArrayParameter : Parameter
    {
        public int[] Values { get; set; }
        public int Length { get; set; }
        public int Value { get; set; }
        public new int ParameterType = 11;
    }

    public class FloatArrayParameter : Parameter
    {
        public float[] Values { get; set; }
        public float Value { get; set; }
        public int Length { get; set; }
        public new int ParameterType = 12;
    }

    public class DoubleArrayParameter : Parameter
    {
        public double[] Values { get; set; }
        public double Value { get; set; }
        public int Length { get; set; }
        public new int ParameterType = 13;
    }

    public class StringArrayParameter : Parameter
    {
        public string[] Values { get; set; }
        public string Value { get; set; }
        public int Length { get; set; }
        public new int ParameterType = 14;
    }

    //How to use:
    /*
            Test = new IntegerRangeParameter
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