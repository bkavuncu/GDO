using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Security.Permissions;
using System.Web;

namespace GDO.Utility
{
    public enum InputTypes
    {
        Boolean = 1, //Basic on/off button
        String = 2, //String input
        Integer = 3, //Integer Input
        Float = 4, //Float Input
        //Increment = 5, //Increment input
        Slider = 6, //Slider with Min-Max
        Color = 7, //Color Picker
        DataList = 8, //If Array use Array
        Link = 9, //Link to another object (visualised as datalist)
        IntegerArray = 10, //Input with multiple cols for the array size
        FloatArray = 11, //Input with multiple cols for the array size
        StringArray = 12, //Input with multiple cols for the array size
        ColorArray = 13, //Input with multiple cols for the array size
        TextArea = 14, //String appears as a text area input
    }

    public enum ParameterTypes
    {
        Variable = 0,
        Array = 1,
        Function = 2,
        JSON = 3,
        Object = 4,
    }

    public enum VariableTypes
    {
        Boolean = 0,
        Integer = 1,
        Float = 2,
        String = 3,
    }

    public enum Priorities
    {
        Required = 0,
        Optional = 1,
        System = -1, 
    }

    public class Parameter
    {
        public string Name { get; set; }
        public string PropertyName { get; set; }
        public string Description { get; set; }
        public int Priority { get; set; }
        public int ParameterType { get; set; }
        public int VariableType { get; set; }
        public int InputType { get; set; }
        public bool IsEditable { get; set; }
        public bool IsVisible { get; set; }
        public bool IsProperty = true;
        public bool IsPartOfObject { get; set; }
        public string ObjectName { get; set; }
    }
    public class BooleanParameter : Parameter
    {
        public bool? Value { get; set; }
        public bool? DefaultValue { get; set; }
        public new int InputType = (int)InputTypes.Boolean;
        public new int ParameterType = (int)ParameterTypes.Variable;
        public new int VariableType = (int)VariableTypes.Boolean;
    }

    public class IntegerParameter : Parameter
    {
        public int Value { get; set; }
        public int DefaultValue { get; set; }
        public int? Increment { get; set; }
        public new int InputType = (int)InputTypes.Integer;
        public new int ParameterType = (int)ParameterTypes.Variable;
        public new int VariableType = (int)VariableTypes.Integer;
    }

    public class NullableIntegerParameter : Parameter
    {
        public int? Value { get; set; }
        public int? DefaultValue { get; set; }
        public int? Increment { get; set; }
        public new int InputType = (int)InputTypes.Integer;
        public new int ParameterType = (int)ParameterTypes.Variable;
        public new int VariableType = (int)VariableTypes.Integer;
    }

    public class SliderParameter : Parameter
    {
        public float? Value { get; set; }
        public float? DefaultValue { get; set; }
        public float? MinValue { get; set; }
        public float? MaxValue { get; set; }
        public float? Increment { get; set; }
        public new int InputType = (int)InputTypes.Slider;
        public new int ParameterType = (int)ParameterTypes.Variable;
        public new int VariableType = (int)VariableTypes.Float;
    }

    public class FloatParameter : Parameter
    {
        public float? Value { get; set; }
        public float? DefaultValue { get; set; }
        public float? Increment { get; set; }
        public new int InputType = (int)InputTypes.Float;
        public new int ParameterType = (int)ParameterTypes.Variable;
        public new int VariableType = (int)VariableTypes.Float;
    }

    public class StringParameter : Parameter
    {
        public string Value { get; set; }
        public string DefaultValue { get; set; }
        public new int InputType = (int)InputTypes.String;
        public new int ParameterType = (int)ParameterTypes.Variable;
        public new int VariableType = (int)VariableTypes.String;
    }

    public class JSONParameter : Parameter
    {
        public string Value { get; set; }
        public string DefaultValue { get; set; }
        public new int InputType = (int)InputTypes.TextArea;
        public new int ParameterType = (int)ParameterTypes.JSON;
        public new int VariableType = (int)VariableTypes.String;
    }

    public class FunctionParameter : Parameter
    {
        public string Value { get; set; }
        public string DefaultValue { get; set; }
        public new int InputType = (int)InputTypes.TextArea;
        public new int ParameterType = (int)ParameterTypes.Function;
        public new int VariableType = (int)VariableTypes.String;
    }

    public class LinkParameter : Parameter
    {
        public int? Value { get; set; }
        public int? DefaultValue { get; set; }
        public string LinkedParameter { get; set; }
        public string ObjectType { get; set; }
        public new int InputType = (int)InputTypes.Link;
        public new int ParameterType = (int)ParameterTypes.Object;
        public new int VariableType = (int)VariableTypes.Integer;
    }

    public class ColorParameter : Parameter
    {
        public string Value { get; set; }
        public string DefaultValue { get; set; }
        public new int InputType = (int)InputTypes.Color;
        public new int ParameterType = (int)ParameterTypes.Variable;
        public new int VariableType = (int)VariableTypes.String;
    }

    public class DatalistParameter : Parameter
    {
        public string[] DefaultValues { get; set; }
        public string Value { get; set; }
        public string DefaultValue { get; set; }
        public int Length { get; set; }
        public new int InputType = (int)InputTypes.DataList;
        public new int ParameterType = (int)ParameterTypes.Variable;
        public new int VariableType = (int)VariableTypes.String;
    }

    public class IntegerArrayParameter : Parameter
    {
        public int[] Values { get; set; }
        public int[] DefaultValues { get; set; }
        public int Length { get; set; }
        public new int InputType = (int)InputTypes.IntegerArray;
        public new int ParameterType = (int)ParameterTypes.Array;
        public new int VariableType = (int)VariableTypes.Integer;
    }

    public class FloatArrayParameter : Parameter
    {
        public float[] Values { get; set; }
        public float[] DefaultValues { get; set; }
        public int Length { get; set; }
        public new int InputType = (int)InputTypes.FloatArray;
        public new int ParameterType = (int)ParameterTypes.Array;
        public new int VariableType = (int)VariableTypes.Float;
    }


    public class StringArrayParameter : Parameter
    {
        public string[] Values { get; set; }
        public string[] DefaultValues { get; set; }
        public int Length { get; set; }
        public new int InputType = (int)InputTypes.StringArray;
        public new int ParameterType = (int) ParameterTypes.Array;
        public new int VariableType = (int)VariableTypes.String;
    }

    public class ColorArrayParameter : Parameter
    {
        public string[] Values { get; set; }
        public string[] DefaultValues { get; set; }
        public int Length { get; set; }
        public new int InputType = (int)InputTypes.ColorArray;
        public new int ParameterType = (int)ParameterTypes.Array;
        public new int VariableType = (int)VariableTypes.String;
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



= new 
{
    Name = "",
    Description = "",
    Priority = (int)GDO.Utility.Priorities,
    VisualisationType = (int)GDO.Utility.VisualisationTypes,
    IsEditable = ,
    IsVisible = true,
};
    */
}


