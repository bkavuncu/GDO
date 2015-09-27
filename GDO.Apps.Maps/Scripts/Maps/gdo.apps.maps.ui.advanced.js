
gdo.updateDisplayCanvas = function () {
    /// <summary>
    /// Updates the gdo canvas.
    /// </summary>
    /// <returns></returns>
    //gdo.consoleOut(".DISPLAY", 2, "At Update Display");
    gdo.net.app["Maps"].drawHeaderTable();
    gdo.net.app["Maps"].drawMapTable();
    gdo.net.app["Maps"].drawInstanceTable();
    gdo.net.app["Maps"].drawLayerTable();
    gdo.net.app["Maps"].drawContentTable();
    gdo.net.app["Maps"].drawPropertyTable();
    gdo.net.app["Maps"].drawStatusTable();
}

//TODO empty tables

gdo.net.app["Maps"].drawMapTable = function (instanceId) {

}

//Generic method to read data structure and edit methods

//Instance Tab (will not input anything)

gdo.management.drawEmptyInstanceTable = function() {

    $("#instance_list")
        .css("height", "30px")
        .css("width", "7%")
        .css("border", "3px solid #444")
        .css("color", "#DDD")
        .css("background", "#222")
        .css('padding', 7)
        .attr("align", "center")
        .css("vertical-align", "top")
        .css({ fontSize: 14 });
}

gdo.net.app["Maps"].drawInstanceTable = function (instanceId) {
    gdo.net.app["Maps"].drawEmptyInstanceTable();
    $("#instance_list_table").empty();
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

//List of instances on the left,
    //Click on an instance will trigger to draw layer,property,edit table, map, status table
    //Map how? by iframe

//Layer Table ( will input instanceID)

gdo.management.drawEmptyLayerTable = function () {

    $("#layer_list")
        .css("height", "30px")
        .css("width", "28%")
        .css("border", "3px solid #444")
        .css("color", "#DDD")
        .css("background", "#222")
        .css('padding', 7)
        .attr("align", "center")
        .css("vertical-align", "top")
        .css({ fontSize: 14 });
}

gdo.net.app["Maps"].drawLayerTable = function (instanceId) {
    gdo.net.app["Maps"].drawEmptyLayerTable();
    $("#layer_list_table").empty();
    var j = 0;
    //First one add button
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
            .css('padding', 7)

        $("#layer_list_table_" + gdo.net.instance[instanceId].layers[i].id + "_id")
            .click(function () {
                gdo.net.instance[instanceId].layer = $(this).attr('layer');
                gdo.net.app["Maps"].drawPropertyTable(gdo.net.instance[instanceId].layer);
            });
        $("#layer_list_table_" + gdo.net.instance[instanceId].layers[i].id + "_name")
            .click(function () {
                gdo.net.instance[instanceId].layer = $(this).attr('layer');
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
    }
}


//Content Table (will input layerID)

    //Automate layer.properties

    //Editables list will give which are editable values

    //Plus add layer will ignore and load all the list

    //Update or Save button will appear on the bottom or top

//Edit Table (will input property id on the list of properties)

    //Only load editable list if existing
    
//Load full list if new

