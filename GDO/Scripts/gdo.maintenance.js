$(function () {

    gdo.maintenance.table_height = 400;
    gdo.maintenance.table_font_size = 11;
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

gdo.maintenance.drawMaintenanceTable = function() {
    for (var i = 1; i <= gdo.net.cols * gdo.net.rows; i++) {
        var node = gdo.net.node[i];
        $("#maintenance_node_table_row" + node.row + "_col" + node.col)
            .empty()
            .append("")
            .append("<div id='node" + node.id + "i'> <b>ID:</b> " + node.id + "</div>")
            .append("<b>Col:</b> " + node.col + " | <b>Row:</b> " + node.row)
            .append("<div id='node" + node.id + "s'> <b>SectionID:</b> " + node.sectionId + "</div>")
            .append("<div id='node" + node.id + "p'> <b>PeerID:</b> " + node.peerId + "</div>")
            .append("<div id='node" + node.id + "c'> <b>ConnectionID:</b> " + node.connectionId + "</div>")
            .css({ fontSize: gdo.maintenance.table_font_size })
            .css("height", (gdo.maintenance.table_height / gdo.net.rows) + "")
            .css("width", (100 / gdo.net.cols) + "%");
            
        if (node.connectedToPeer || node.id == gdo.clientId) {
            $("#node" + node.id + 'p').css("background", "darkgreen");
        } else {
            $("#node" + node.id + 'p').css("background", "darkred");
        }
        if (node.isConnectedToCaveServer) {
            $("#node" + node.id + 'c').css("background", "darkgreen");
        } else {
            $("#node" + node.id + 'c').css("background", "darkred");
        }
        if (node.sectionId > 0 && node.sectionId == gdo.net.node[gdo.clientId].sectionId) {
            $("#node" + node.id + 's').css("background", "darkgreen");
        } else if (node.sectionId > 0) {
            $("#node" + node.id + 's').css("background", "lightsalmon");
        } else {
            $("#node" + node.id + 's').css("background", "darkred");
        }
        if (node.id == gdo.clientId) {
            $("#maintenance_node_table_row" + node.row + "_col" + node.col).css("border", "4px solid #444");
            $("#maintenance_node_table_row" + node.row + "_col" + node.col).css("background", "#527088");
        } else if (node.isNeighbour) {
            $("#maintenance_node_table_row" + node.row + "_col" + node.col).css("border", "4px solid #444");
            $("#maintenance_node_table_row" + node.row + "_col" + node.col).css("background", "#2A4E6C");
        } else {
            $("#maintenance_node_table_row" + node.row + "_col" + node.col).css("border", "4px solid #444");
            $("#maintenance_node_table_row" + node.row + "_col" + node.col).css("background", "#222");
        }
        if (node.id == gdo.clientId) {
            $("#maintenance_status_table_col").css("background", "#222").css("border", "4px solid #444");
            $("#maintenance_status_table_row").css("background", "#222").css("border", "4px solid #444");
            $("#maintenance_status_table_sid").css("background", "#222").css("border", "4px solid #444");
            $("#maintenance_status_table_scol").css("background", "#222").css("border", "4px solid #444");
            $("#maintenance_status_table_srow").css("background", "#222").css("border", "4px solid #444");
            $("#maintenance_status_table_cid").css("background", "#222").css("border", "4px solid #444");
            $("#maintenance_status_table_pid").css("background", "#222").css("border", "4px solid #444");
            $("#maintenance_status_table_h").css("background", "#222").css("border", "4px solid #444");

            $("#maintenance_status_table_app").css("background", "#222").css("border", "4px solid #444");
            $("#maintenance_status_table_instance").css("background", "#222").css("border", "4px solid #444");
            $("#maintenance_status_table_configuration").css("background", "#222").css("border", "4px solid #444");

            $("#maintenance_status_table_col_content").empty().css({ fontSize: 49 }).append(node.col);
            $("#maintenance_status_table_row_content").empty().css({ fontSize: 49 }).append(node.row);
            $("#maintenance_status_table_sid_content").empty().css({ fontSize: 49 }).append(node.sectionId);
            $("#maintenance_status_table_scol_content").empty().css({ fontSize: 49 }).append(node.sectionCol);
            $("#maintenance_status_table_srow_content").empty().css({ fontSize: 49 }).append(node.sectionRow);
            $("#maintenance_status_table_cid_content").empty().css({ fontSize: 35 }).append(node.connectionId);
            $("#maintenance_status_table_pid_content").empty().css({ fontSize: 35 }).append(node.peerId);
            $("#maintenance_status_table_h_content").empty().css({ fontSize: 49 }).append((node.aggregatedConnectionHealth * 25) + "%");



            if (node.sectionId > 0) {
                $("#maintenance_status_table_sid").css("background", "#2A4E6C");
                $("#maintenance_status_table_scol").css("background", "#2A4E6C");
                $("#maintenance_status_table_srow").css("background", "#2A4E6C");
            } else {
                $("#maintenance_status_table_sid").css("background", "#222");
                $("#maintenance_status_table_scol").css("background", "#222");
                $("#maintenance_status_table_srow").css("background", "#222");
            }

            if (node.appInstanceId >= 0) {
                $("#maintenance_status_table_app").css("background", "#2A4E6C");
                $("#maintenance_status_table_instance").css("background", "#2A4E6C");
                $("#maintenance_status_table_configuration").css("background", "#2A4E6C");
                $("#maintenance_status_table_app_content").empty().css({ fontSize: 35 }).append(gdo.net.instance[node.appInstanceId].appName);
                $("#maintenance_status_table_instance_content").empty().css({ fontSize: 49 }).append(node.appInstanceId);
                $("#maintenance_status_table_configuration_content").empty().css({ fontSize: 35 }).append(gdo.net.instance[node.appInstanceId].configName);
            } else {
                $("#maintenance_status_table_app").css("background", "#222");
                $("#maintenance_status_table_instance").css("background", "#222");
                $("#maintenance_status_table_configuration").css("background", "#222");
                $("#maintenance_status_table_app_content").empty().css({ fontSize: 35 }).append("&nbsp;");
                $("#maintenance_status_table_instance_content").empty().css({ fontSize:49 }).append("&nbsp;");
                $("#maintenance_status_table_configuration_content").empty().css({ fontSize: 35 }).append("&nbsp;");
            }

            if (node.isConnectedToCaveServer) {
                $("#maintenance_status_table_cid").css("background", "darkgreen");
            } else {
                $("#maintenance_status_table_cid").css("background", "darkred");
            }
            if (node.isConnectedToPeerServer) {
                $("#maintenance_status_table_pid").css("background", "darkgreen");
            } else {
                $("#maintenance_status_table_pid").css("background", "darkred");
            }

            if (node.aggregatedConnectionHealth == 4) {
                $("#maintenance_status_table_h").css("background", "darkgreen").css("color", "white");
            } else if (node.aggregatedConnectionHealth == 3) {
                $("#maintenance_status_table_h").css("background", "yellow").css("color","black");
            } else if (node.aggregatedConnectionHealth == 2) {
                $("#maintenance_status_table_h").css("background", "lightsalmon").css("color", "black");
            } else if (node.aggregatedConnectionHealth == 1) {
                $("#maintenance_status_table_h").css("background", "darkred").css("color", "white");
            } else {
                $("#maintenance_status_table_h").css("background", "darkred").css("color", "white");
            }
            $("#maintenance_status_table").css({fontSize: 21});
        }
    }
}
