var table_height = 400;
var table_font_size = 11;
var button_height = 100;
var button_cols = 4;
var isRectangle = true;
var isStarted = false;
var colStart = 1000;
var colEnd = -1;
var rowStart = 1000;
var rowEnd = -1;

function initTest() {
    //create a section
    //
}

function drawEmptyNodeTable(maxCol, maxRow) {
    /// <summary>
    /// Draws the node table.
    /// </summary>
    /// <param name="maxRow">The maximum row.</param>
    /// <param name="maxCol">The maximum col.</param>
    /// <returns></returns>
    //consoleOut('.TEST', 1, 'Drawing Empty Node Table with ' + maxRow + ',' +maxCol);
    $("#node_table").empty();
    for (var i = 0; i < maxRow; i++) {
        $("#node_table").append("<tr id='node_table_row" + i + "' row='"+i+"'></tr>");
        for (var j = 0; j < maxCol; j++) {
            $("#node_table tr:last").append("<td id='node_table_row" + i + "_col" + j + "' col='"+j+"' row='"+i+"'></td>");
        }
    }
}

function updateDisplayCanvas() {
   /// <summary>
   /// Updates the gdo canvas.
   /// </summary>
    /// <returns></returns>

    if (gdo.clientMode == CLIENT_MODE.NODE) {
        drawTestTable();
        $("#test_node").empty().css({fontSize: 140}).css("color", "#FFF").append("GDO Node <b>" + gdo.clientId + "</b>")
    }else if (gdo.clientMode == CLIENT_MODE.CONTROL) {
       // drawNodeTable(gdo.nodeId);
        drawSectionTable();
        drawSectionButtonTable();
    }
}

function drawTestTable() {
    for (var i = 1; i <= gdo.net.cols * gdo.net.rows; i++) {
        var node = gdo.net.node[i];
        $("#node_table_row" + node.row + "_col" + node.col)
            .empty()
            .append("")
            .append("<div id='node" + node.id + "i'> <b>ID:</b> " + node.id + "</div>")
            .append("<b>Col:</b> " + node.col + " | <b>Row:</b> " + node.row)
            .append("<div id='node" + node.id + "s'> <b>SectionID:</b> " + node.sectionId + "</div>")
            .append("<div id='node" + node.id + "p'> <b>PeerID:</b> " + node.peerId + "</div>")
            .append("<div id='node" + node.id + "c'> <b>ConnectionID:</b> " + node.connectionId + "</div>")
            .css({fontSize: table_font_size})
            .css("height", (table_height / gdo.net.rows) + "")
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
            $("#node_table_row" + node.row + "_col" + node.col).css("border", "4px solid #444");
            $("#node_table_row" + node.row + "_col" + node.col).css("background", "#527088");
        } else if (node.isNeighbour) {
            $("#node_table_row" + node.row + "_col" + node.col).css("border", "4px solid #444");
            $("#node_table_row" + node.row + "_col" + node.col).css("background", "#2A4E6C");
        } else {
            $("#node_table_row" + node.row + "_col" + node.col).css("border", "4px solid #444");
            $("#node_table_row" + node.row + "_col" + node.col).css("background", "#222");
        }
        if (node.id == gdo.clientId) {
            $("#status_table_col").css("background", "#222").css("border", "4px solid #444");
            $("#status_table_row").css("background", "#222").css("border", "4px solid #444");
            $("#status_table_sid").css("background", "#222").css("border", "4px solid #444");
            $("#status_table_scol").css("background", "#222").css("border", "4px solid #444");
            $("#status_table_srow").css("background", "#222").css("border", "4px solid #444");
            $("#status_table_cid").css("background", "#222").css("border", "4px solid #444");
            $("#status_table_pid").css("background", "#222").css("border", "4px solid #444");
            $("#status_table_h").css("background", "#222").css("border", "4px solid #444");

            $("#status_table_col_content").empty().css({ fontSize: 49 }).append(node.col);
            $("#status_table_row_content").empty().css({ fontSize: 49 }).append(node.row);
            $("#status_table_sid_content").empty().css({ fontSize: 49 }).append(node.sectionId);
            $("#status_table_scol_content").empty().css({ fontSize: 49 }).append(node.sectionCol);
            $("#status_table_srow_content").empty().css({ fontSize: 49 }).append(node.sectionRow);
            $("#status_table_cid_content").empty().css({ fontSize: 35 }).append(node.connectionId);
            $("#status_table_pid_content").empty().css({ fontSize: 35 }).append(node.peerId);
            $("#status_table_h_content").empty().css({ fontSize: 49 }).append((node.aggregatedConnectionHealth * 25) + "%");

            if (node.sectionId > 0) {
                $("#status_table_sid").css("background", "#2A4E6C");
                $("#status_table_scol").css("background", "#2A4E6C");
                $("#status_table_srow").css("background", "#2A4E6C");
            } else {
                $("#status_table_sid").css("background", "#222");
                $("#status_table_scol").css("background", "#222");
                $("#status_table_srow").css("background", "#222");
            }
            if (node.isConnectedToCaveServer) {
                $("#status_table_cid").css("background", "darkgreen");
            } else {
                $("#status_table_cid").css("background", "darkred");
            }
            if (node.isConnectedToPeerServer) {
                $("#status_table_pid").css("background", "darkgreen");
            } else {
                $("#status_table_pid").css("background", "darkred");
            }

            if (node.aggregatedConnectionHealth == 4) {
                $("#status_table_h").css("background", "darkgreen").css("color", "white");
            } else if (node.aggregatedConnectionHealth == 3) {
                $("#status_table_h").css("background", "yellow").css("color","black");
            } else if (node.aggregatedConnectionHealth == 2) {
                $("#status_table_h").css("background", "lightsalmon").css("color", "black");
            } else if (node.aggregatedConnectionHealth == 1) {
                $("#status_table_h").css("background", "darkred").css("color", "white");
            } else {
                $("#status_table_h").css("background", "darkred").css("color", "white");
            }
            $("#status_table").css({fontSize: 21});
        }
    }
}
