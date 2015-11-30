$(function () {

    gdo.maintenance.table_height = 350;
    gdo.maintenance.table_font_size = 10;
    gdo.maintenance.button_height = 100;
    gdo.maintenance.button_cols = 4;
    gdo.maintenance.isRectangle = true;
    gdo.maintenance.isStarted = false;
    gdo.maintenance.colStart = 1000;
    gdo.maintenance.colEnd = -1;
    gdo.maintenance.rowStart = 1000;
    gdo.maintenance.rowEnd = -1;
});

gdo.maintenance.drawEmptyNodeTable = function (maxCol, maxRow) {
    /// <summary>
    /// Draws the node table.
    /// </summary>
    /// <param name="maxRow">The maximum row.</param>
    /// <param name="maxCol">The maximum col.</param>
    /// <returns></returns>
    //gdo.consoleOut('.TEST', 1, 'Drawing Empty Node Table with ' + maxRow + ',' +maxCol);
    $("#maintenance_node_table").empty();
    for (var i = 0; i < maxRow; i++) {
        $("#maintenance_node_table").append("<tr id='maintenance_node_table_row" + i + "' row='"+i+"'></tr>");
        for (var j = 0; j < maxCol; j++) {
            $("#maintenance_node_table tr:last").append("<td id='maintenance_node_table_row" + i + "_col" + j + "' col='"+j+"' row='"+i+"'></td>");
        }
    }
}

gdo.management.processNodeUpdate = function (id) {
    $("#node" + id + "_u").css("background", "#559100");
    //setTimeout(function () { $("#node" + id + "_u").css("background", "transparent"); }, 1000);
    gdo.consoleOut('.NET', 2, 'HERE' + id);
}

