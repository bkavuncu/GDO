gdo.net.app["Maps"].view = new ol.View({
    center: [-9101767, 2822912],
    zoom: 11
});
gdo.net.app["Maps"].map = new ol.Map({
    controls: [
      new ol.control.FullScreen()
    ],
    layers: [
      new ol.layer.Tile({
          source: new ol.source.BingMaps({
              key: 'Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3',
              imagerySet: 'Aerial'
          })
      })
    ],
    renderer: exampleNS.getRendererFromQueryString(),
    target: 'map',
    view: gdo.net.app["Maps"].view
});
