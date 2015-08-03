parent.gdo.net.app["Maps"].view = new parent.gdo.net.app["Maps"].ol.View({
    center: [-9101767, 2822912],
    zoom: 11
});
parent.gdo.net.app["Maps"].map = new parent.gdo.net.app["Maps"].ol.Map({
    controls: [
      new parent.gdo.net.app["Maps"].ol.control.FullScreen()
    ],
    layers: [
      new parent.gdo.net.app["Maps"].ol.layer.Tile({
          source: new parent.gdo.net.app["Maps"].ol.source.BingMaps({
              key: 'Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3',
              imagerySet: 'Aerial'
          })
      })
    ],
    target: 'map',
    view: parent.gdo.net.app["Maps"].view
});
