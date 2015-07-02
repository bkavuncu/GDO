
function initTest() {
    //create a section
    //
}

function drawEmptyTable(maxRow, maxCol) {
    /// <summary>
    /// Draws the cave table.
    /// </summary>
    /// <param name="maxRow">The maximum row.</param>
    /// <param name="maxCol">The maximum col.</param>
    /// <returns></returns>
    consoleOut('.TEST', 1, 'Drawing Empty Table with ' + maxRow + ',' +maxCol);
    $("#browser_table").empty();
    for (var i = 0; i < maxCol; i++) {
        $("#browser_table").append("<tr></tr>");
        for (var j = 0; j < maxRow; j++) {
            $("#browser_table tr:last").append("<td>(" + (j + 1) + "," + (i + 1) + ")</td>");
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
    }else if (gdo.clientMode == CLIENT_MODE.CONTROL) {
        //drawNodeTable(gdo.nodeId);
        drawCaveTable();
    }
}

function drawCaveTable() {
    for (var i = 1; i <= gdo.net.cols * gdo.net.rows; i++) {
        var node = gdo.net.node[i];
        $("#browser_table tr:nth-child(" + (node.row + 1) + ") td:nth-child(" + (node.col + 1) + ")")
            .empty()
            .append("")
            .append("<div id='" + node.id + "i'> <b>ID:</b> " + node.id + "</div>")
            .append("<b>Col:</b> " + node.col + " | <b>Row:</b> " + node.row)
            .append("<div id='" + node.id + "s'> <b>SectionID:</b> " + node.sectionId + "</div>")
            .append("<div id='" + node.id + "p'> <b>PeerID:</b> " + node.peerId + "</div>")
            .append("<div id='" + node.id + "c'> <b>ConnectionID:</b> " + node.connectionId + "</div>")
            .append("<div id='" + node.id + "h'> <b>Overall Connection Status</b></div>");

        if (node.aggregatedConnectionHealth) {
            $("#" + node.id + 'h').css("background", "lightgreen");
        } else {
            $("#" + node.id + 'h').css("background", "lightcoral");
        }
        if (node.isConnectedToCaveServer) {
            $("#" + node.id + 'c').css("background", "lightgreen");
        } else {
            $("#" + node.id + 'c').css("background", "lightcoral");
        }
        if (node.sectionId > 0) {
            $("#" + node.id + 's').css("background", "lightgreen");
        } else {
            $("#" + node.id + 's').css("background", "lightcoral");
        }
         $("#browser_table tr:nth-child(" + (node.row + 1) + ") td:nth-child(" + (node.col + 1) + ")").css("border", "4px solid #555");
         $("#browser_table tr:nth-child(" + (node.row + 1) + ") td:nth-child(" + (node.col + 1) + ")").css("background", "lightgray");
    }
}

function drawSectionTable() {
    
}

function drawTestTable() {
    for (var i = 1; i <= gdo.net.cols * gdo.net.rows; i++) {
        var node = gdo.net.node[i];
        $("#browser_table tr:nth-child(" + (node.row + 1) + ") td:nth-child(" + (node.col + 1) + ")")
            .empty()
            .append("")
            .append("<div id='" + node.id + "i'> <b>ID:</b> " + node.id + "</div>")
            .append("<b>Col:</b> " + node.col + " | <b>Row:</b> " + node.row)
            .append("<div id='" + node.id + "s'> <b>SectionID:</b> " + node.sectionId + "</div>")
            .append("<div id='" + node.id + "p'> <b>PeerID:</b> " + node.peerId + "</div>")
            .append("<div id='" + node.id + "c'> <b>ConnectionID:</b> " + node.connectionId + "</div>");
            
        if (node.connectedToPeer || node.id == gdo.clientId) {
            $("#" + node.id + 'p').css("background", "lightgreen");
        } else {
            $("#" + node.id + 'p').css("background", "lightcoral");
        }
        if (node.isConnectedToCaveServer) {
            $("#" + node.id + 'c').css("background", "lightgreen");
        } else {
            $("#" + node.id + 'c').css("background", "lightcoral");
        }
        if (node.sectionId > 0 && node.sectionId == gdo.net.node[gdo.clientId].sectionId) {
            $("#" + node.id + 's').css("background", "lightgreen");
        } else if (node.sectionId > 0) {
            $("#" + node.id + 's').css("background", "lightsalmon");
        } else {
            $("#" + node.id + 's').css("background", "lightcoral");
        }
        if (node.id == gdo.clientId) {
            $("#browser_table tr:nth-child(" + (node.row + 1) + ") td:nth-child(" + (node.col + 1) + ")").css("border", "4px solid #555");
            $("#browser_table tr:nth-child(" + (node.row + 1) + ") td:nth-child(" + (node.col + 1) + ")").css("background", "lightskyblue");
        } else if (node.isNeighbour) {
            $("#browser_table tr:nth-child(" + (node.row + 1) + ") td:nth-child(" + (node.col + 1) + ")").css("border", "4px solid #555");
            $("#browser_table tr:nth-child(" + (node.row + 1) + ") td:nth-child(" + (node.col + 1) + ")").css("background", "lightblue");
        } else {
            $("#browser_table tr:nth-child(" + (node.row + 1) + ") td:nth-child(" + (node.col + 1) + ")").css("border", "4px solid #555");
            $("#browser_table tr:nth-child(" + (node.row + 1) + ") td:nth-child(" + (node.col + 1) + ")").css("background", "lightgray");
        }
    }
}

function drawNodeTable(nodeId) {
    var table = document.getElementById("browser_table");
    if (table != null) {
        for (var i = 0; i < table.rows.length; i++) {
            for (var j = 0; j < table.rows[i].cells.length; j++) {
                table.rows[i].cells[j].onclick = (function(i, j) {
                    return function() {
                        gdo.nodeId = getNodeId(j, i);
                        drawNodeTable(gdo.nodeId);
                    };
                }(i, j));
            }
        }
    }
    for (var i = 1; i <= gdo.net.cols * gdo.net.rows; i++) {
        var node = gdo.net.node[i];
        $("#browser_table tr:nth-child(" + (node.row + 1) + ") td:nth-child(" + (node.col + 1) + ")")
             .empty()
             .append("<div id='" + node.id + "i'> <b>ID:</b> " + node.id + "</div>")
             .append("<b>Col:</b> " + node.col + " | <b>Row:</b> " + node.row)
             .append("<div id='" + node.id + "s'> <b>SectionID:</b> " + node.sectionId + "</div>")
             .append("<div id='" + node.id + "p'> <b>PeerID:</b> " + node.peerId + "</div>")
             .append("<div id='" + node.id + "c'> <b>ConnectionID:</b> " + node.connectionId + "</div>");
        if (node.connectedNodeList != null) {
            if (contains(node.connectedNodeList, nodeId) || nodeId == node.id) {
                $("#" + node.id + 'p').css("background", "lightgreen");
            } else {
                $("#" + node.id + 'p').css("background", "lightcoral");
            }
        } else {
            $("#" + node.id + 'p').css("background", "lightcoral");
        }
        if (node.isConnectedToCaveServer) {
            $("#" + node.id + 'c').css("background", "lightgreen");
        } else {
            $("#" + node.id + 'c').css("background", "lightcoral");
        }
        if (node.sectionId > 0 && node.sectionId == gdo.net.node[nodeId].sectionId) {
            $("#" + node.id + 's').css("background", "lightgreen");
        } else if (node.sectionId > 0) {
            $("#" + node.id + 's').css("background", "lightsalmon");
        } else {
            $("#" + node.id + 's').css("background", "lightcoral");
        }
        if (node.id == nodeId) {
            $("#browser_table tr:nth-child(" + (node.row + 1) + ") td:nth-child(" + (node.col + 1) + ")").css("border", "4px solid #555");
            $("#browser_table tr:nth-child(" + (node.row + 1) + ") td:nth-child(" + (node.col + 1) + ")").css("background", "lightskyblue");
        } else if (isNeighbourOf(node.id, nodeId)) {
            $("#browser_table tr:nth-child(" + (node.row + 1) + ") td:nth-child(" + (node.col + 1) + ")").css("border", "4px solid #555");
            $("#browser_table tr:nth-child(" + (node.row + 1) + ") td:nth-child(" + (node.col + 1) + ")").css("background", "lightblue");
        } else {
            $("#browser_table tr:nth-child(" + (node.row + 1) + ") td:nth-child(" + (node.col + 1) + ")").css("border", "4px solid #555");
            $("#browser_table tr:nth-child(" + (node.row + 1) + ") td:nth-child(" + (node.col + 1) + ")").css("background", "lightgray");
        }
    }
}

