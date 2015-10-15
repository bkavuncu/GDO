﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Apps.Maps.Core.Styles;

namespace GDO.Apps.Maps.Core
{
    public enum StyleTypes
    {
        None = -1,
        Base = 0,
        Circle = 1,
        Fill = 2,
        Icon = 3, 
        Image = 4,
        RegularShape = 5,
        Stroke = 6,
        Style = 7,
        Text = 8
    };

    public class Style : Base
    {
        public Style()
        {

        }
        public void Init(int id, string name, int type)
        {
            Id = id;
            Name = name;
            Type = type;

            Prepare();
        }

        new public void Prepare()
        {
            ClassName = this.GetType().Name;
            AddtoEditables(() => Id);
            AddtoEditables(() => Name);
            AddtoEditables(() => Type);
        }

        public void Modify(int id, string name, int type)
        {
            Id = id;
            Name = name;
            Type = type;
        }
    }
}