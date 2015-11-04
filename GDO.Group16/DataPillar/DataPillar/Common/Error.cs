using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataPillar.Common
{
    enum ErrorType
    {
        FileNotFound,
        MalformedLine,
        EmptyStream, 
        StreamMalformed,
        ApplicationException,
        ApplicationTimeout,
        Other
    }

    class Error
    {
        public ErrorType Type;
        public string Message;
        public DateTime TimeStamp;
        
        private Error(ErrorType type, string message)
        {
            Type = type;
            Message = message;
            TimeStamp = DateTime.Now;
        }

        public static Error Make(ErrorType type, string message)
        {
            return new Error(type, message);
        }

        public static Error MakeSimple(string message)
        {
            return new Error(ErrorType.Other, message);
        }

        public override string ToString()
        {
            StringBuilder builder = new StringBuilder();
            builder.AppendFormat("ERROR[%s] => %s: %s", TimeStamp.ToString(), Type.ToString(), Message);
            return builder.ToString();
        }
    }

    class ErrorLog
    {
        private ErrorLog() { }

        private static List<Error> ErrorCache = new List<Error>();

        private static string GetErrorTypeDescription(ErrorType errorType)
        {
            return "TODO: write helpful description for this error type";
        }
        
        public static void LogError(ErrorType errorType, string errorDescription)
        {
            ErrorCache.Add(Error.Make(errorType, errorDescription));
        }

        public static void LogErrorMessage(string errorMessage)
        {
            ErrorCache.Add(Error.MakeSimple(errorMessage));
        }

        public static Error[] GetAllErrors()
        {
            return ErrorCache.ToArray();
        }

        public static string ReadAllErrors()
        {
            StringBuilder builder = new StringBuilder();
            ErrorCache.ForEach(error => builder.AppendFormat("%s\n\t%s", error, GetErrorTypeDescription(error.Type)));
            return builder.ToString();
        }

        public static void PrintAllErrors()
        {
            System.Console.WriteLine(ReadAllErrors());
        }

        public static Error[] ClearAllErrors()
        {
            Error[] currentErrors = GetAllErrors();
            ErrorCache.Clear();
            return currentErrors;
        }
    }
}
