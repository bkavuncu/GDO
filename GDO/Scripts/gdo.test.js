
function initTest() {
    //create a section
    //
}

function drawEmptyTable(maxCol, maxRow) {
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
            $("#browser_table tr:last").append("<td></td>");
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
        drawSectionTable();
    }
}

function drawCaveTable() {
    for (var i = 1; i <= gdo.net.cols * gdo.net.rows; i++) {
        var node = gdo.net.node[i];
        $("#browser_table tr:nth-child(" + (node.row + 1) + ") td:nth-child(" + (node.col + 1) + ")")
            .empty()
            .append("")
            .append("<div id='n" + node.id + "i'> <b>ID:</b> " + node.id + "</div>")
            .append("<b>Col:</b> " + node.col + " | <b>Row:</b> " + node.row)
            .append("<div id='n" + node.id + "s'> <b>SectionID:</b> " + node.sectionId + "</div>")
            .append("<div id='n" + node.id + "p'> <b>PeerID:</b> " + node.peerId + "</div>")
            .append("<div id='n" + node.id + "c'> <b>ConnectionID:</b> " + node.connectionId + "</div>")
            .append("<div id='n" + node.id + "h'> <b>Overall Connection Status</b></div>");

        if (node.aggregatedConnectionHealth == 4) {
            $("#n" + node.id + 'h').css("background", "lightgreen");
        } else if (node.aggregatedConnectionHealth == 3) {
            $("#n" + node.id + 'h').css("background", "yellow");
        } else if (node.aggregatedConnectionHealth == 2) {
            $("#n" + node.id + 'h').css("background", "lightsalmon");
        } else if (node.aggregatedConnectionHealth == 1) {
            $("#n" + node.id + 'h').css("background", "lightcoral");
        } else {
            $("#n" + node.id + 'h').css("background", "lightcoral");
        }
        if (node.isConnectedToCaveServer) {
            $("#n" + node.id + 'c').css("background", "lightgreen");
        } else {
            $("#n" + node.id + 'c').css("background", "lightcoral");
        }
        if (node.sectionId > 0) {
            $("#n" + node.id + 's').css("background", "lightgreen");
        } else {
            $("#n" + node.id + 's').css("background", "lightcoral");
        }
         $("#browser_table tr:nth-child(" + (node.row + 1) + ") td:nth-child(" + (node.col + 1) + ")").css("border", "4px solid #555");
         $("#browser_table tr:nth-child(" + (node.row + 1) + ") td:nth-child(" + (node.col + 1) + ")").css("background", "lightgray");
    }
}

function drawSectionTable() {
    drawEmptyTable(gdo.net.rows, gdo.net.cols);
    for (var i = 1; i <= gdo.net.cols * gdo.net.rows; i++) {
        var node = gdo.net.node[i];
        //section id variable problem
        var sectionId = node.sectionId;
        if (sectionId == 0) {
            $("#browser_table tr:nth-child(" + (node.row + 1) + ") td:nth-child(" + (node.col + 1) + ")")
                .empty()
                .append("<div id='n" + node.id + "i'> <b>ID:</b> " + node.id + "</div>")
                .append("<b>Col:</b> " + node.col + " | <b>Row:</b> " + node.row)
                .append("<div id='n" + node.id + "p'> <b>PeerID:</b> " + node.peerId + "</div>")
                .append("<div id='n" + node.id + "c'> <b>ConnectionID:</b> " + node.connectionId + "</div>")
                .css("border", "2px solid #555")
                .css("background", "lightgray")
                .attr('colspan', 1)
                .attr('rowspan', 1);
            consoleOut('.TEST', 2, 'Added ' + (node.col) + ',' + (node.row));
        } else if (node.sectionCol == 0 || node.sectionRow == 0 && node.sectionId > 0) {
            $("#browser_table tr:nth-child(" + (node.row + 1) + ") td:nth-child(" + (node.col + 1) + ")")
                .empty()
                .attr('colspan', gdo.net.section[sectionId].cols)
                .attr('rowspan', gdo.net.section[sectionId].rows)
                .css("border", "4px solid #333")
                .css("background", "lightskyblue")
                .append("<div id='s" + sectionId + "s'> <b>ID:</b> " + sectionId + "</div>")
                .append("<b>Start Col:</b> " + gdo.net.section[sectionId].col + " | <b>Start Row:</b> " + gdo.net.section[sectionId].row)
                .append("</br><b>End Col:</b> " + (gdo.net.section[sectionId].col + gdo.net.section[sectionId].cols - 1) + " | <b>End Row:</b> " + (gdo.net.section[sectionId].row + gdo.net.section[sectionId].rows - 1));
        }
    }
    for (var i = 1; i <= gdo.net.cols * gdo.net.rows; i++) {
        var node = gdo.net.node[i];
        if ((node.sectionCol != 0 && node.sectionRow != 0) && node.sectionId > 0) {
            consoleOut('.TEST', 2, 'Removed ' + (node.col) + ',' + (node.row ));
            $("#browser_table tr:nth-child(" + (node.row + 1) + ") td:nth-child(" + (node.col + 1) + ")").remove();
            //$("#browser_table tbody").find("tr:eq(" + (node.row + 1) + ")").find("td:eq(" + (node.col + 1) +")").remove();
        }
    }
}

