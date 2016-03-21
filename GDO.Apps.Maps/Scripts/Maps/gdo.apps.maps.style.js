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

var st;

gdo.net.app["Maps"].addStyle = function (instanceId, styleId, deserializedStyle) {
    st = deserializedStyle;
    if (gdo.net.app["Maps"].index["style"] <= deserializedStyle.Id) {
        gdo.net.app["Maps"].index["style"] = deserializedStyle.Id;
    }
    gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Adding Style :' + deserializedStyle.Id);
    var style;
    var properties;
    var options = {};
    switch (deserializedStyle.Type) {
        case gdo.net.app["Maps"].STYLE_TYPES_ENUM.Circle:
            properties = [
                ["opacity", deserializedStyle.Opacity],
                ["rotateWithView", deserializedStyle.RotateWithView],
                ["rotation", deserializedStyle.Rotation],
                ["scale", deserializedStyle.Scale],
                ["snapToPixel", deserializedStyle.SnapToPixel],
                ["fill", gdo.net.instance[instanceId].styles[deserializedStyle.FillStyleId]],
                ["radius", deserializedStyle.Radius],
                ["stroke", gdo.net.instance[instanceId].styles[deserializedStyle.StrokeStyleId]]
            ];
            options = gdo.net.app["Maps"].optionConstructor(properties);
            style = new ol.style.Circle(options);
            break;
        case gdo.net.app["Maps"].STYLE_TYPES_ENUM.Fill:
            properties = [
                ["color", deserializedStyle.Color]
            ];
            options = gdo.net.app["Maps"].optionConstructor(properties);
            style = new ol.style.Fill(options);
            break;
        case gdo.net.app["Maps"].STYLE_TYPES_ENUM.Icon:
            properties = [
                ["opacity", deserializedStyle.Opacity],
                ["rotateWithView", deserializedStyle.RotateWithView],
                ["rotation", deserializedStyle.Rotation],
                ["scale", deserializedStyle.Scale],
                ["snapToPixel", deserializedStyle.SnapToPixel],
                ["anchor", deserializedStyle.Anchor],
                ["anchorOrigin", deserializedStyle.AnchorOrigin],
                ["crossOrigin", deserializedStyle.CrossOrigin],
                ["offset", deserializedStyle.Offset],
                ["offsetOrigin", deserializedStyle.OffsetOrigin],
                ["size", [deserializedStyle.Width, deserializedStyle.Height]],
                ["imgSize", [deserializedStyle.ImageWidth, deserializedStyle.ImageHeight]],
                ["src", deserializedStyle.ImageSource]
            ];
            options = gdo.net.app["Maps"].optionConstructor(properties);
            style = new ol.style.Icon(options);
            break;
        case gdo.net.app["Maps"].STYLE_TYPES_ENUM.RegularShape:
            properties = [
                ["fill", gdo.net.instance[instanceId].styles[deserializedStyle.FillStyleId]],
                ["points", deserializedStyle.Points],
                ["radius", deserializedStyle.Radius],
                ["radius1", deserializedStyle.Radius1],
                ["radius2", deserializedStyle.Radius2],
                ["angle", deserializedStyle.Angle],
                ["stroke", gdo.net.instance[instanceId].styles[deserializedStyle.StrokeStyleId]],
                ["opacity", deserializedStyle.Opacity],
                ["rotateWithView", deserializedStyle.RotateWithView],
                ["rotation", deserializedStyle.Rotation],
                ["scale", deserializedStyle.Scale],
                ["snapToPixel", deserializedStyle.SnapToPixel],
            ];
            options = gdo.net.app["Maps"].optionConstructor(properties);
            style = new ol.style.RegularShape(options);
            break;
        case gdo.net.app["Maps"].STYLE_TYPES_ENUM.Stroke:
            properties = [
                ["color", deserializedStyle.Color],
                ["lineCap", deserializedStyle.LineCap],
                ["lineJoin", deserializedStyle.LineJoin],
                ["lineDash", deserializedStyle.LineDash],
                ["miterLimit", deserializedStyle.MiterLimit],
                ["width", deserializedStyle.Width]
            ];
            options = gdo.net.app["Maps"].optionConstructor(properties);
            style = new ol.style.Stroke(options);
            break;
        case gdo.net.app["Maps"].STYLE_TYPES_ENUM.Style:
            // TODO
            break;
        case gdo.net.app["Maps"].STYLE_TYPES_ENUM.Text:
            properties = [
                ["font", deserializedStyle.Font],
                ["offsetX", deserializedStyle.OffsetX],
                ["offsetY", deserializedStyle.OffSetY],
                ["scale", deserializedStyle.Scale],
                ["rotation", deserializedStyle.Rotation],
                ["text", deserializedStyle.Content],
                ["textAlign", deserializedStyle.TextAlign],
                ["textBaseline", deserializedStyle.TextBaseLine],
                ["fill", gdo.net.instance[instanceId].styles[deserializedStyle.FillStyleId]],
                ["stroke", gdo.net.instance[instanceId].styles[deserializedStyle.StrokeStyleId]]
            ];
            options = gdo.net.app["Maps"].optionConstructor(properties);
            style = new ol.style.Text(options);
            break;
        default:
            gdo.consoleOut('.Maps', 5, 'Instance ' + instanceId + ': Invalid Style Type:' + deserializedStyle.Type + ' for Style '  + deserializedStyle.Id);
            break;
    }
    gdo.net.instance[instanceId].styles[styleId] = style;
    style.properties = deserializedStyle;
    style.properties.isInitialized = true;
    gdo.net.app["Maps"].drawListTables(instanceId);
}

