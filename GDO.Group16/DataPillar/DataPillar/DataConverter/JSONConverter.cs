using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Newtonsoft.Json;

using DataPillar.Common;

namespace DataPillar.DataConverter
{
     


    class JSONConverter
    {


        /// <summary>
        /// dataStream must be a JSON string. 
        /// The undelrying JavaScript object must be of the format:
        /// {
        ///   "ColumnNames": [String],
        ///   "DataRows": [[Entry]] 
        /// }
        /// where Entry :: JavaScript primitive :: { string, number, boolean }
        /// If Entry has type JavaScript object or JavaSript array, the value is 
        /// converted to a string and treated as such (for now).
        /// </summary>
        public static PlainDataset convertStream(string jsonString)
        {
            JsonReader r

            return TODO.UNIMPLEMENTED();
        }
    }

}
