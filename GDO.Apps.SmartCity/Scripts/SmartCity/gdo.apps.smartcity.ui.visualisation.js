gdo.net.app["SmartCity"].selectedLayer = -1;
gdo.net.app["SmartCity"].selectedProperty = -1;
gdo.net.app["SmartCity"].HeaderHeight = 61;
gdo.net.app["SmartCity"].tableHeight = 500;
gdo.net.app["SmartCity"].StatusHeight = 49;

gdo.net.app["SmartCity"].drawHeaderTable = function(instanceId) {
    //TODO
}

gdo.net.app["SmartCity"].drawMapTable = function (instanceId) {
    gdo.consoleOut('.SmartCity', 1, 'Instance ' + instanceId + ': Drawing Map Table');
    gdo.net.app["SmartCity"].drawHeaderTable();
    gdo.net.app["SmartCity"].drawInstanceTable(instanceId);
    gdo.net.app["SmartCity"].drawLayerTable(instanceId, gdo.net.app["SmartCity"].selectedLayer);
    gdo.net.app["SmartCity"].drawPropertyTable(instanceId, gdo.net.app["SmartCity"].selectedLayer, gdo.net.app["SmartCity"].selectedProperty);
    gdo.net.app["SmartCity"].drawEditTable();
    gdo.net.app["SmartCity"].drawStatusTable();
}

gdo.net.app["SmartCity"].drawEmptyInstanceTable = function() {
    $("#instances").empty();
}

gdo.net.app["SmartCity"].drawInstanceTable = function (instanceId) {
    gdo.consoleOut('.SmartCity', 1, 'Instance ' + instanceId + ': Drawing Instance Table');

    gdo.net.app["SmartCity"].drawEmptyInstanceTable();

    var j = 0;
    for (var i = 0; i < gdo.net.instance.length; i++) {
        if (gdo.net.instance[i].appName == "SmartCity") {
            gdo.consoleOut('.SmartCity', 1, 'Instance ' + instanceId + ': Drawing Instance ' + i);

            $("#instances").append("<div id='instance_"+i+"' class='row instance' instance='" + i + "'>" + i + "</div>");

            $("#instance_" + i)
                .css("align","top")
                .css("height", "5vh")
                .click(function () {
                gdo.net.app["SmartCity"].selectedInstance = gdo.net.instance[$(this).attr('instance')].id;
                gdo.net.app["SmartCity"].switchToInstance(gdo.net.app["SmartCity"].selectedInstance);
            });
        }
    }
}

gdo.net.app["SmartCity"].drawEmptyLayerTable = function() {
    $("#layers")
    .empty();
}

