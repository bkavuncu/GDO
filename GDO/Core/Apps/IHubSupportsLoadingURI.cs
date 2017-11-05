namespace GDO.Core.Apps {
    /// <summary>
    /// an interface which App Hubs can implement to say that they accept loading content from a URI
    /// </summary>
    public interface IHubSupportsLoadingURI {
        /// <summary>
        /// Loads from URI.
        /// </summary>
        /// <param name="instanceId">id of the app instance</param>
        /// <param name="uri">The URI.</param>
        /// <param name="liveLink">if set to <c>true</c> [update on load].</param>
        /// <returns>success or errors</returns>
        string DownloadLoadFromURI(int instanceId, string uri, bool liveLink = false);
    }
}