using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GDO.Apps.Hercules.BackEnd.DB
{

    class JsStats
    {
        public dynamic min;
        public dynamic max;
        public dynamic mean;
        public dynamic median;
        public dynamic variance;
        public dynamic stdDev;
        public bool isEnum;
    }


    class JsField
    {
        public string name;
        public string description;
        public string type;
        public string origin;
        public bool disabled;
        public JsStats stats;
    }


    class JsMiniset
    {
        public string name;
        public string description;
        public int id;
        public int nrows;
        public string sourceType;
        public string sourceOrigin;
        public bool disabled;
        public JsField[] fields;
    }


    class JsDataset
    {
        public JsMiniset schema;
        public dynamic[][] rows;
    }




}
