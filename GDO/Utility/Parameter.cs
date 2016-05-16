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
        Boolean = 0, //Basic on/off button
        String = 1, //String input
        Number = 2, //Number input
        Slider = 3, //Slider with Min-Max
        Color = 4, //Color Picker
        Datalist = 5, //If Array use Array, if not use link
        Array = 6, //Input with multiple cols for the array size
        TextArea = 7 //String appears as a text area input
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
        Required = 0,
        Optional = 1  
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
        public bool? Default { get; set; }
        public new int ParameterType = 0;
    }

    public class IntegerParameter : Parameter
    {
        public int Value { get; set; }
        public int Default { get; set; }
        public int? Increment { get; set; }
        public new int ParameterType = 1;
    }

    public class NullableIntegerParameter : Parameter
    {
        public int? Value { get; set; }
        public int? Default { get; set; }
        public int? Increment { get; set; }
        public new int ParameterType = 2;
    }

    public class IntegerRangeParameter : Parameter
    {
        public int? Value { get; set; }
        public int? Default { get; set; }
        public int? MinValue { get; set; }
        public int? MaxValue { get; set; }
        public int? Increment { get; set; }
        public new int ParameterType = 3;
    }

    public class FloatParameter : Parameter
    {
        public float? Value { get; set; }
        public float? Default { get; set; }
        public float? Increment { get; set; }
        public new int ParameterType = 4;
    }

    public class FloatRangeParameter : Parameter
    {
        public float? Value { get; set; }
        public float? Default { get; set; }
        public float? MinValue { get; set; }
        public float? MaxValue { get; set; }
        public float? Increment { get; set; }
        public new int ParameterType = 5;
    }

    public class DoubleParameter : Parameter
    {
        public double? Value { get; set; }
        public double? Default { get; set; }
        public double? Increment { get; set; }
        public new int ParameterType = 6;
    }

    public class DoubleRangeParameter : Parameter
    {
        public double? Value { get; set; }
        public double? Default { get; set; }
        public double? MinValue { get; set; }
        public double? MaxValue { get; set; }
        public double? Increment { get; set; }
        public new int ParameterType = 7;
    }

    public class StringParameter : Parameter
    {
        public string Value { get; set; }
        public string Default { get; set; }
        public new int ParameterType = 8;
    }

    public class LinkParameter : Parameter
    {
        public int? Value { get; set; }
        public int? Default { get; set; }
        public string LinkedParameter { get; set; }
        public new int ParameterType = 9;
    }

    public class BooleanArrayParameter : Parameter
    {
        public bool[] Values { get; set; }
        public bool? Value { get; set; }
        public bool? Default { get; set; }
        public int Length { get; set; }
        public new int ParameterType = 10;
    }

    public class IntegerArrayParameter : Parameter
    {
        public int[] Values { get; set; }
        public int Length { get; set; }
        public int? Value { get; set; }
        public int? Default { get; set; }
        public new int ParameterType = 11;
    }

    public class FloatArrayParameter : Parameter
    {
        public float[] Values { get; set; }
        public float? Value { get; set; }
        public float? Default { get; set; }
        public int Length { get; set; }
        public new int ParameterType = 12;
    }

    public class DoubleArrayParameter : Parameter
    {
        public double[] Values { get; set; }
        public double? Value { get; set; }
        public double? Default { get; set; }
        public int Length { get; set; }
        public new int ParameterType = 13;
    }

    public class StringArrayParameter : Parameter
    {
        public string[] Values { get; set; }
        public string Value { get; set; }
        public string Default { get; set; }
        public int Length { get; set; }
        public new int ParameterType = 14;
    }

    //How to use:
    /*
            TextAlign = new StringArrayParameter
            {
                Name = "Text Align",
                Description = "Text Align",
                Priority = (int)GDO.Utility.Priorities.Optional,
                VisualisationType = (int)GDO.Utility.VisualisationTypes.Datalist,
                IsEditable = true,
                IsVisible = true,
                Values = new string[5]{"left","right","center","end","start"},
                Value = "start"
            };
    */
}