gdo.maintenance.drawMaintenanceTable = function() {
    for (var i = 1; i <= gdo.net.cols * gdo.net.rows; i++) {
        var node = gdo.net.node[i];
        $("#maintenance_node_table").css('padding', 3);
        $("#maintenance_node_table_row" + node.row + "_col" + node.col)
            .empty()
            .css("vertical-align","top")
            .append("<div id='node" + node.id + "_i' style='text-align:center;background:#333'> <font size='4px'><b> " + node.id + "</b></font> </div>")
            .append("<div id='node" + node.id + "_u' >&nbsp; Update</div> ")
            .append("<div id='node" + node.id + "_s'> <b>&nbsp;Section ID:</b> " + node.sectionId + "</div>")
            //.append("<div id='node" + node.id + "_p'> <b>Peer ID:</b> " + node.peerId + "</div>")
            //.append("<div id='node" + node.id + "_c'> <b>Conn ID:</b> " + node.connectionId + "</div>")
            .append("<div id='node" + node.id + "_p'> <b>&nbsp;Peer Conn</b></div>")
            .append("<div id='node" + node.id + "_c'> <b>&nbsp;Server Conn</b></div>")
            .css("height", (gdo.maintenance.table_height / gdo.net.rows) + "%")
            .css("width", (gdo.maintenance.table_width / gdo.net.cols) + "%")
            .css({ fontSize: gdo.maintenance.table_font_size })
            .css("background-color","#000")
            .css('padding', 0);
        /*if (node.lastUpdate > 60) {
            $("#node" + node.id + "_u").css("background", "#CC0000");
        }else if (Node.lastUpdate > 30) {
            $("#node" + node.id + "_u").css("background", "#FF8800");
        }else{
            $("#node" + node.id + "_u").css("background", "#559100");
        }*/
        if (node.id == gdo.clientId) {
            $("#maintenance_node_table_row" + node.row + "_col" + node.col).css("border", "2px solid #097DB4");
            $("#node" + node.id + "_i").css("background", "#097DB4");
            $("#maintenance_node_table_row" + node.row + "_col" + node.col).css("background", "#2A9FD6");
        } else if (node.isNeighbour) {
            $("#maintenance_node_table_row" + node.row + "_col" + node.col).css("border", "2px solid #075B92");
            $("#node" + node.id + "_i").css("background", "#075B92");
            $("#maintenance_node_table_row" + node.row + "_col" + node.col).css("background", "#097DB4");
        } else {
            $("#maintenance_node_table_row" + node.row + "_col" + node.col).css("border", "2px solid #222");
            $("#node" + node.id + "_i").css("background", "#222");
            $("#maintenance_node_table_row" + node.row + "_col" + node.col).css("background", "#111");
        }
        if (node.connectedToPeer || node.id == gdo.clientId) {
            $("#node" + node.id + '_p').css("background", "#559100");
        } else {
            $("#node" + node.id + '_p').css("background", "#CC0000");
        }
        if (node.isConnectedToCaveServer) {
            $("#node" + node.id + '_c').css("background", "#559100");
        } else {
            $("#node" + node.id + '_c').css("background", "#CC0000");
        }
        if (node.sectionId > 0 && node.sectionId == gdo.net.node[gdo.clientId].sectionId) {
            $("#node" + node.id + '_s').css("background", "#559100");
        } else if (node.sectionId > 0) {
            $("#node" + node.id + '_s').css("background", "#FF8800");
        } else {
            $("#node" + node.id + '_s').css("background", "#CC0000");
        }

        if (node.id == gdo.clientId) {
            $("#maintenance_status_table_col").css("background", "#111");
            $("#maintenance_status_table_row").css("background", "#111");
            $("#maintenance_status_table_sid").css("background", "#111");
            $("#maintenance_status_table_scol").css("background", "#111");
            $("#maintenance_status_table_srow").css("background", "#111");
            $("#maintenance_status_table_cid").css("background", "#111");
            $("#maintenance_status_table_pid").css("background", "#111");
            $("#maintenance_status_table_h").css("background", "#111");

            $("#maintenance_status_table_app").css("background", "#111").css("border", "2px solid #222");
            $("#maintenance_status_table_instance").css("background", "#111").css("border", "2px solid #222");
            $("#maintenance_status_table_configuration").css("background", "#111").css("border", "2px solid #222");

            $("#maintenance_status_table_col_content").empty().css({ fontSize: 49 }).append(node.col);
            $("#maintenance_status_table_row_content").empty().css({ fontSize: 49 }).append(node.row);
            $("#maintenance_status_table_sid_content").empty().css({ fontSize: 49 }).append(node.sectionId);
            $("#maintenance_status_table_scol_content").empty().css({ fontSize: 49 }).append(node.sectionCol);
            $("#maintenance_status_table_srow_content").empty().css({ fontSize: 49 }).append(node.sectionRow);
            $("#maintenance_status_table_cid_content").empty().css({ fontSize: 35 }).append(node.connectionId);
            $("#maintenance_status_table_pid_content").empty().css({ fontSize: 35 }).append(node.peerId);
            $("#maintenance_status_table_h_content").empty().css({ fontSize: 49 }).append((node.aggregatedConnectionHealth * 25) + "%");



            if (node.sectionId > 0) {
                $("#maintenance_status_table_sid").css("background", "#2A9FD6");
                $("#maintenance_status_table_scol").css("background", "#2A9FD6");
                $("#maintenance_status_table_srow").css("background", "#2A9FD6");
            } else {
                $("#maintenance_status_table_sid").css("background", "#111");
                $("#maintenance_status_table_scol").css("background", "#111");
                $("#maintenance_status_table_srow").css("background", "#111");
            }

            if (node.appInstanceId >= 0) {
                $("#maintenance_status_table_app").css("background", "#2A9FD6");
                $("#maintenance_status_table_instance").css("background", "#2A9FD6");
                $("#maintenance_status_table_configuration").css("background", "#2A9FD6");
                $("#maintenance_status_table_app_content").empty().css({ fontSize: 35 }).append(gdo.net.instance[node.appInstanceId].appName);
                $("#maintenance_status_table_instance_content").empty().css({ fontSize: 49 }).append(node.appInstanceId);
                $("#maintenance_status_table_configuration_content").empty().css({ fontSize: 35 }).append(gdo.net.instance[node.appInstanceId].configName);
            } else {
                $("#maintenance_status_table_app").css("background", "#111");
                $("#maintenance_status_table_instance").css("background", "#111");
                $("#maintenance_status_table_configuration").css("background", "#111");
                $("#maintenance_status_table_app_content").empty().css({ fontSize: 35 }).append("&nbsp;");
                $("#maintenance_status_table_instance_content").empty().css({ fontSize:49 }).append("&nbsp;");
                $("#maintenance_status_table_configuration_content").empty().css({ fontSize: 35 }).append("&nbsp;");
            }

            if (node.isConnectedToCaveServer) {
                $("#maintenance_status_table_cid").css("background", "#559100");
            } else {
                $("#maintenance_status_table_cid").css("background", "#CC0000");
            }
            if (node.isConnectedToPeerServer) {
                $("#maintenance_status_table_pid").css("background", "#559100");
            } else {
                $("#maintenance_status_table_pid").css("background", "#CC0000");
            }

            if (node.aggregatedConnectionHealth == 4) {
                $("#maintenance_status_table_h").css("background", "#559100").css("color", "white");
            } else if (node.aggregatedConnectionHealth == 3) {
                $("#maintenance_status_table_h").css("background", "#DD7700").css("color","black");
            } else if (node.aggregatedConnectionHealth == 2) {
                $("#maintenance_status_table_h").css("background", "#FF8800").css("color", "black");
            } else if (node.aggregatedConnectionHealth == 1) {
                $("#maintenance_status_table_h").css("background", "#CC0000").css("color", "white");
            } else {
                $("#maintenance_status_table_h").css("background", "#CC0000").css("color", "white");
            }
            $("#maintenance_status_table").css({ fontSize: 21 });

        }
    }
    if (gdo.clientId == false) {
        $("#maintenance_status_table_col").css("background", "#FF8800");
        $("#maintenance_status_table_row").css("background", "#FF8800");
        $("#maintenance_status_table_sid").css("background", "#FF8800");
        $("#maintenance_status_table_scol").css("background", "#111");
        $("#maintenance_status_table_srow").css("background", "#111");
        $("#maintenance_status_table_cid").css("background", "#111");
        $("#maintenance_status_table_pid").css("background", "#111");
        $("#maintenance_status_table_h").css("background", "#111");

        $("#maintenance_status_table_app").css("background", "#111").css("border", "2px solid #222");
        $("#maintenance_status_table_instance").css("background", "#111").css("border", "2px solid #222");
        $("#maintenance_status_table_configuration").css("background", "#111").css("border", "2px solid #222");

        $("#maintenance_status_table_col_content").empty().css({ fontSize: 49 }).append("&nbsp;");
        $("#maintenance_status_table_row_content").empty().css({ fontSize: 49 }).append("&nbsp;");
        $("#maintenance_status_table_sid_content").empty().css({ fontSize: 49 }).append("&nbsp;");
        $("#maintenance_status_table_scol_content").empty().css({ fontSize: 49 }).append("&nbsp;");
        $("#maintenance_status_table_srow_content").empty().css({ fontSize: 49 }).append("&nbsp;");
        $("#maintenance_status_table_cid_content").empty().css({ fontSize: 35 }).append("&nbsp;");
        $("#maintenance_status_table_pid_content").empty().css({ fontSize: 35 }).append("&nbsp;");
        $("#maintenance_status_table_h_content").empty().css({ fontSize: 49 }).append("&nbsp;");
        $("#maintenance_status_table_app_content").empty().css({ fontSize: 35 }).append("&nbsp;");
        $("#maintenance_status_table_instance_content").empty().css({ fontSize: 49 }).append("&nbsp;");
        $("#maintenance_status_table_configuration_content").empty().css({ fontSize: 35 }).append("&nbsp;");
        $("#maintenance_status_table_cid").css("background", "#CC0000");
        $("#maintenance_status_table_pid").css("background", "#CC0000");
        $("#maintenance_status_table_h").css("background", "#CC0000").css("color", "white");
        $("#maintenance_status_table").css({ fontSize: 21 });

    }
}
