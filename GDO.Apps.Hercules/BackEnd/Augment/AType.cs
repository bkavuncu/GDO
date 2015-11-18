using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GDO.Apps.Hercules.BackEnd.Augment
{

    // What ((A)ugmented)Type(s) are supported by our awesome app?
    public enum AType
    {
        Text,      // C# string        | JS String
        Integral,  // C# double        | JS Number
        Floating,  // C# double        | JS Number
        DateTime,  // C# long          | JS Number 
        GPSCoords, // C# GeoCoordinate | JS Array[2]:number [longitude, latitude]
        URL,       // C# Uri           | JS Array[3]:string [protocol, domain, file]
        Boolean,   // C# bool          | JS Boolean
        Unknown    // C# null          | JS Null
    }

}
