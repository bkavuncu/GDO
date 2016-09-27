using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Utility;
using Newtonsoft.Json;

namespace GDO.Apps.Maps.Core
{
    public class View : Base
    {
        public FloatArrayParameter Center { get; set; }
        public FloatArrayParameter TopLeft { get; set; }
        public FloatArrayParameter BottomRight { get; set; }
        public BooleanParameter EnableRotation { get; set; }
        public FloatArrayParameter Extent { get; set; }
        public StringParameter Projection { get; set; }
        public FloatParameter Resolution { get; set; }
        public FloatParameter Rotation { get; set; }
        public IntegerParameter Width { get; set; }
        public IntegerParameter Height { get; set; }

        public View() : base()
        {
            ClassName.Value = this.GetType().Name;
            ObjectType.Value = "ol.View";
            Description.Value = "An View object represents a simple 2D view of the map.This is the object to act upon to change the center, resolution, and rotation of the map.";

            Center = new FloatArrayParameter
            {
                Name = "Center",
                PropertyName = "center",
                Description = "The initial center for the view. The coordinate system for the center is specified with the projection option. Default is undefined, and layer sources will not be fetched if this is not set.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = true,
                Length = 2,
                DefaultValues = new float?[2] { 0, 0 },
                Values = new float?[2],
            };

            TopLeft = new FloatArrayParameter
            {
                Name = "Top Left",
                PropertyName = "topLeft",
                Description = "Coordinate of the top left of the view, required to calculate local centers on the nodes",
                Priority = (int)GDO.Utility.Priorities.System,
                IsEditable = true,
                IsVisible = true,
                Length = 2,
                DefaultValues = new float?[2] { 0, 0 },
                Values = new float?[2],
            };

            BottomRight = new FloatArrayParameter
            {
                Name = "Bottom Right",
                PropertyName = "bottomRight",
                Description = "Coordinate of the bottom right of the view, required to calculate local centers on the nodes",
                Priority = (int)GDO.Utility.Priorities.System,
                IsEditable = true,
                IsVisible = true,
                Length = 2,
                DefaultValues = new float?[2] { 0, 0 },
                Values = new float?[2],
            };

            EnableRotation = new BooleanParameter
            {
                Name = "Enable Rotation",
                PropertyName = "enableRotation",
                Description = "Enable rotation. Default is true. If false a rotation constraint that always sets the rotation to zero is used. The constrainRotation option has no effect if enableRotation is false.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true,
                IsNull = false,
                DefaultValue = false,
                Value = false,
            };

            Extent = new FloatArrayParameter
            {
                Name = "Extent",
                PropertyName = "extent",
                Description = "The bounding extent for layer rendering. The layer will not be rendered outside of this extent: [MinX, MinY, MaxX, MaxY]",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true,
                Length = 2,
                DefaultValues = new float?[4],
                Values = new float?[4],
            };

            Projection = new StringParameter
            {
                Name = "Projection",
                PropertyName = "projection",
                Description = "The projection. Default is EPSG:3857 (Spherical Mercator).",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = false,
                IsVisible = true,
            };

            Resolution = new FloatParameter
            {
                Name = "Resolution",
                PropertyName = "resolution",
                Description = "The initial resolution for the view. The units are projection units per pixel (e.g. meters per pixel). An alternative to setting this is to set zoom.",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = true,
                DefaultValue = (float?) 77,
            };

            Rotation = new FloatParameter
            {
                Name = "Rotation",
                PropertyName = "resolution",
                Description = "The initial rotation for the view in radians (positive rotation clockwise).",
                Priority = (int)GDO.Utility.Priorities.Optional,
                IsEditable = true,
                IsVisible = true,
                IsNull = false,
                DefaultValue = (float?)0,
                Value = (float?)0,
            };

            Width = new IntegerParameter
            {
                Name = "Width",
                PropertyName = "width",
                Description = "Control Width",
                Priority = (int)GDO.Utility.Priorities.System,
                IsEditable = true,
                IsVisible = true,
                IsNull = false,
                DefaultValue = (int?)0,
                Value = (int?)100,
            };

            Height = new IntegerParameter
            {
                Name = "Height",
                PropertyName = "heigth",
                Description = "Control Height",
                Priority = (int)GDO.Utility.Priorities.System,
                IsEditable = true,
                IsVisible = true,
                IsNull = false,
                DefaultValue = (int?)0,
                Value = (int?)100,
            };
        }
    }
}