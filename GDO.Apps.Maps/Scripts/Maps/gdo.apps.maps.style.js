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
                ["fill", gdo.net.instance[instanceId].styles[deserializedStyle.Fill.Id]],
                ["radius", deserializedStyle.Radius],
                ["stroke", gdo.net.instance[instanceId].styles[deserializedStyle.Stroke.Id]]
            ];
            options = gdo.net.app["Maps"].optionConstructor(properties);
            style = new ol.Style.Circle(options);
            break;
        case gdo.net.app["Maps"].STYLE_TYPES_ENUM.Fill:
            properties = [
                ["color", deserializedStyle.Color]
            ];
            options = gdo.net.app["Maps"].optionConstructor(properties);
            style = new ol.Style.Fill(options);
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
            style = new ol.Style.Icon(options);
            break;
        case gdo.net.app["Maps"].STYLE_TYPES_ENUM.RegularShape:
            properties = [
                ["fill", gdo.net.instance[instanceId].styles[deserializedStyle.Fill.Id]],
                ["points", deserializedStyle.Points],
                ["radius", deserializedStyle.Radius],
                ["radius1", deserializedStyle.Radius1],
                ["radius2", deserializedStyle.Radius2],
                ["angle", deserializedStyle.Angle],
                ["stroke", gdo.net.instance[instanceId].styles[deserializedStyle.Stroke.Id]],
                ["opacity", deserializedStyle.Opacity],
                ["rotateWithView", deserializedStyle.RotateWithView],
                ["rotation", deserializedStyle.Rotation],
                ["scale", deserializedStyle.Scale],
                ["snapToPixel", deserializedStyle.SnapToPixel],
            ];
            options = gdo.net.app["Maps"].optionConstructor(properties);
            style = new ol.Style.RegularShape(options);
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
            style = new ol.Style.Stroke(options);
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
                ["fill", gdo.net.instance[instanceId].styles[deserializedStyle.Fill.Id]],
                ["stroke", gdo.net.instance[instanceId].styles[deserializedStyle.Stroke.Id]]
            ];
            options = gdo.net.app["Maps"].optionConstructor(properties);
            style = new ol.Style.Text(options);
            break;
        default:
            gdo.consoleOut('.MAPS', 5, 'Instance ' + instanceId + ': Invalid Style Type:' + deserializedStyle.Type + ' for Style '  + deserializedStyle.Id);
            break;
    }
    gdo.net.instance[instanceId].styles[styleId] = style;
    style.id = deserializedStyle.Id;
    style.name = deserializedStyle.Name;
    style.type = deserializedStyle.Type;
    style.properties = deserializedStyle;
}

gdo.net.app["Maps"].updateStyle = function (instanceId, styleId, deserializedStyle) {
    gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Updating Style :' + deserializedStyle.Id);
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
            style.setFill(gdo.net.instance[instanceId].styles[deserializedStyle.Fill.Id]);
            style.setStroke(gdo.net.instance[instanceId].styles[deserializedStyle.Stroke.Id]);
            break;
        default:
            gdo.consoleOut('.MAPS', 5, 'Instance ' + instanceId + ': Invalid Style Type:' + deserializedStyle.Type + ' for Style ' + deserializedStyle.Id);
            break;
    }
}

gdo.net.app["Maps"].requestStyle = function (instanceId, styleId) {
    gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Requesting style: ' + styleId);
    gdo.net.app["Maps"].server.requestStyle(instanceId, styleId);
}

gdo.net.app["Maps"].uploadStyle = function (instanceId, styleId, isNew) {
    gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Uploading Style: ' + styleId);
    var style = gdo.net.instance[instanceId].style[styleId];
    var properties = style.properties;
    var type = gdo.net.instance[instanceId].style[styleId].type;
    if (isNew) {
        styleId = -1;
    }
    switch (type) {
        case gdo.net.app["Maps"].STYLE_TYPES_ENUM.Circle:
            gdo.net.app["Maps"].server.updateCircleStyle(instanceId, styleId, properties.Name, properties.FillId, properties.Opacity, properties.RotateWithView,
                properties.Rotation, properties.Scale, properties.Radius, properties.SnapToPixel, properties.StrokeId);
            break;
        case gdo.net.app["Maps"].STYLE_TYPES_ENUM.Fill:
            gdo.net.app["Maps"].server.updateFillStyle(instanceId, styleId, properties.Name, properties.Color);
            break;
        case gdo.net.app["Maps"].STYLE_TYPES_ENUM.Icon:
            gdo.net.app["Maps"].server.updateIconStyle(instanceId, styleId, properties.Name, properties.CrossOrigin, properties.Anchor, properties.AnchorOrigin,
                properties.Offset, properties.OffsetOrigin, properties.Opacity, properties.Scale, properties.SnapToPixel, properties.RotateWithView,
                properties.Rotation, properties.Width, properties.Height, properties.ImageWidth, properties.ImageHeight, properties.ImageSource);
            break;
        case gdo.net.app["Maps"].STYLE_TYPES_ENUM.RegularShape:
            gdo.net.app["Maps"].server.updateRegularShapeStyle(instanceId, styleId, properties.Name, properties.FillId, properties.Opacity, properties.RotateWithView,
                properties.Rotation, properties.Scale, properties.Points, properties.Radius, properties.Radius1, properties.Radius2, properties.Angle,
                properties.SnapToPixel, properties.StrokeId);
            break;
        case gdo.net.app["Maps"].STYLE_TYPES_ENUM.Stroke:
            gdo.net.app["Maps"].server.updateStrokeStyle(instanceId, styleId, properties.Name, properties.Color, properties.LineCap, properties.LineJoin,
                properties.LineDash,properties.MiterLimit, properties.Width);
            break;
        case gdo.net.app["Maps"].STYLE_TYPES_ENUM.Style:
            //gdo.net.app["Maps"].server.updateStyle(instanceId, styleId, properties.Name, );
            break;
        case gdo.net.app["Maps"].STYLE_TYPES_ENUM.Text:
            gdo.net.app["Maps"].server.updateTextStyle(instanceId, styleId, properties.Name, properties.Font, properties.OffsetX, properties.OffsetY,
                properties.Scale, properties.Rotation, properties.Content, properties.TextAlign, properties.TextBaseLine, properties.FillId, properties.StrokeId);
            break;
        default:
            break;
    }
}

gdo.net.app["Maps"].removeStyle = function (instanceId, styleId) {
    gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Removing Style: ' + styleId);
    gdo.net.instance[instanceId].styles[styleId] = null;
}