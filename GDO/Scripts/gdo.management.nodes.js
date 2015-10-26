gdo.management.drawEmptyNodeTable = function (maxCol, maxRow) {
    /// <summary>
    /// Draws the node table.
    /// </summary>
    /// <param name="maxRow">The maximum row.</param>
    /// <param name="maxCol">The maximum col.</param>
    /// <returns></returns>
    //gdo.consoleOut('.MANAGEMENT', 1, 'Drawing Empty Node Table with ' + maxRow + ',' +maxCol);
    $("#node_table").empty();
    for (var i = 0; i < maxRow; i++) {
        $("#node_table").append("<tr id='node_table_row_" + i + "' row='" + i + "'></tr>");
        for (var j = 0; j < maxCol; j++) {
            $("#node_table tr:last").append("<td id='node_table_row_" + i + "_col_" + j + "' col='" + j + "' row='" + i + "'></td>");
        }
    }
}

gdo.management.drawNodeTable = function (nodeId) {
    /// <summary>
    /// Draws the node table.
    /// </summary>
    /// <param name="nodeId">The node identifier.</param>
    /// <returns></returns>

    var table = document.getElementById("node_table");
    if (table != null) {
        for (var i = 0; i < table.rows.length; i++) {
            for (var j = 0; j < table.rows[i].cells.length; j++) {
                table.rows[i].cells[j].onclick = (function (i, j) {
                    return function () {
                        gdo.nodeId = gdo.net.getNodeId(j, i);
                        gdo.management.drawNodeTable(gdo.nodeId);
                    };
                }(i, j));
            }
        }
    }
    for (var i = 1; i <= gdo.net.cols * gdo.net.rows; i++) {
        var node = gdo.net.node[i];
        $("#node_table_row_" + node.row + "_col_" + node.col)
             .empty()
             .css("vertical-align","top")
             .append("<div id='node_table_node_" + node.id + "_i' style='text-align:center;background:#444'> <font size='4px'><b> " + node.id + "</b></font></div>")
             .append("<b>Col:</b> " + node.col + " | <b>Row:</b> " + node.row)
             .append("<div id='node_table_node_" + node.id + "_s'> <b>Section ID:</b> " + node.sectionId + "</div>")
             //.append("<div id='node_table_node_" + node.id + "_p'> <b>Peer ID:</b> " + node.peerId + "</div>")
             //.append("<div id='node_table_node_" + node.id + "_c'> <b>Conn ID:</b> " + node.connectionId + "</div>")
             .append("<div id='node_table_node_" + node.id + "_p'> <b>Peer Conn</b></div>")
             .append("<div id='node_table_node_" + node.id + "_c'> <b>Server Conn</b></div>")
             .append("<div id='node_table_node_" + node.id + "_h'> <b>Node Health</b></div>")
             .css("height", (gdo.management.table_height / gdo.net.rows) + "")
             .css("width", (gdo.management.table_width / gdo.net.cols) + "%")
             .css({ fontSize: gdo.management.table_font_size })
             .css('padding', 0);
        if (node.id == gdo.nodeId) {
            $("#selected_node_id").empty().append("<b>Node Id:</b> " + node.id).css("width", 7 + "%").css("height", gdo.management.info_height);
            $("#selected_node_col").empty().append("<b>Col:</b> " + node.col).css("width", 5 + "%").css("height", gdo.management.info_height);
            $("#selected_node_row").empty().append("<b>Row:</b> " + node.row).css("width", 5 + "%").css("height", gdo.management.info_height);
            $("#selected_node_sid").empty().append("<b>Section Id:</b> " + node.sectionId).css("width", 7 + "%").css("height", gdo.management.info_height);
            $("#selected_node_scol").empty().append("<b>Section Col:</b> " + node.sectionCol).css("width", 10 + "%").css("height", gdo.management.info_height);
            $("#selected_node_srow").empty().append("<b>Section Row:</b> " + node.sectionRow).css("width", 10 + "%").css("height", gdo.management.info_height);
            $("#selected_node_cid").empty().append("<b>Connection Id:</b> " + node.connectionId).css("width", 20 + "%").css("height", gdo.management.info_height);
            $("#selected_node_pid").empty().append("<b>Peer Id:</b> " + node.peerId).css("width", 10 + "%").css("height", gdo.management.info_height);
            $("#selected_node_h").empty().append("<b>Node Health:</b> " + (node.aggregatedConnectionHealth * 25) + "%").css("width", 10 + "%").css("height", gdo.management.info_height);
            if (node.isConnectedToCaveServer) {
                $("#selected_node_cid").css("background", "darkgreen");
            } else {
                $("#selected_node_cid").css("background", "darkred");
            }
            if (node.isConnectedToPeerServer) {
                $("#selected_node_pid").css("background", "darkgreen");
            } else {
                $("#selected_node_pid").css("background", "darkred");
            }
            if (node.aggregatedConnectionHealth == 4) {
                $("#selected_node_h").css("background", "darkgreen");
            } else if (node.aggregatedConnectionHealth == 3) {
                $("#selected_node_h").css("background", "goldenrod");
            } else if (node.aggregatedConnectionHealth == 2) {
                $("#selected_node_h").css("background", "coral");
            } else if (node.aggregatedConnectionHealth == 1) {
                $("#selected_node_h").css("background", "darkred");
            } else {
                $("#selected_node_h").css("background", "darkred");
            }
        }
        var forward = false;
        var reverse = false;
        if (gdo.net.node[nodeId].connectedNodeList != null) {
            if (contains(gdo.net.node[nodeId].connectedNodeList, node.id)) {
                forward = true;
            }
        }
        if (node.connectedNodeList != null) {
            if (contains(node.connectedNodeList, nodeId)) {
                reverse = true;
            }
        }
        if (node.aggregatedConnectionHealth == 4) {
            $("#node_table_node_" + node.id + '_h').css("background", "darkgreen");
        } else if (node.aggregatedConnectionHealth == 3) {
            $("#node_table_node_" + node.id + '_h').css("background", "goldenrod");
        } else if (node.aggregatedConnectionHealth == 2) {
            $("#node_table_node_" + node.id + '_h').css("background", "coral");
        } else if (node.aggregatedConnectionHealth == 1) {
            $("#node_table_node_" + node.id + '_h').css("background", "darkred");
        } else {
            $("#node_table_node_" + node.id + '_h').css("background", "darkred");
        }
        if (forward && reverse || (nodeId == node.id && node.peerId != null)) {
            $("#node_table_node_" + node.id + '_p').css("background", "darkgreen");
        } else if (forward || reverse) {
            $("#node_table_node_" + node.id + '_p').css("background", "coral");
        } else {
            $("#node_table_node_" + node.id + '_p').css("background", "darkred");
        }
        if (node.isConnectedToCaveServer) {
            $("#node_table_node_" + node.id + '_c').css("background", "darkgreen");
        } else {
            $("#node_table_node_" + node.id + '_c').css("background", "darkred");
        }
        if (node.sectionId > 0 && node.sectionId == gdo.net.node[nodeId].sectionId) {
            $("#node_table_node_" + node.id + '_s').css("background", "darkgreen");
        } else if (node.sectionId > 0) {
            $("#node_table_node_" + node.id + '_s').css("background", "coral");
        } else {
            $("#node_table_node_" + node.id + '_s').css("background", "darkred");
        }
        if (node.id == nodeId) {
            $("#node_table_row_" + node.row + "_col_" + node.col).css("border", "1px solid #333");
            $("#node_table_node_" + node.id + "_i").css("background", "#7492aa");
            $("#node_table_row_" + node.row + "_col_" + node.col).css("background", "#527088");
        } else if (gdo.net.isNeighbourOf(node.id, nodeId)) {
            $("#node_table_row_" + node.row + "_col_" + node.col).css("border", "1px solid #333");
            $("#node_table_node_" + node.id + "_i").css("background", "#527088");
            $("#node_table_row_" + node.row + "_col_" + node.col).css("background", "#2A4E6C");
        } else {
            $("#node_table_row_" + node.row + "_col_" + node.col).css("border", "1px solid #333");
            $("#node_table_node_" + node.id + "_i").css("background", "#333");
            $("#node_table_row_" + node.row + "_col_" + node.col).css("background", "#222");
        }
    }
}

