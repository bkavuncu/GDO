
gdo.net.app["Telefonica"].drawEmptyMapTable = function (maxCol, maxRow) {
    $("iframe").contents().find("#map_table").empty();
    for (var i = 0; i < maxRow; i++) {
        $("iframe").contents().find("#map_table").append("<tr id='map_table_row_" + i + "' row='" + i + "'></tr>");
        for (var j = 0; j < maxCol; j++) {
            $("iframe").contents().find("#map_table tr:last").append("<td id='map_table_row_" + i + "_col_" + j + "' col='" + j + "' row='" + i + "'></td>");
        }
    }
}

gdo.net.app["Telefonica"].numButtons =7;


gdo.net.app["Telefonica"].drawMapTable = function (instanceId) {
    gdo.net.app["Telefonica"].drawEmptyMapTable(7, 1);

    $("iframe").contents().find("#map_table_row_0_col_0")
        .empty()
        .append("<div><button type='button' id='bing_button' class='btn btn-danger btn-block'>Bing Maps</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100 / gdo.net.app["Telefonica"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["Telefonica"].server.setBingLayerVisible(instanceId);
        });
    $("iframe").contents().find("#map_table_row_0_col_1")
        .empty()
        .append("<div><button type='button' id='cartodb_button' class='btn btn-danger btn-block'>CartoDB Maps</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100 / gdo.net.app["Telefonica"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["Telefonica"].server.setCartoDBLayerVisible(instanceId);
        });
    $("iframe").contents().find("#map_table_row_0_col_2")
        .empty()
        .append("<div><button type='button' id='opencycle_button' class='btn btn-danger btn-block'>OpenCyclesMap</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100 / gdo.net.app["Telefonica"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["Telefonica"].server.setOpenCycleLayerVisible(instanceId);
        });
    $("iframe").contents().find("#map_table_row_0_col_3")
        .empty()
        .append("<div><button type='button' id='stations_button' class='btn btn-danger btn-block'>Stations</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100 / gdo.net.app["Telefonica"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["Telefonica"].server.setStationLayerVisible(instanceId);
        });
    $("iframe").contents().find("#map_table_row_0_col_4")
        .empty()
        .append("<div><button type='button' id='heatmap_button' class='btn btn-danger btn-block'>Heatmap</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100 / gdo.net.app["Telefonica"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["Telefonica"].server.setHeatmapLayerVisible(instanceId);
        });
    $("iframe").contents().find("#map_table_row_0_col_5")
        .empty()
        .append("<div><button type='button' id='animate_button' class='btn btn-primary btn-block'><i class='fa  fa-play-circle fa-fw'></i>&nbsp;Animate</button></div>")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", 100 / gdo.net.app["Telefonica"].numButtons + "%")
        .css("height", "40px")
        .unbind()
        .click(function () {
            gdo.net.app["Telefonica"].server.animate();
        });
  
}

