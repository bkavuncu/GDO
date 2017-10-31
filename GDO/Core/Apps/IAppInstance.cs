﻿using System.IO;
using Newtonsoft.Json;

namespace GDO.Core.Apps
{
    /// <summary>
    /// App Instance Interface
    /// </summary>
    public interface IAppInstance
    {
        int Id { get; set; }
        string AppName { get; set; }
        [JsonIgnore]
        App App { get; set; }

        IAppConfiguration GetConfiguration();
        bool SetConfiguration(IAppConfiguration config);
        IAppConfiguration GetDefaultConfiguration();

        //IHubContext HubContext { get; set; }
        void Init();
    }

    /// <summary>
    /// an interface which apps can implement to say that they accept loading content from a URI
    /// </summary>
    public interface IAppSupportsLoadingURI {
        /// <summary>
        /// Loads from URI.
        /// </summary>
        /// <param name="uri">The URI.</param>
        /// <param name="updateOnLoad">if set to <c>true</c> [update on load].</param>
        void LoadFromURI(string uri, bool updateOnLoad = false);
    }

    /// <summary>
    /// an interface which apps can implement to say that they accept loading content via POST
    /// </summary>
    public interface IAppSupportsPostedContent {
        /// <summary>
        /// Loads from stream. (what is in the stream is app specific)
        /// </summary>
        /// <param name="data">The data.</param>
        void LoadFromStream(Stream data);
    }
}