gdo.net.app["Maps"].updateStyle = function (instanceId, styleId, deserializedStyle) {
    gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Updating Style :' + deserializedStyle.Id);
    var style = gdo.net.instance[instanceId].styles[styleId];
    switch (deserializedStyle.Type) {
        case gdo.net.app["Maps"].STYLE_TYPES_ENUM.Circle:
            style.setOpacity(deserializedStyle.Opacity);
            style.setRotation(deserializedStyle.Rotation);
            style.setScale(deserializedStyle.Scale);
            break;
        case gdo.net.app["Maps"].STYLE_TYPES_ENUM.Fill:
            style.setColor(deserializedStyle.Color);
            break;
        case gdo.net.app["Maps"].STYLE_TYPES_ENUM.Icon:
            style.setOpacity(deserializedStyle.Opacity);
            style.setRotation(deserializedStyle.Rotation);
            style.setScale(deserializedStyle.Scale);
            break;
        case gdo.net.app["Maps"].STYLE_TYPES_ENUM.RegularShape:
            style.setOpacity(deserializedStyle.Opacity);
            style.setRotation(deserializedStyle.Rotation);
            style.setScale(deserializedStyle.Scale);
            break;
        case gdo.net.app["Maps"].STYLE_TYPES_ENUM.Stroke:
            style.setColor(deserializedStyle.Color);
            style.setLineCap(deserializedStyle.LineCap);
            style.setLineDash(deserializedStyle.LineDash);
            style.setLineJoin(deserializedStyle.LineJoin);
            style.setMiterLimit(deserializedStyle.MiterLimit);
            style.setWidth(deserializedStyle.Width);
            break;
        case gdo.net.app["Maps"].STYLE_TYPES_ENUM.Style:
            // TODO
            break;
        case gdo.net.app["Maps"].STYLE_TYPES_ENUM.Text:
            style.setFont(deserializedStyle.Font);
            style.setScale(deserializedStyle.Scale);
            style.setRotation(deserializedStyle.Rotation);
            style.setText(deserializedStyle.Content);
            style.setTextAlign(deserializedStyle.TextAlign);
            style.setTextBaseline(deserializedStyle.TextBaseLine);
            style.setFill(gdo.net.instance[instanceId].styles[deserializedStyle.FillStyleId]);
            style.setStroke(gdo.net.instance[instanceId].styles[deserializedStyle.StrokeStyleId]);
            break;
        default:
            gdo.consoleOut('.Maps', 5, 'Instance ' + instanceId + ': Invalid Style Type:' + deserializedStyle.Type + ' for Style ' + deserializedStyle.Id);
            break;
    }
    gdo.net.app["Maps"].drawListTables(instanceId);
}

gdo.net.app["Maps"].requestStyle = function (instanceId, styleId) {
    gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Requesting style: ' + styleId);
    gdo.net.app["Maps"].server.requestStyle(instanceId, styleId);
}

gdo.net.app["Maps"].uploadStyle = function (instanceId, styleId, isNew) {
    gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Uploading Style: ' + styleId);
    var style = gdo.net.instance[instanceId].style[styleId];
    var properties = style.properties;;
    if (isNew) {
        gdo.net.app["Maps"].server.addStyle(instanceId, parseInt(properties.Type), JSON.stringify(properties));
    } else {
        gdo.net.app["Maps"].server.updateStyle(instanceId, styleId, parseInt(properties.Type), JSON.stringify(properties));
    }
}

gdo.net.app["Maps"].removeStyle = function (instanceId, styleId) {
    gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Removing Style: ' + styleId);
    gdo.net.instance[instanceId].styles[styleId] = null;
    if (gdo.net.app["Maps"].selected["style"] == styleId) {
        gdo.net.app["Maps"].selected["style"] = -1;
    }
    gdo.net.app["Maps"].drawListTables(instanceId);
}