function drawTestTable() {
    for (var i = 1; i <= gdo.net.cols * gdo.net.rows; i++) {
        var node = gdo.net.node[i];
        $("#browser_table tr:nth-child(" + (node.row + 1) + ") td:nth-child(" + (node.col + 1) + ")")
            .empty()
            .append("")
            .append("<div id='n" + node.id + "i'> <b>ID:</b> " + node.id + "</div>")
            .append("<b>Col:</b> " + node.col + " | <b>Row:</b> " + node.row)
            .append("<div id='n" + node.id + "s'> <b>SectionID:</b> " + node.sectionId + "</div>")
            .append("<div id='n" + node.id + "p'> <b>PeerID:</b> " + node.peerId + "</div>")
            .append("<div id='n" + node.id + "c'> <b>ConnectionID:</b> " + node.connectionId + "</div>");
            
        if (node.connectedToPeer || node.id == gdo.clientId) {
            $("#n" + node.id + 'p').css("background", "lightgreen");
        } else {
            $("#n" + node.id + 'p').css("background", "lightcoral");
        }
        if (node.isConnectedToCaveServer) {
            $("#n" + node.id + 'c').css("background", "lightgreen");
        } else {
            $("#n" + node.id + 'c').css("background", "lightcoral");
        }
        if (node.sectionId > 0 && node.sectionId == gdo.net.node[gdo.clientId].sectionId) {
            $("#n" + node.id + 's').css("background", "lightgreen");
        } else if (node.sectionId > 0) {
            $("#n" + node.id + 's').css("background", "lightsalmon");
        } else {
            $("#n" + node.id + 's').css("background", "lightcoral");
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
             .append("<div id='n" + node.id + "i'> <b>ID:</b> " + node.id + "</div>")
             .append("<b>Col:</b> " + node.col + " | <b>Row:</b> " + node.row)
             .append("<div id='n" + node.id + "s'> <b>SectionID:</b> " + node.sectionId + "</div>")
             .append("<div id='n" + node.id + "p'> <b>PeerID:</b> " + node.peerId + "</div>")
             .append("<div id='n" + node.id + "c'> <b>ConnectionID:</b> " + node.connectionId + "</div>");
        if (node.connectedNodeList != null) {
            if (contains(node.connectedNodeList, nodeId) || nodeId == node.id) {
                $("#n" + node.id + 'p').css("background", "lightgreen");
            } else {
                $("#n" + node.id + 'p').css("background", "lightcoral");
            }
        } else {
            $("#n" + node.id + 'p').css("background", "lightcoral");
        }
        if (node.isConnectedToCaveServer) {
            $("#n" + node.id + 'c').css("background", "lightgreen");
        } else {
            $("#n" + node.id + 'c').css("background", "lightcoral");
        }
        if (node.sectionId > 0 && node.sectionId == gdo.net.node[nodeId].sectionId) {
            $("#n" + node.id + 's').css("background", "lightgreen");
        } else if (node.sectionId > 0) {
            $("#n" + node.id + 's').css("background", "lightsalmon");
        } else {
            $("#n" + node.id + 's').css("background", "lightcoral");
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

