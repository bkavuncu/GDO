namespace GDO.Apps.DD3.Domain {

    /*This class contains the info broadcasted to one browser by the server
     * Number of the browser
     * Peerjs index
     * Column Index
     * Row Index
     */
    public class BrowserBroadcastInfo
    {
        public BrowserBroadcastInfo(string browserNum, string peerId, string col, string row)
        {
            this.browserNum = browserNum;
            this.peerId = peerId;
            this.col = col;
            this.row = row;
        }

        public string browserNum { get; set; }
        public string peerId { get; set; }
        public string col { get; set; }
        public string row { get; set; }
    }
}