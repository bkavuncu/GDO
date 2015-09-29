gdo.net.app["Maps"].selectedInstance = -1;
gdo.net.app["Maps"].selectedLayer = -1;
gdo.net.app["Maps"].selectedProperty = -1;
gdo.net.app["Maps"].HeaderHeight = 61;
gdo.net.app["Maps"].MapHeight = 400;
gdo.net.app["Maps"].tableHeight = 500;
gdo.net.app["Maps"].StatusHeight = 49;


gdo.net.app["Maps"].drawHeaderTable = function(instanceId) {
    //TODO
}

gdo.net.app["Maps"].drawMapTable = function (instanceId) {
    gdo.net.app["Maps"].drawHeaderTable();
    gdo.net.app["Maps"].drawInstanceTable(instanceId);
    gdo.net.app["Maps"].drawLayerTable(instanceId, gdo.net.app["Maps"].selectedLayer);
    gdo.net.app["Maps"].drawPropertyTable(instanceId, gdo.net.app["Maps"].selectedLayer, gdo.net.app["Maps"].selectedProperty);
    gdo.net.app["Maps"].drawEditTable();
    gdo.net.app["Maps"].drawStatusTable();
}

gdo.net.app["Maps"].drawInstanceTable = function (instanceId) {
    $("#instance_list_table")
        .empty()
        .css("height", gdo.net.app["Maps"].tableHeight)
        .css("width", "7%")
        .css("border", "3px solid #444")
        .css("color", "#DDD")
        .css("background", "#222")
        .css('padding', 7)
        .attr("align", "center")
        .css("vertical-align", "top")
        .css({ fontSize: 14 });

    var j = 0;
    for (var i = 0; i < gdo.net.instance.length; i++) {
        if (gdo.net.instance[0].appName == "Maps") {
            $("#instance_list_table").append("<tr id='instance_list_table_row_" + j + " row='" + j + "'></tr>");
            $("#instance_list_table tr:last").append("<td id='instance_list_table_row_" + j + "_col_0' instance='" + i + "'></td>");
            $("#instance_list_table_row_" + i + "_col_0")
                .empty()
                .append(i)
                .css("border", "2px solid #444")
                .css("color", "#DDD")
                .css("background", "#222")
                .css('padding', 7)
                .click(function () {
                    gdo.net.app["Maps"].selectedInstance = gdo.net.instance[$(this).attr('instance')].id;
                    gdo.net.app["Maps"].switchToInstance(gdo.net.app["Maps"].selectedInstance);
                });
        }
    }
}

