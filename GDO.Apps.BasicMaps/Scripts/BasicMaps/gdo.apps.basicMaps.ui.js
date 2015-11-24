gdo.net.app["BasicMaps"].drawEmptyMapTable = function (maxCol, maxRow) {
    $("iframe").contents().find("#map_table").empty();
    for (var i = 0; i < maxRow; i++) {
        $("iframe").contents().find("#map_table").append("<tr id='map_table_row_" + i + "' row='" + i + "'></tr>");
        for (var j = 0; j < maxCol; j++) {
            $("iframe").contents().find("#map_table tr:last").append("<td id='map_table_row_" + i + "_col_" + j + "' col='" + j + "' row='" + i + "'></td>");
        }
    }
}

gdo.net.app["BasicMaps"].numButtons =6;


gdo.net.app["BasicMaps"].drawMapTable = function (instanceId) {
    gdo.net.app["BasicMaps"].drawEmptyMapTable(6,2);

    $("iframe").contents().find("#map_table_row_0_col_0")
        .empty()
        .append("<div><button type='button' id='basicMaps_layer_0' class='btn btn-primary btn-outline btn-block'>Bing Maps (Aerial)</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100/gdo.net.app["BasicMaps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["BasicMaps"].server.setLayerVisible(instanceId, 0);
        });
    $("iframe").contents().find("#map_table_row_0_col_1")
        .empty()
        .append("<div><button type='button' id='basicMaps_layer_1' class='btn btn-primary btn-outline btn-block'>Bing Maps (Aerial with Labels)</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100/gdo.net.app["BasicMaps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["BasicMaps"].server.setLayerVisible(instanceId, 1);
        });
    $("iframe").contents().find("#map_table_row_0_col_2")
        .empty()
        .append("<div><button type='button' id='basicMaps_layer_2' class='btn btn-primary btn-outline btn-block'>Bing Maps (Road)</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100/gdo.net.app["BasicMaps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["BasicMaps"].server.setLayerVisible(instanceId, 2);
        });
    $("iframe").contents().find("#map_table_row_0_col_3")
        .empty()
        .append("<div><button type='button' id='basicMaps_layer_3' class='btn btn-primary btn-outline btn-block'>Bing Maps (Collins Bart)</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100/gdo.net.app["BasicMaps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["BasicMaps"].server.setLayerVisible(instanceId, 3);
        });
    $("iframe").contents().find("#map_table_row_0_col_4")
        .empty()
        .append("<div><button type='button' id='basicMaps_layer_4' class='btn btn-primary btn-outline btn-block'>Bing Maps (Ordnance Survey)</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100/gdo.net.app["BasicMaps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["BasicMaps"].server.setLayerVisible(instanceId, 4);
        });
    $("iframe").contents().find("#map_table_row_0_col_5")
        .empty()
        .append("<div><button type='button' id='basicMaps_layer_5' class='btn btn-primary btn-outline btn-block'>Map Quest</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100/gdo.net.app["BasicMaps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["BasicMaps"].server.setLayerVisible(instanceId, 5);
        });
    $("iframe").contents().find("#map_table_row_1_col_0")
      .empty()
      .append("<div><button type='button' id='basicMaps_layer_7' class='btn btn-primary btn-outline btn-block'>Stamen BasicMaps (Toner)</button></div>")
      .css("margin", "0px")
      .css("padding", "0px")
      .css("width", 100/gdo.net.app["BasicMaps"].numButtons + "%")
      .css("height", "40px")
      .unbind()
      .click(function () {
          gdo.net.app["BasicMaps"].server.setLayerVisible(instanceId, 7);
      });
    $("iframe").contents().find("#map_table_row_1_col_1")
        .empty()
        .append("<div><button type='button' id='basicMaps_layer_8' class='btn btn-primary btn-outline btn-block'>Stamen BasicMaps (Terrain)</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100/gdo.net.app["BasicMaps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["BasicMaps"].server.setLayerVisible(instanceId, 8);
        });
    $("iframe").contents().find("#map_table_row_1_col_2")
        .empty()
        .append("<div><button type='button' id='basicMaps_layer_9' class='btn btn-primary btn-outline btn-block'>Stamen BasicMaps (Water Color)</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100/gdo.net.app["BasicMaps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["BasicMaps"].server.setLayerVisible(instanceId, 9);
        });
    $("iframe").contents().find("#map_table_row_1_col_3")
        .empty()
        .append("<div><button type='button' id='basicMaps_layer_10' class='btn btn-primary btn-outline btn-block'>Open Street Map</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100/gdo.net.app["BasicMaps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["BasicMaps"].server.setLayerVisible(instanceId, 10);
        });
    $("iframe").contents().find("#map_table_row_1_col_4")
        .empty()
        .append("<div><button type='button' id='basicMaps_layer_11' class='btn btn-primary btn-outline btn-block'>Open Cycle Map</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100/gdo.net.app["BasicMaps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["BasicMaps"].server.setLayerVisible(instanceId, 11);
        });
    $("iframe").contents().find("#map_table_row_1_col_5")
        .empty()
        .append("<div><button type='button' id='basicMaps_layer_6' class='btn btn-primary btn-outline btn-block'>Map Quest (Satellite)</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100 / gdo.net.app["BasicMaps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["BasicMaps"].server.setLayerVisible(instanceId, 6);
        });
    /*$("iframe").contents().find("#map_table_row_2_col_0")
        .empty()
        .append("<div><button type='button' id='basicMaps_layer_13' class='btn btn-danger btn-outline btn-block'>Bedrock and Superficial Geology</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100 / gdo.net.app["BasicMaps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["BasicMaps"].server.setLayerVisible(instanceId, 13);
        });
    $("iframe").contents().find("#map_table_row_2_col_1")
        .empty()
        .append("<div><button type='button' id='basicMaps_layer_14' class='btn btn-danger btn-outline btn-block'>Bedrock Age</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100 / gdo.net.app["BasicMaps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["BasicMaps"].server.setLayerVisible(instanceId, 14);
        });
    $("iframe").contents().find("#map_table_row_2_col_2")
        .empty()
        .append("<div><button type='button' id='basicMaps_layer_15' class='btn btn-danger btn-outline btn-block'>Superficial Bedrock Lithology</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100 / gdo.net.app["BasicMaps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["BasicMaps"].server.setLayerVisible(instanceId, 15);
        });
    $("iframe").contents().find("#map_table_row_2_col_3")
        .empty()
        .append("<div><button type='button' id='basicMaps_layer_16' class='btn btn-danger btn-outline btn-block'>Superficial Bedrock Lithostratigraphy</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100 / gdo.net.app["BasicMaps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["BasicMaps"].server.setLayerVisible(instanceId, 16);
        });
    $("iframe").contents().find("#map_table_row_2_col_4")
        .empty()
        .append("<div><button type='button' id='basicMaps_layer_17' class='btn btn-danger btn-outline btn-block'>Seabed Sediments</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100 / gdo.net.app["BasicMaps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["BasicMaps"].server.setLayerVisible(instanceId, 17);
        });*/
    //Search
    $("iframe").contents().find("#map_input_div")
    .css("margin", "0px")
    .css("padding", "0px")
    .css("width", "60%")
    .css("height", "40px")
    .empty()
    .append("<input type='text'  class='form-control' id='map_input' value='Enter Location' spellcheck='false' style='width: 95%;height: 100%;' /></input>");
    $("iframe").contents().find("#map_input")
        .css("width", "100%")
        .css("height", "40px")
        //.css("border", "1px solid #333")
        .css("background", "#333")
        //.css("color", "#FFF")
        .css("padding", "0px")
        .css("display", "inline-block")
        .css("position", "relative")
        .attr("text-align", "center")
        .focus(gdo.net.app['BasicMaps'].clearInput)
        .css({ fontSize: gdo.management.button_font_size * 0.7 });
    $("iframe").contents().find("#map_input").keyup(function (event) {
        if (event.keyCode == 13) {
            $("iframe").contents().find("#map_submit").click();
        }
    });
    $("iframe").contents().find("#map_submit_div")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", "20%")
        .css("height", "40px")
        .css("background", "#444")
        .empty()
        .append("<button type='button' id='map_submit' class='btn btn-success btn-block'><i class='fa fa-check-circle fa-fw'></i>&nbsp;Search</button>");
    $("iframe").contents().find("#map_submit")
        .css("width", "100%")
        .focus(gdo.net.app['BasicMaps'].clearInput)
        .css({ fontSize: gdo.management.button_font_size * 0.7 })
        .unbind()
        .click(function () {
            gdo.consoleOut(".BasicMaps", 1, "Finding: " + $("iframe").contents().find('#map_input').val());
            gdo.net.app["BasicMaps"].searchGeoCode(instanceId, $("iframe").contents().find('#map_input').val());
        });
    $("iframe").contents().find("#map_clear_div")
       .css("margin", "0px")
       .css("padding", "0px")
       .css("width", "20%")
       .css("height", "40px")
       .css("background", "#444")
       .empty()
       .append("<button type='button' id='map_clear' class='btn btn-danger btn-block'><i class='fa fa-times-circle fa-fw'></i>&nbsp;Clear Marker</button>");
    $("iframe").contents().find("#map_clear")
        .css("width", "100%")
        .css({ fontSize: gdo.management.button_font_size * 0.7 })
        .unbind()
        .click(function () {
            gdo.net.app["BasicMaps"].clearPositionMarker(instanceId);
        });
}

