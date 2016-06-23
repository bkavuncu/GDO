namespace GDO.Apps.DD3.Domain {
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