gdo.net.app["Maps"].drawLayerTable = function (instanceId) {
    $("#layer_list_table")
        .empty()
        .css("height", gdo.net.app["Maps"].tableHeight)
        .css("width", "28%")
        .css("border", "3px solid #444")
        .css("color", "#DDD")
        .css("background", "#222")
        .css('padding', 7)
        .attr("align", "center")
        .css("vertical-align", "top")
        .css({ fontSize: 14 });

    var j = 1;
    //Add button
    $("#layer_list_table").append("<tr id='layer_list_table_row_0 row='0'>" +
        "<td>" +
        "<div id='layer_list_table_add_button'>" +
        "<img src='/Web/Maps/Images/add.png'>" +
        "</div>" +
        "</td>" +
        "</tr>");
    //Layers
    for (var i = 0; i < gdo.net.instance[instanceId].layers.length; i++) {
        $("#layer_list_table").append("<tr id='layer_list_table_row_" + j + " row='" + j + "'></tr>");
        $("#layer_list_table tr:last").append("<td id='layer_list_table_row_" + j + "_col_0' layer='" + i + "'></td>");
        $("#layer_list_table_row_" + i + "_col_0")
            .empty()
            .append("<div id='layer_list_table_" + gdo.net.instance[instanceId].layers[i].id + "'> " +
                "<table style='width: 100%;'> " +
                "<tr>" +
                "<td id='layer_list_table_" + gdo.net.instance[instanceId].layers[i].id + "_id'><b>" + gdo.net.instance[instanceId].layers[i].id + "</b></td>" +
                "<td id='layer_list_table_" + gdo.net.instance[instanceId].layers[i].id + "_name'><b>" + gdo.net.instance[instanceId].layers[i].name + "</b></td>" +
                "<td id='layer_list_table_" + gdo.net.instance[instanceId].layers[i].id + "_visible'> <img src='/Web/Maps/Images/visible.png'> </td>" +
                "<td id='layer_list_table_" + gdo.net.instance[instanceId].layers[i].id + "_animate'> <img src='/Web/Maps/Images/animate.png'> </td>" +
                "<td id='layer_list_table_" + gdo.net.instance[instanceId].layers[i].id + "_up'> <img src='/Web/Maps/Images/up.png'> </td>" +
                "<td id='layer_list_table_" + gdo.net.instance[instanceId].layers[i].id + "_down'> <img src='/Web/Maps/Images/down.png'> </td>" +
                "<td id='layer_list_table_" + gdo.net.instance[instanceId].layers[i].id + "_delete'> <img src='/Web/Maps/Images/delete.png'> </td>" +
                "</tr>" +
                "</table>" +
                "</div>")
            .css("border", "2px solid #444")
            .css("color", "#DDD")
            .css("background", "#222")
            .css('padding', 7);

        $("#layer_list_table_" + gdo.net.instance[instanceId].layers[i].id + "_id")
            .click(function () {
                gdo.net.app["Maps"].selectedLayer = $(this).attr('layer');
                gdo.net.app["Maps"].selectedProperty = 1;
                gdo.net.app["Maps"].drawPropertyTable(gdo.net.instance[instanceId].layer);
            });
        $("#layer_list_table_" + gdo.net.instance[instanceId].layers[i].id + "_name")
            .click(function () {
                gdo.net.app["Maps"].selectedLayer = $(this).attr('layer');
                gdo.net.app["Maps"].selectedProperty = 1;
                gdo.net.app["Maps"].drawPropertyTable(gdo.net.instance[instanceId].layer);
            });
        $("#layer_list_table_" + gdo.net.instance[instanceId].layers[i].id + "_visible")
            .click(function () {
                var layerId = $(this).attr('layer');
                if(gdo.net.instance[instanceId].layers[layerId].getVisible()) {
                    gdo.net.app["Maps"].server.setLayerVisible(instanceId, layerId, false);
                } else {
                    gdo.net.app["Maps"].server.setLayerVisible(instanceId, layerId, true);
                }
            });
        $("#layer_list_table_" + gdo.net.instance[instanceId].layers[i].id + "_animate")
            .click(function () {
                var layerId = $(this).attr('layer');
                gdo.net.app["Maps"].animateLayers(instanceId, layerId);
            });
        $("#layer_list_table_" + gdo.net.instance[instanceId].layers[i].id + "_up")
            .click(function () {
                var layerId = $(this).attr('layer');
                gdo.net.app["Maps"].server.moveLayerUp(instanceId, layerId);
            });
        $("#layer_list_table_" + gdo.net.instance[instanceId].layers[i].id + "_down")
            .click(function () {
                var layerId = $(this).attr('layer');
                gdo.net.app["Maps"].server.moveLayerDown(instanceId, layerId);
            });
        $("#layer_list_table_" + gdo.net.instance[instanceId].layers[i].id + "_delete")
        .click(function () {
            var layerId = $(this).attr('layer');
            gdo.net.app["Maps"].server.removeLayer(instanceId, layerId);
        });
        j++;
    }
}

