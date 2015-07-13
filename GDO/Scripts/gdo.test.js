var table_height = 400;
var table_font_size = 70;
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
        $("#test_node").empty().css("font-size", "140").css("color", "~777").append("GDO Test Node <b>" + gdo.clientId + "</b>")
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
            .css("font-size", table_font_size + "%")
            .css("height", (table_height / gdo.net.rows) + "")
            .css("width", (100 / gdo.net.cols) + "%");
            
        if (node.connectedToPeer || node.id == gdo.clientId) {
            $("#node" + node.id + 'p').css("background", "lightgreen");
        } else {
            $("#node" + node.id + 'p').css("background", "lightcoral");
        }
        if (node.isConnectedToCaveServer) {
            $("#node" + node.id + 'c').css("background", "lightgreen");
        } else {
            $("#node" + node.id + 'c').css("background", "lightcoral");
        }
        if (node.sectionId > 0 && node.sectionId == gdo.net.node[gdo.clientId].sectionId) {
            $("#node" + node.id + 's').css("background", "lightgreen");
        } else if (node.sectionId > 0) {
            $("#node" + node.id + 's').css("background", "lightsalmon");
        } else {
            $("#node" + node.id + 's').css("background", "lightcoral");
        }
        if (node.id == gdo.clientId) {
            $("#node_table_row" + node.row + "_col" + node.col).css("border", "4px solid #555");
            $("#node_table_row" + node.row + "_col" + node.col).css("background", "lightskyblue");
        } else if (node.isNeighbour) {
            $("#node_table_row" + node.row + "_col" + node.col).css("border", "4px solid #555");
            $("#node_table_row" + node.row + "_col" + node.col).css("background", "lightblue");
        } else {
            $("#node_table_row" + node.row + "_col" + node.col).css("border", "4px solid #555");
            $("#node_table_row" + node.row + "_col" + node.col).css("background", "lightgray");
        }
    }
}
