using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataPillar.DataAugmenter
{

    enum FieldType
    {
        Unknown,
        Text,    
        Integral,
        Floating,
        DateTime,
        Enum,
        Boolean,
        GPSCoords,
        URL
    }

}
