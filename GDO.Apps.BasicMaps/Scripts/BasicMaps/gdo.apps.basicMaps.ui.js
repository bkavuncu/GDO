gdo.net.app["BasicMaps"].drawEmptyMapTable = function (maxCol, maxRow) {
    $("iframe").contents().find("#map_table").empty();
    for (var i = 0; i < maxRow; i++) {
        $("iframe").contents().find("#map_table").append("<tr id='map_table_row_" + i + "' row='" + i + "'></tr>");
        for (var j = 0; j < maxCol; j++) {
            $("iframe").contents().find("#map_table tr:last").append("<td id='map_table_row_" + i + "_col_" + j + "' col='" + j + "' row='" + i + "'></td>");
        }
    }
}

gdo.net.app["BasicMaps"].numButtons =7;


gdo.net.app["BasicMaps"].drawMapTable = function (instanceId) {
    gdo.net.app["BasicMaps"].drawEmptyMapTable(7,6);

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
    $("iframe").contents().find("#map_table_row_0_col_6")
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
    $("iframe").contents().find("#map_table_row_1_col_0")
      .empty()
      .append("<div><button type='button' id='basicMaps_layer_7' class='btn btn-primary btn-outline btn-block'>Stamen Maps (Toner)</button></div>")
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
        .append("<div><button type='button' id='basicMaps_layer_8' class='btn btn-primary btn-outline btn-block'>Stamen Maps (Terrain)</button></div>")
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
        .append("<div><button type='button' id='basicMaps_layer_9' class='btn btn-primary btn-outline btn-block'>Stamen Maps (Water Color)</button></div>")
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
        .append("<div><button type='button' id='basicMaps_layer_10' class='btn btn-primary btn-outline btn-block'>CartoDB (Dark Matter)</button></div>")
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
        .append("<div><button type='button' id='basicMaps_layer_11' class='btn btn-primary btn-outline btn-block'>CartoDB (Positron)</button></div>")
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
        .append("<div><button type='button' id='basicMaps_layer_12' class='btn btn-primary btn-outline btn-block'>MapBox (Runkeepers)</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100 / gdo.net.app["BasicMaps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["BasicMaps"].server.setLayerVisible(instanceId, 12);
    });
    $("iframe").contents().find("#map_table_row_1_col_6")
        .empty()
        .append("<div><button type='button' id='basicMaps_layer_13' class='btn btn-primary btn-outline btn-block'>MapBox (Hybrid)</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100 / gdo.net.app["BasicMaps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["BasicMaps"].server.setLayerVisible(instanceId, 13);
        });
    $("iframe").contents().find("#map_table_row_2_col_0")
        .empty()
        .append("<div><button type='button' id='basicMaps_layer_14' class='btn btn-primary btn-outline btn-block'>Open Street Map</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100 / gdo.net.app["BasicMaps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["BasicMaps"].server.setLayerVisible(instanceId, 14);
        });
    $("iframe").contents().find("#map_table_row_2_col_1")
        .empty()
        .append("<div><button type='button' id='basicMaps_layer_15' class='btn btn-primary btn-outline btn-block'>Open Cycle Map</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100 / gdo.net.app["BasicMaps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["BasicMaps"].server.setLayerVisible(instanceId, 15);
        });
    $("iframe").contents().find("#map_table_row_2_col_2")
        .empty()
        .append("<div><button type='button' id='basicMaps_layer_16' class='btn btn-primary btn-outline btn-block'>Open Transport</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100 / gdo.net.app["BasicMaps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["BasicMaps"].server.setLayerVisible(instanceId, 16);
        });
    $("iframe").contents().find("#map_table_row_2_col_3")
        .empty()
        .append("<div><button type='button' id='basicMaps_layer_17' class='btn btn-primary btn-outline btn-block'>Open Transport (Dark)</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100 / gdo.net.app["BasicMaps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["BasicMaps"].server.setLayerVisible(instanceId, 17);
        });
    $("iframe").contents().find("#map_table_row_2_col_4")
        .empty()
        .append("<div><button type='button' id='basicMaps_layer_18' class='btn btn-primary btn-outline btn-block'>Comic Style</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100 / gdo.net.app["BasicMaps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["BasicMaps"].server.setLayerVisible(instanceId, 18);
        });
    $("iframe").contents().find("#map_table_row_2_col_5")
        .empty()
        .append("<div><button type='button' id='basicMaps_layer_19' class='btn btn-primary btn-outline btn-block'>Michelin Map</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100 / gdo.net.app["BasicMaps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["BasicMaps"].server.setLayerVisible(instanceId, 19);
        });
    $("iframe").contents().find("#map_table_row_2_col_6")
        .empty()
        .append("<div><button type='button' id='basicMaps_layer_20' class='btn btn-primary btn-outline btn-block'>Map1EU</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100 / gdo.net.app["BasicMaps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["BasicMaps"].server.setLayerVisible(instanceId, 20);
        });
    $("iframe").contents().find("#map_table_row_3_col_0")
        .empty()
        .append("<div><button type='button' id='basicMaps_layer_21' class='btn btn-primary btn-outline btn-block'>Open Topo Map</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100 / gdo.net.app["BasicMaps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["BasicMaps"].server.setLayerVisible(instanceId, 21);
        });
    $("iframe").contents().find("#map_table_row_3_col_1")
        .empty()
        .append("<div><button type='button' id='basicMaps_layer_22' class='btn btn-primary btn-outline btn-block'>Geofabrik Topo Map</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100 / gdo.net.app["BasicMaps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["BasicMaps"].server.setLayerVisible(instanceId, 22);
        });
    $("iframe").contents().find("#map_table_row_3_col_2")
        .empty()
        .append("<div><button type='button' id='basicMaps_layer_23' class='btn btn-primary btn-outline btn-block'>Esri (Topo)</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100 / gdo.net.app["BasicMaps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["BasicMaps"].server.setLayerVisible(instanceId, 23);
        });
    $("iframe").contents().find("#map_table_row_3_col_3")
        .empty()
        .append("<div><button type='button' id='basicMaps_layer_24' class='btn btn-primary btn-outline btn-block'>Esri</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100 / gdo.net.app["BasicMaps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["BasicMaps"].server.setLayerVisible(instanceId, 24);
        });
    $("iframe").contents().find("#map_table_row_3_col_4")
        .empty()
        .append("<div><button type='button' id='basicMaps_layer_25' class='btn btn-primary btn-outline btn-block'>Esri (NatGeo)</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100 / gdo.net.app["BasicMaps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["BasicMaps"].server.setLayerVisible(instanceId, 25);
        });
    $("iframe").contents().find("#map_table_row_3_col_5")
        .empty()
        .append("<div><button type='button' id='basicMaps_layer_26' class='btn btn-primary btn-outline btn-block'>Falk (OSM)</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100 / gdo.net.app["BasicMaps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["BasicMaps"].server.setLayerVisible(instanceId, 26);
        });
    $("iframe").contents().find("#map_table_row_3_col_6")
        .empty()
        .append("<div><button type='button' id='basicMaps_layer_27' class='btn btn-primary btn-outline btn-block'>Falk (Original)</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100 / gdo.net.app["BasicMaps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["BasicMaps"].server.setLayerVisible(instanceId, 27);
        });
    $("iframe").contents().find("#map_table_row_4_col_0")
        .empty()
        .append("<div><button type='button' id='basicMaps_layer_28' class='btn btn-danger  btn-outline btn-block'>Topography Overlay (ASTER)</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100 / gdo.net.app["BasicMaps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["BasicMaps"].server.setLayerVisible(instanceId, 28);
        });
    $("iframe").contents().find("#map_table_row_4_col_1")
        .empty()
        .append("<div><button type='button' id='basicMaps_layer_29' class='btn btn-danger  btn-outline btn-block'>Open Public Transport</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100 / gdo.net.app["BasicMaps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["BasicMaps"].server.setLayerVisible(instanceId, 29);
        });
    $("iframe").contents().find("#map_table_row_4_col_2")
        .empty()
        .append("<div><button type='button' id='basicMaps_layer_30' class='btn btn-danger  btn-outline btn-block'>Open Railway Map (Standard)</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100 / gdo.net.app["BasicMaps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["BasicMaps"].server.setLayerVisible(instanceId, 30);
        });
    $("iframe").contents().find("#map_table_row_4_col_3")
        .empty()
        .append("<div><button type='button' id='basicMaps_layer_31' class='btn btn-danger  btn-outline btn-block'>Open Railway Map (Speed)</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100 / gdo.net.app["BasicMaps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["BasicMaps"].server.setLayerVisible(instanceId, 31);
        });
    $("iframe").contents().find("#map_table_row_4_col_4")
        .empty()
        .append("<div><button type='button' id='basicMaps_layer_38' class='btn  btn-primary  btn-outline btn-block'>Strava Heatmap Bike (Blue)</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100 / gdo.net.app["BasicMaps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["BasicMaps"].server.setLayerVisible(instanceId, 38);
        });
    $("iframe").contents().find("#map_table_row_4_col_5")
        .empty()
        .append("<div><button type='button' id='basicMaps_layer_39' class='btn  btn-primary  btn-outline btn-block'>Strava Heatmap Running (Blue)</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100 / gdo.net.app["BasicMaps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["BasicMaps"].server.setLayerVisible(instanceId, 39);
        });
    $("iframe").contents().find("#map_table_row_5_col_0")
        .empty()
        .append("<div><button type='button' id='basicMaps_layer_32' class='btn  btn-danger  btn-outline btn-block'>Strava Heatmap Bike (Purple)</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100 / gdo.net.app["BasicMaps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["BasicMaps"].server.setLayerVisible(instanceId, 32);
        });
    $("iframe").contents().find("#map_table_row_5_col_1")
        .empty()
        .append("<div><button type='button' id='basicMaps_layer_33' class='btn  btn-danger  btn-outline btn-block'>Strava Heatmap Running (Purple)</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100 / gdo.net.app["BasicMaps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["BasicMaps"].server.setLayerVisible(instanceId, 33);
        });
    $("iframe").contents().find("#map_table_row_5_col_2")
        .empty()
        .append("<div><button type='button' id='basicMaps_layer_34' class='btn  btn-danger  btn-outline btn-block'>Strava Heatmap Bike (Green)</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100 / gdo.net.app["BasicMaps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["BasicMaps"].server.setLayerVisible(instanceId, 34);
        });
    $("iframe").contents().find("#map_table_row_5_col_3")
        .empty()
        .append("<div><button type='button' id='basicMaps_layer_35' class='btn  btn-danger  btn-outline btn-block'>Strava Heatmap Running (Green)</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100 / gdo.net.app["BasicMaps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["BasicMaps"].server.setLayerVisible(instanceId, 35);
        });
    $("iframe").contents().find("#map_table_row_5_col_4")
        .empty()
        .append("<div><button type='button' id='basicMaps_layer_36' class='btn btn-primary  btn-outline btn-block'>Strava Heatmap Bike (Orange)</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100 / gdo.net.app["BasicMaps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["BasicMaps"].server.setLayerVisible(instanceId, 36);
        });
    $("iframe").contents().find("#map_table_row_5_col_5")
        .empty()
        .append("<div><button type='button' id='basicMaps_layer_37' class='btn btn-primary  btn-outline btn-block'>Strava Heatmap Running (Orange)</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100 / gdo.net.app["BasicMaps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["BasicMaps"].server.setLayerVisible(instanceId, 37);
        });
    /*$("iframe").contents().find("#map_table_row_4_col_4")
        .empty()
        .append("<div><button type='button' id='basicMaps_layer_32' class='btn btn-danger btn-outline btn-block'>Bedrock and Superficial Geology</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100 / gdo.net.app["BasicMaps"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["BasicMaps"].server.setLayerVisible(instanceId, 32);
        });*/
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

