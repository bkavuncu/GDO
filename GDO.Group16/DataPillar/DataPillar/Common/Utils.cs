using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataPillar.Common
{
    class Utils
    {

        public static string ExtractFileExtension(string filePath)
        {
            int indexAfterDot = filePath.LastIndexOf(".") + 1;
            if (indexAfterDot > filePath.Length)
            {
                indexAfterDot = filePath.Length;
            }
            return filePath.Substring(indexAfterDot);
        }

    }

    class TODO
    {
        public static dynamic UNIMPLEMENTED()
        {
            throw new Exception("Implement me already!");
        }
    }
}