gdo.net.app["SmartCity"].drawLayerTable = function (instanceId) {
    gdo.consoleOut('.SmartCity', 1, 'Instance ' + instanceId + ': Drawing Layer Table');

    gdo.net.app["SmartCity"].drawEmptyLayerTable();

    var j = 1;

    //Layers
    for (var i in gdo.net.instance[instanceId].layers) {
        if (gdo.net.instance[instanceId].layers.hasOwnProperty(i) && gdo.net.instance[instanceId].layers[i] != null && typeof gdo.net.instance[instanceId].layers[i] != "undefined") {
            gdo.consoleOut('.SmartCity', 1, 'Instance ' + instanceId + ': Drawing Layer ' + i);

            $("#layers").append("<div id='layer_" + i + "' class='row layer' layer='" + i + "'></div>");

            $("#layer_" + i)
                .css("align", "top")
                .css("height", "5vh")
                .append("<div id='layer_" + i + "_content' class='table layer' layer='" + i + "'>" +
                        "<div id='layer_" + i + "_id' class='col-md-2 layer' layer='" + i + "'> <b>" + gdo.net.instance[instanceId].layers[i].id + "</b></div>" +
                        "<div id='layer_" + i + "_name' class='col-md-5 layer' layer='" + i + "'> <b>" + gdo.net.instance[instanceId].layers[i].name + "</b></div>" +
                        "<div id='layer_" + i + "_visible' class='col-md-1 layer' layer='" + i + "'>  <img src='/Web/SmartCity/Images/visible.png'> </div>" +
                        "<div id='layer_" + i + "_animate' class='col-md-1 layer' layer='" + i + "'> <img src='/Web/SmartCity/Images/animate.png'></div>" +
                        "<div id='layer_" + i + "_up' class='col-md-1 layer' layer='" + i + "'> <img src='/Web/SmartCity/Images/up.png'> </div>" +
                        "<div id='layer_" + i + "_down' class='col-md-1 layer' layer='" + i + "'> <img src='/Web/SmartCity/Images/down.png'></div>" +
                        "<div id='layer_" + i + "_delete' class='col-md-1 layer' layer='" + i + "'>  <img src='/Web/SmartCity/Images/delete.png'> </div>" +
                    "</div>");
            $("#layer_" + gdo.net.instance[instanceId].layers[i].id + "_id")
                .click(function() {
                    gdo.net.app["SmartCity"].selectedLayer = $(this).attr('layer');
                    gdo.net.app["SmartCity"].drawPropertyTable(instanceId, gdo.net.app["SmartCity"].selectedLayer);
                });
            $("#layer_" + gdo.net.instance[instanceId].layers[i].id + "_name")
                .click(function() {
                    gdo.net.app["SmartCity"].selectedLayer = $(this).attr('layer');
                    gdo.net.app["SmartCity"].drawPropertyTable(instanceId, gdo.net.app["SmartCity"].selectedLayer);
                });
            $("#layer_" + gdo.net.instance[instanceId].layers[i].id + "_visible")
                .click(function() {
                    var layerId = $(this).attr('layer');
                    if (gdo.net.instance[instanceId].layers[layerId].getVisible()) {
                        gdo.net.app["SmartCity"].server.setLayerVisible(instanceId, layerId, false);
                    } else {
                        gdo.net.app["SmartCity"].server.setLayerVisible(instanceId, layerId, true);
                    }
                });
            $("#layer_" + gdo.net.instance[instanceId].layers[i].id + "_animate")
                .click(function() {
                    var layerId = $(this).attr('layer');
                    gdo.net.app["SmartCity"].animateLayers(instanceId, layerId);
                });
            $("#layer_" + gdo.net.instance[instanceId].layers[i].id + "_up")
                .click(function() {
                    var layerId = $(this).attr('layer');
                    gdo.net.app["SmartCity"].server.moveLayerUp(instanceId, layerId);
                });
            $("#layer_" + gdo.net.instance[instanceId].layers[i].id + "_down")
                .click(function() {
                    var layerId = $(this).attr('layer');
                    gdo.net.app["SmartCity"].server.moveLayerDown(instanceId, layerId);
                });
            $("#layer_" + gdo.net.instance[instanceId].layers[i].id + "_delete")
                .click(function() {
                    var layerId = $(this).attr('layer');
                    gdo.net.app["SmartCity"].server.removeLayer(instanceId, layerId);
                });
            j++;
        }
    }
    gdo.net.app["SmartCity"].drawEmptyPropertyTable();
}

gdo.net.app["SmartCity"].drawEmptyPropertyTable = function () {
    $("#properties")
    .empty();
}

gdo.net.app["SmartCity"].drawPropertyTable = function (instanceId, layerId) {
    gdo.consoleOut('.SmartCity', 1, 'Instance ' + instanceId + ': Drawing Property Table for layer ' + layerId);
    if (layerId > 0) {
        gdo.consoleOut('.SmartCity', 1, 'Instance ' + instanceId + ': Drawing Property Table for layer ' + layerId);

        gdo.net.app["SmartCity"].drawEmptyPropertyTable();

        if (layerId >= 0) {
            for (var key in gdo.net.instance[instanceId].layers[layerId].properties) {
                if (gdo.net.instance[instanceId].layers[layerId].properties.hasOwnProperty(key) && key != "$type") {
                    gdo.consoleOut('.SmartCity', 1, 'Instance ' + instanceId + ': Drawing Property ' + key + ' for layer ' + layerId);


                    $("#properties").append("<div id='layer_"+layerId+"_property_" + key + "' class='row property' layer='" + layerId + "' property='"+key+"'></div>");

                    $("#layer_" + layerId + "_property_").append(
                        "<div id='layer_" + layerId + "_property_" + key + "_key' class='col-md-5 property' ><b>" + key + "</b></div>" +
                        "<div id='layer_" + layerId + "_property_" + key + "_value' class='col-md-7 property' >" + gdo.net.instance[instanceId].layers[layerId].properties[key] + "</div>");

                  

                    if (Object.prototype.toString.call(gdo.net.instance[instanceId].layers[layerId].properties[key]) === '[object Array]') {
                        $("#layer_" + layerId + "_property_" + key).append(
                        "<div id='layer_" + layerId + "_property_" + key + "_key' class='col-md-5 property' ><b>" + key + "</b></div>" +
                        "<div id='layer_" + layerId + "_property_" + key + "_value' class='col-md-7 property' >" + gdo.net.instance[instanceId].layers[layerId].properties[key] + "</div>");

                        //Put a button and select property
                        $("#layer_" + layerId + "_property_" + key)
                            .click(function () {
                                gdo.net.app["SmartCity"].selectedProperty = key;
                                gdo.net.app["SmartCity"].drawEditTable(instanceId, gdo.net.app["SmartCity"].selectedLayer, gdo.net.app["SmartCity"].selectedProperty);
                            });

                    } else {
                        if (contains(gdo.net.instance[instanceId].layers[layerId].properties["Editables"].$values, key)) {

                            $("#layer_" + layerId + "_property_" + key).append(
                                "<div id='layer_" + layerId + "_property_" + key + "_key' class='col-md-5 property' ><b>" + key + "</b></div>" +
                                "<div id='layer_" + layerId + "_property_" + key + "_value' class='col-md-7 property' >" +
                                    "<input type='text' id='layer_" + layerId + "_property_" + key + "_value_input'  style='width: 100%;height: 100%;' value="+gdo.net.instance[instanceId].layers[layerId].properties[key]+"/></input></div>");
                            $("#layer_" + layerId + "_property_" + key + "_value_input")
                                .attr("onfocus", "this.value=''")
                                .attr("value", gdo.net.instance[instanceId].layers[layerId].properties[key]);
                        } else {
                            $("#layer_" + layerId + "_property_" + key).append(
                            "<div id='layer_" + layerId + "_property_" + key + "_key' class='col-md-5 property' ><b>" + key + "</b></div>" +
                            "<div id='layer_" + layerId + "_property_" + key + "_value' class='col-md-7 property' >" + gdo.net.instance[instanceId].layers[layerId].properties[key] + "</div>");
                        }
                    }
                }
            }
        } else {
            //TODO empty property table with some kind of template
        }
    }
    gdo.net.app["SmartCity"].drawEmptyEditTable();
}

