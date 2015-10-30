
gdo.net.app["Maps"].drawEmptyMapTable = function (maxCol, maxRow) {
    $("iframe").contents().find("#map_table").empty();
    for (var i = 0; i < maxRow; i++) {
        $("iframe").contents().find("#map_table").append("<tr id='map_table_row_" + i + "' row='" + i + "'></tr>");
        for (var j = 0; j < maxCol; j++) {
            $("iframe").contents().find("#map_table tr:last").append("<td id='map_table_row_" + i + "_col_" + j + "' col='" + j + "' row='" + i + "'></td>");
        }
    }
}

gdo.net.app["Maps"].numButtons =6;


gdo.net.app["Maps"].drawMapTable = function (instanceId) {
    gdo.net.app["Maps"].drawEmptyMapTable(6, 2);

    $("iframe").contents().find("#map_table_row_0_col_0")
        .empty()
        .append("<div><button type='button' id='maps_layer_0' class='btn btn-primary btn-outline btn-block'>Bing Maps (Aerial)</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100/gdo.net.app["Maps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["Maps"].server.setLayerVisible(instanceId, 0);
        });
    $("iframe").contents().find("#map_table_row_0_col_1")
        .empty()
        .append("<div><button type='button' id='maps_layer_1' class='btn btn-primary btn-outline btn-block'>Bing Maps (Aerial with Labels)</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100/gdo.net.app["Maps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["Maps"].server.setLayerVisible(instanceId, 1);
        });
    $("iframe").contents().find("#map_table_row_0_col_2")
        .empty()
        .append("<div><button type='button' id='maps_layer_2' class='btn btn-primary btn-outline btn-block'>Bing Maps (Road)</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100/gdo.net.app["Maps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["Maps"].server.setLayerVisible(instanceId, 2);
        });
    $("iframe").contents().find("#map_table_row_0_col_3")
        .empty()
        .append("<div><button type='button' id='maps_layer_3' class='btn btn-primary btn-outline btn-block'>Bing Maps (Collins Bart)</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100/gdo.net.app["Maps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["Maps"].server.setLayerVisible(instanceId, 3);
        });
    $("iframe").contents().find("#map_table_row_0_col_4")
        .empty()
        .append("<div><button type='button' id='maps_layer_4' class='btn btn-primary btn-outline btn-block'>Bing Maps (Ordnance Survey)</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100/gdo.net.app["Maps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["Maps"].server.setLayerVisible(instanceId, 4);
        });
    $("iframe").contents().find("#map_table_row_0_col_5")
        .empty()
        .append("<div><button type='button' id='maps_layer_5' class='btn btn-primary btn-outline btn-block'>Map Quest</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100/gdo.net.app["Maps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["Maps"].server.setLayerVisible(instanceId, 5);
        });
    $("iframe").contents().find("#map_table_row_1_col_0")
      .empty()
      .append("<div><button type='button' id='maps_layer_7' class='btn btn-primary btn-outline btn-block'>Stamen Maps (Toner)</button></div>")
      .css("margin", "0px")
      .css("padding", "0px")
      .css("width", 100/gdo.net.app["Maps"].numButtons + "%")
      .css("height", "40px")
      .unbind()
      .click(function () {
          gdo.net.app["Maps"].server.setLayerVisible(instanceId, 7);
      });
    $("iframe").contents().find("#map_table_row_1_col_1")
        .empty()
        .append("<div><button type='button' id='maps_layer_8' class='btn btn-primary btn-outline btn-block'>Stamen Maps (Terrain)</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100/gdo.net.app["Maps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["Maps"].server.setLayerVisible(instanceId, 8);
        });
    $("iframe").contents().find("#map_table_row_1_col_2")
        .empty()
        .append("<div><button type='button' id='maps_layer_9' class='btn btn-primary btn-outline btn-block'>Stamen Maps (Water Color)</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100/gdo.net.app["Maps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["Maps"].server.setLayerVisible(instanceId, 9);
        });
    $("iframe").contents().find("#map_table_row_1_col_3")
        .empty()
        .append("<div><button type='button' id='maps_layer_10' class='btn btn-primary btn-outline btn-block'>Open Street Map</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100/gdo.net.app["Maps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["Maps"].server.setLayerVisible(instanceId, 10);
        });
    $("iframe").contents().find("#map_table_row_1_col_4")
        .empty()
        .append("<div><button type='button' id='maps_layer_11' class='btn btn-primary btn-outline btn-block'>Open Cycle Map</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100/gdo.net.app["Maps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["Maps"].server.setLayerVisible(instanceId, 11);
        });
    $("iframe").contents().find("#map_table_row_1_col_5")
        .empty()
        .append("<div><button type='button' id='maps_layer_6' class='btn btn-primary btn-outline btn-block'>Map Quest (Satellite)</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100 / gdo.net.app["Maps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["Maps"].server.setLayerVisible(instanceId, 6);
        });
}

