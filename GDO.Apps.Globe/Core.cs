using Newtonsoft.Json;

namespace GDO.Apps.Globe
{

    public class Coordinate
    {
        [JsonProperty(PropertyName = "longitude")]
        public double Longitude { get; set; }
        [JsonProperty(PropertyName = "latitude")]
        public double Latitude { get; set; }
    }

    public class Marker
    {
        [JsonProperty(PropertyName = "id")]
        public string Id { get; set; }
        [JsonProperty(PropertyName = "coordinate")]
        public Coordinate Coordinate { get; set; }
        [JsonProperty(PropertyName = "htmlLabel")]
        public string HtmlLabel{ get; set; }
        [JsonProperty(PropertyName = "isVisible")]
        public bool IsVisible { get; set; }
    }
}