gdo.net.app["SmartCity"].drawEmptyEditTable = function() {
    $("#edits")
    .empty();
}

gdo.net.app["SmartCity"].drawEditTable = function (instanceId, layerId, propertyKey) {
    gdo.consoleOut('.SmartCity', 1, 'Instance ' + instanceId + ': Drawing Edit Table for Property' + propertyKey + ' for layer ' + layerId);

    gdo.net.app["SmartCity"].drawEmptyEditTable();

    if (layerId >= 0 && Object.prototype.toString.call(gdo.net.instance[instanceId].layers[layerId].properties[propertyKey]) === '[object Array]') {
        if (contains(gdo.net.instance[instanceId].layers[layerId].properties["Editables"].$values, propertyKey)) {
            for (var key in gdo.net.instance[instanceId].layers[layerId].properties[propertyKey]) {
                gdo.consoleOut('.SmartCity', 1, 'Instance ' + instanceId + ': Drawing Edit '+ key+' for Property' + propertyKey + ' for layer ' + layerId);

                $("#edits").append("<div id='layer_" + layerId + "_property_" + propertyKey + "_edit_ "+key+"' class='row property' layer='" + layerId + "' property='" + propertyKey + " edit='"+key+"''></div>");

                $("#layer_" + layerId + "_property_" + propertyKey + "_edit_ " + key)
                    .append(
                        "<div id='layer_" + layerId + "_property_" + propertyKey + "_edit_ " + key + "_key' class='col-md-5 property' ><b>" + key + "</b></div>" +
                        "<div id='layer_" + layerId + "_property_" + propertyKey + "_edit_ " + key + "_value' class='col-md-7 property' >" +
                        "<input type='text' id='layer_" + layerId + "_property_" + propertyKey + "_edit_ " + key + "_value_input'  style='width: 100%;height: 100%;' value=" + gdo.net.instance[instanceId].layers[layerId].properties[propertyKey][key] + "/></input></div>");

                $("#layer_" + layerId + "_property_" + key + "_value_input")
                    .attr("onfocus", "this.value=''")
                    .attr("value", gdo.net.instance[instanceId].layers[layerId].properties[propertyKey][key]);
            }
        } else {
            for (var key in gdo.net.instance[instanceId].layers[layerId].properties[propertyKey]) {
                $("#edits").append("<div id='layer_" + layerId + "_property_" + propertyKey + "_edit_ " + key + "' class='row property' layer='" + layerId + "' property='" + propertyKey + " edit='" + key + "''></div>");

                $("#layer_" + layerId + "_property_" + propertyKey + "_edit_ " + key)
                    .append(
                        "<div id='layer_" + layerId + "_property_" + propertyKey + "_edit_ " + key + "_key' class='col-md-5 property' ><b>" + key + "</b></div>" +
                        "<div id='layer_" + layerId + "_property_" + propertyKey + "_edit_ " + key + "_value' class='col-md-7 property' >" +
                        gdo.net.instance[instanceId].layers[layerId].properties[propertyKey][key] + "</div>");
            }
        }
    } else {
        //TODO Empty layer list
    }   
}

gdo.net.app["SmartCity"].drawStatusTable = function(instanceId) {
    //TODO
}