﻿using System;
using System.Collections.Generic;
using System.EnterpriseServices;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GDO.Core
{
    public interface IModule
    {
        string Name { get; set; }
        void Init();
    }
}