gdo.net.app["Maps"].drawPropertyTable = function (instanceId, layerId) {
    $("#property_list_table")
        .empty()
        .css("height", gdo.net.app["Maps"].tableHeight)
        .css("width", "28%")
        .css("border", "3px solid #444")
        .css("color", "#DDD")
        .css("background", "#222")
        .css('padding', 7)
        .attr("align", "center")
        .css("vertical-align", "top")
        .css({ fontSize: 14 });

    //Save button
    $("#layer_list_table").append("<tr id='property_list_table_save'>" +
        "<td>" +
        "<div id='property_list_table_save_button'>" +
        "<img src='/Web/Maps/Images/save.png'>" +
        "</div>" +
        "</td>" +
        "</tr>");
    if (layerId >= 0) {
        for (var key in gdo.net.instance[instanceId].layers[layerId].properties) {
            if (gdo.net.instance[instanceId].layers[layerId].properties.hasOwnProperty(key)) {
                $("#property_list_table tr:last").append("<td id='property_list_table_" + key + "'></td>");
                $("#property_list_table_" + key)
                    .empty()
                    .css("border", "2px solid #444")
                    .css("color", "#DDD")
                    .css("background", "#222")
                    .css('padding', 7);

                if (Object.prototype.toString.call(gdo.net.instance[instanceId].layers[layerId].properties[key]) === '[object Array]') {
                    $("#property_list_table_" + key)
                        .append("<div id='property_list_table_" + key + "'> " +
                            "<table style='width: 100%;'> " +
                            "<tr>" +
                            "<td id='property_list_table_" + key + "_key'><b>" + key + "</b></td>" +
                            "<td id='property_list_table_" + key + "_value'>" + gdo.net.instance[instanceId].layers[layerId].properties[key] + "</td>" +
                            "</tr>" +
                            "</table>" +
                            "</div>");
                    //Put a button and select property
                    $("#property_list_table_" + key + "")
                        .click(function () {
                            gdo.net.app["Maps"].selectedProperty = key;
                            gdo.net.app["Maps"].drawEditTable(instanceId, gdo.net.app["Maps"].selectedLayer, gdo.net.app["Maps"].selectedProperty);
                        });

                } else {
                    if (contains(gdo.net.instance[instanceId].layers[layerId].properties["Editables"].$values, key)) {
                        $("#property_list_table_" + key)
                            .append("<div id='property_list_table_" + key + "'> " +
                                "<table style='width: 100%;'> " +
                                "<tr>" +
                                "<td id='property_list_table_" + key + "_key'><b>" + key + "</b></td>" +
                                "<td id='property_list_table_" + key + "_value'>" +
                                "<input type='text' id='property_list_table_" + key + "_value_input'  style='width: 100%;height: 100%;' /></input></td>" +
                                "</tr>" +
                                "</table>" +
                                "</div>");
                        $("#property_list_table_" + key + "_value_input")
                            //.attr("onfocus", "this.value=''")
                            .attr("value", gdo.net.instance[instanceId].layers[layerId].properties[key]);
                    } else {
                        $("#property_list_table_" + key)
                            .append("<div id='property_list_table_" + key + "'> " +
                                "<table style='width: 100%;'> " +
                                "<tr>" +
                                "<td id='property_list_table_" + key + "_key'><b>" + key + "</b></td>" +
                                "<td id='property_list_table_" + key + "_value'>" + gdo.net.instance[instanceId].layers[layerId].properties[key] + "</td>" +
                                "</tr>" +
                                "</table>" +
                                "</div>");
                    }
                }
            }
        }
    } else {
        //TODO empty property table with some kind of template
    }
    gdo.net.app["Maps"].drawPropertyTable(instanceId, layerId, gdo.net.app["Maps"].selectedProperty);
}

gdo.net.app["Maps"].drawEditTable = function(instanceId, layerId, propertyKey) {
    $("#edit_list_table")
        .empty()
        .css("height", gdo.net.app["Maps"].tableHeight)
        .css("width", "28%")
        .css("border", "3px solid #444")
        .css("color", "#DDD")
        .css("background", "#222")
        .css('padding', 7)
        .attr("align", "center")
        .css("vertical-align", "top")
        .css({ fontSize: 14 });

    if (layerId >= 0 && Object.prototype.toString.call(gdo.net.instance[instanceId].layers[layerId].properties[propertyKey]) === '[object Array]') {
        if (contains(gdo.net.instance[instanceId].layers[layerId].properties["Editables"].$values, propertyKey)) {
            for (var key in gdo.net.instance[instanceId].layers[layerId].properties[propertyKey]) {
                $("#edit_list_table tr:last").append("<td id='edit_list_table_" + key + "'></td>");
                $("#edit_list_table_" + key)
                    .empty()
                    .css("border", "2px solid #444")
                    .css("color", "#DDD")
                    .css("background", "#222")
                    .css('padding', 7);

                $("#edit_list_table_" + key)
                    .append("<div id='edit_list_table_" + key + "'> " +
                        "<table style='width: 100%;'> " +
                        "<tr>" +
                        "<td id='edit_list_table_" + key + "_key'><b>" + key + "</b></td>" +
                        "<td id='edit_list_table_" + key + "_value'>" +
                        "<input type='text' id='edit_list_table_" + key + "_value_input'  style='width: 100%;height: 100%;' /></input></td>" +
                        "</tr>" +
                        "</table>" +
                        "</div>");
                $("#edit_list_table_" + key + "_value_input")
                    //.attr("onfocus", "this.value=''")
                    .attr("value", gdo.net.instance[instanceId].layers[layerId].properties[propertyKey][key]);
            }
        } else {
            for (var key in gdo.net.instance[instanceId].layers[layerId].properties[propertyKey]) {
                $("#edit_list_table_" + key)
                    .append("<div id='edit_list_table_" + key + "'> " +
                        "<table style='width: 100%;'> " +
                        "<tr>" +
                        "<td id='property_list_table_" + key + "_key'><b>" + key + "</b></td>" +
                        "<td id='property_list_table_" + key + "_value'>" + gdo.net.instance[instanceId].layers[layerId].properties[propertyKey][key] + "</td>" +
                        "</tr>" +
                        "</table>" +
                        "</div>");
            }
        }
    } else {
        //TODO Empty layer list
    }   
}

gdo.net.app["Maps"].drawStatusTable = function(instanceId) {
    //TODO
}