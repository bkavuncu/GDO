gdo.net.app["Maps"].STYLE_TYPES_ENUM = {
    Circle: 1,
    Fill: 2,
    Icon: 3,
    Image: 4,
    RegularShape: 5,
    Stroke: 6,
    Style: 7,
    Text: 8
};

gdo.net.app["Maps"].addStyle = function (instanceId, styleId, deserializedStyle) {
    gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Adding Style :' + deserializedStyle.Id);
    var style;
    switch (deserializedStyle.Type) {
        case gdo.net.app["Maps"].STYLE_TYPES_ENUM.Circle:
            style = new ol.Style.Circle();
            break;
        case gdo.net.app["Maps"].STYLE_TYPES_ENUM.Fill:
            style = new ol.Style.Fill();
            break;
        case gdo.net.app["Maps"].STYLE_TYPES_ENUM.Icon:
            style = new ol.Style.Icon();
            break;
        case gdo.net.app["Maps"].STYLE_TYPES_ENUM.RegularShape:
            style = new ol.Style.RegularShape();
            break;
        case gdo.net.app["Maps"].STYLE_TYPES_ENUM.Stroke:
            style = new ol.Style.Stroke();
            break;
        case gdo.net.app["Maps"].STYLE_TYPES_ENUM.Style:
            style = new ol.Style.Style();
            break;
        case gdo.net.app["Maps"].STYLE_TYPES_ENUM.Text:
            style = new ol.Style.Text();
            break;
        default:
            break;
    }
    gdo.net.instance[instanceId].styles[styleId] = style;
    gdo.net.app["Maps"].editstyle(instanceId, styleId, deserializedStyle);
}

gdo.net.app["Maps"].editStyle = function (instanceId, styleId, deserializedStyle) {
    gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Editing Style :' + deserializedStyle.Id);
    var style = gdo.net.instance[instanceId].styles[styleId];
    switch (deserializedStyle.Type) {
        case gdo.net.app["Maps"].STYLE_TYPES_ENUM.Circle:
            style.setFill(gdo.net.instance[instanceId].styles[deserializedStyle.Fill.Id]);
            style.setOpacity(deserializedStyle.Opacity);
            style.setRotateWithView(deserializedStyle.RotateWithView);
            style.setRotation(deserializedStyle.Rotation);
            style.setScale(deserializedStyle.Scale);
            style.setRadius(deserializedStyle.Radius);
            style.setSnapToPixel(deserializedStyle.SnapToPixel);
            style.setStroke(gdo.net.instance[instanceId].styles[deserializedStyle.Stroke.Id]);
            break;
        case gdo.net.app["Maps"].STYLE_TYPES_ENUM.Fill:
            style.setFill(deserializedStyle.Color);
            break;
        case gdo.net.app["Maps"].STYLE_TYPES_ENUM.Icon:
            style.setOpacity(deserializedStyle.Opacity);
            style.setRotateWithView(deserializedStyle.RotateWithView);
            style.setRotation(deserializedStyle.Rotation);
            style.setScale(deserializedStyle.Scale);
            break;
        case gdo.net.app["Maps"].STYLE_TYPES_ENUM.RegularShape:

            break;
        case gdo.net.app["Maps"].STYLE_TYPES_ENUM.Stroke:

            break;
        case gdo.net.app["Maps"].STYLE_TYPES_ENUM.Style:

            break;
        case gdo.net.app["Maps"].STYLE_TYPES_ENUM.Text:

            break;
        default:
            break;
    }
}

gdo.net.app["Maps"].requestStyle = function (instanceId) {

}

gdo.net.app["Maps"].setStyle = function (instanceId) {

}

gdo.net.app["Maps"].removeStyle = function (instanceId) {

}