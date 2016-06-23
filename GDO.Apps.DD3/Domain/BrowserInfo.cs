namespace GDO.Apps.DD3.Domain {
    public class BrowserInfo
    {
        public BrowserInfo(string connectionId, string browserNum, string peerId, string col, string row, string height, string width)
        {
            this.connectionId = connectionId;
            this.browserNum = browserNum;
            this.peerId = peerId;
            this.col = col;
            this.row = row;
            this.height = height;
            this.width = width;
        }

        public string connectionId { get; set; }
        public string browserNum { get; set; }
        public string peerId { get; set; }
        public string col { get; set; }
        public string row { get; set; }
        public string height { get; set; }
        public string width { get; set; }
    }
}