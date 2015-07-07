var table_height = 400;
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

function drawEmptyButtonTable(maxCol, maxRow) {
    /// <summary>
    /// Draws the button table.
    /// </summary>
    /// <param name="maxRow">The maximum row.</param>
    /// <param name="maxCol">The maximum col.</param>
    /// <returns></returns>
    //consoleOut('.TEST', 1, 'Drawing Empty Button Table with ' + maxRow + ',' + maxCol);
    $("#button_table").empty();
    for (var i = 0; i < maxRow; i++) {
        $("#button_table").append("<tr id='button_table_row" + i + "' row='" + i + "'></tr>");
        for (var j = 0; j < maxCol; j++) {
            $("#button_table tr:last").append("<td id='button_table_row" + i + "_col" + j + "' col='" + j + "' row='" + i + "'></td>");
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
       // drawNodeTable(gdo.nodeId);
        drawSectionTable();
        drawSectionButtonTable();
    }
}

function drawCaveTable() {
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
            .append("<div id='node" + node.id + "h'> <b>Overall Connection Status</b></div>")
            .css("height", (table_height / gdo.net.rows) + "")
            .css("width", (100 / gdo.net.cols) + "%");

        if (node.aggregatedConnectionHealth == 4) {
            $("#node" + node.id + 'h').css("background", "lightgreen");
        } else if (node.aggregatedConnectionHealth == 3) {
            $("#node" + node.id + 'h').css("background", "yellow");
        } else if (node.aggregatedConnectionHealth == 2) {
            $("#node" + node.id + 'h').css("background", "lightsalmon");
        } else if (node.aggregatedConnectionHealth == 1) {
            $("#node" + node.id + 'h').css("background", "lightcoral");
        } else {
            $("#node" + node.id + 'h').css("background", "lightcoral");
        }
        if (node.isConnectedToCaveServer) {
            $("#node" + node.id + 'c').css("background", "lightgreen");
        } else {
            $("#node" + node.id + 'c').css("background", "lightcoral");
        }
        if (node.sectionId > 0) {
            $("#node" + node.id + 's').css("background", "lightgreen");
        } else {
            $("#node" + node.id + 's').css("background", "lightcoral");
        }
        $("#node_table_row" + node.row + "_col" + node.col).css("border", "4px solid #555");
        $("#node_table_row" + node.row + "_col" + node.col).css("background", "lightgray");
    }
}

function drawSectionTable() {
    drawEmptyNodeTable(gdo.net.cols, gdo.net.rows);

    for (var i = 1; i <= gdo.net.cols * gdo.net.rows; i++) {
        var node = gdo.net.node[i];
        var sectionId = node.sectionId;
        $("#node_table_row" + node.row + "_col" + node.col)
                .empty()
                .append("<div id='node" + node.id + "i'> <b>ID:</b> " + node.id + "</div>")
                .append("<b>Col:</b> " + node.col + " | <b>Row:</b> " + node.row)
                .append("<div id='node" + node.id + "p'> <b>PeerID:</b> " + node.peerId + "</div>")
                .append("<div id='node" + node.id + "c'> <b>ConnectionID:</b> " + node.connectionId + "</div>")
                .css("height", (table_height / gdo.net.rows) + "")
                .css("width", (100 / gdo.net.cols) + "%")
                .css("border", "2px solid #555")
                .css("background", "lightgray")
                .click(function () {
                    var id = getNodeId( $(this).attr('col'), $(this).attr('row'))
                    if (net.node[id].isSelected) {
                        net.node[id].isSelected = false;
                    } else {
                        net.node[id].isSelected = true;
                    }
                    updateDisplayCanvas();
                });
        if (node.isSelected) {
            $("#node_table_row" + node.row + "_col" + node.col).css("background-color", "gray");
        }
        if ((node.sectionCol == 0 && node.sectionRow == 0) && node.sectionId > 0) {
            $("#node_table_row" + node.row + "_col" + node.col)
                .empty()
                .attr('colspan', gdo.net.section[sectionId].cols)
                .attr('rowspan', gdo.net.section[sectionId].rows)
                .css("height", ((table_height / gdo.net.rows) * gdo.net.section[sectionId].rows) + "")
                .css("width", (100 / gdo.net.cols) + "%")
                .css("border", "4px solid #333")
                .css("background", "lightskyblue")
                .append("<div id='section" + sectionId + "s'> <b>Section ID:</b> " + sectionId + "</div>")
                .append("<b>Start Col:</b> " + gdo.net.section[sectionId].col + " | <b>Start Row:</b> " + gdo.net.section[sectionId].row)
                .append("</br><b>End Col:</b> " + (gdo.net.section[sectionId].col + gdo.net.section[sectionId].cols - 1) + " | <b>End Row:</b> " + (gdo.net.section[sectionId].row + gdo.net.section[sectionId].rows - 1))
                .append("<div id='section" + sectionId + "h'> <b> Overall Connection Health</b></div>")
                .click(function () {
                    var id = net.node[getNodeId($(this).attr('col'), $(this).attr('row'))].sectionId;
                    if (net.section[id].isSelected) {
                        net.section[id].isSelected = false;
                    } else {
                        net.section[id].isSelected = true;
                    }
                    updateDisplayCanvas();
                });
            if (gdo.net.section[sectionId].isSelected) {
                $("#node_table_row" + node.row + "_col" + node.col).css("background-color", "dodgerblue");
            }
            if (gdo.net.section[sectionId].health >= 4) {
                $("#section" + sectionId + 'h').css("background", "lightgreen");
            } else if (gdo.net.section[sectionId].health >= 3) {
                $("#section" + sectionId + 'h').css("background", "yellow");
            } else if (gdo.net.section[sectionId].health >= 2) {
                $("#section" + sectionId + 'h').css("background", "lightsalmon");
            } else if (gdo.net.section[sectionId].health >= 1) {
                $("#section" + sectionId + 'h').css("background", "lightcoral");
            } else {
                $("#section" + sectionId + 'h').css("background", "lightcoral");
            }
        }
        if ((node.sectionCol != 0 || node.sectionRow != 0) && node.sectionId > 0) {
            $("#node_table_row" + node.row + "_col" + node.col).remove();
            }
    }
}

function drawSectionButtonTable() {

    //Create Section
    $("#button_table_row0_col0")
        .empty()
        .append("<div id='buttonCreateSection'> <b>Create Section</b></div>")
        .css("height", button_height)
        .css("width", (100 / button_cols) + "%")
        .css("border", "3px solid #555")
        .css("background", "lightskyblue");
        
    isRectangle = true;
    isStarted = false;
    colStart = 1000;
    colEnd = -1;
    rowStart = 1000;
    rowEnd = -1;
    for (var i = 1; i <= gdo.net.cols * gdo.net.rows; i++) {
        var node = gdo.net.node[i];
        if (node.isSelected) {
            isStarted = true;
            if (node.col <= colStart) {
                colStart = node.col;
            }
            if (node.row <= rowStart) {
                rowStart = node.row;
            }
            if (node.col >= colEnd) {
                colEnd = node.col;
            }
            if (node.row >= rowEnd) {
                rowEnd = node.row;
            }
        }
    }
    for (var i = colStart; i <= colEnd; i++) {
        for (var j = rowStart; j <= rowEnd; j++) {
            var node = gdo.net.node[getNodeId(i,j)];
            if (!node.isSelected) {
                isRectangle = false;
            }
        }
    }
    $("#button_table_row0_col0").click(function () {
        if (isRectangle && isStarted){
            gdo.net.server.createSection(colStart, rowStart, colEnd, rowEnd);
            for (var i = colStart; i <= colEnd; i++) {
                for (var j = rowStart; j <= rowEnd; j++) {
                    var node = gdo.net.node[getNodeId(i, j)];
                    node.isSelected = false;
                }
            }
            consoleOut('.TEST', 1, 'Requested Creation of Section at (' + colStart + ',' + rowStart + '),(' + colEnd + ',' + rowEnd + ')');
        } else {
            
        }
    });
    if (isStarted) {
        if (isRectangle) {
            $("#button_table_row0_col0")
                .css("background", "lightgreen");
        } else {
            $("#button_table_row0_col0")
                .css("background", "lightcoral");
        }
    } else {
        $("#button_table_row0_col0")
            .css("background", "lightblue");
    }

    //Dispose Section

    $("#button_table_row0_col1")
        .empty()
        .append("<div id='buttonDisposeSection'> <b>Dispose Section</b></div>")
        .css("height", button_height)
        .css("width", (100 / button_cols) + "%")
        .css("border", "3px solid #555")
        .css("background", "lightblue")
        .click(function () {
            for (var i = 1; i < (gdo.net.cols * gdo.net.rows) ; i++) {
                if (gdo.net.section[i].isSelected) {
                    gdo.net.section[i].isSelected = false;
                    for (var j = 1; j <= gdo.net.cols * gdo.net.rows; j++) {
                        var node = gdo.net.node[j];
                        if (node.sectionId == i) {
                            node.isSelected = false;
                        }
                    }
                    gdo.net.server.disposeSection(i);
                    consoleOut('.TEST', 1, 'Requested Disposal of Section ' + i);
                }
            }
        });

    for (var i = 1; i < (gdo.net.cols * gdo.net.rows) ; i++) {
        if (gdo.net.section[i].isSelected) {
            $("#button_table_row0_col1").css("background", "lightgreen");
        }
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

function drawNodeTable(nodeId) {
    var table = document.getElementById("node_table");
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
        $("#node_table_row" + node.row + "_col" + node.col)
             .empty()
             .append("<div id='node" + node.id + "i'> <b>ID:</b> " + node.id + "</div>")
             .append("<b>Col:</b> " + node.col + " | <b>Row:</b> " + node.row)
             .append("<div id='node" + node.id + "s'> <b>SectionID:</b> " + node.sectionId + "</div>")
             .append("<div id='node" + node.id + "p'> <b>PeerID:</b> " + node.peerId + "</div>")
             .append("<div id='node" + node.id + "c'> <b>ConnectionID:</b> " + node.connectionId + "</div>")
             .css("height", (table_height / gdo.net.rows) + "")
             .css("width", (100 / gdo.net.cols) + "%");
        if (node.connectedNodeList != null) {
            if (contains(node.connectedNodeList, nodeId) || nodeId == node.id) {
                $("#node" + node.id + 'p').css("background", "lightgreen");
            } else {
                $("#node" + node.id + 'p').css("background", "lightcoral");
            }
        } else {
            $("#node" + node.id + 'p').css("background", "lightcoral");
        }
        if (node.isConnectedToCaveServer) {
            $("#node" + node.id + 'c').css("background", "lightgreen");
        } else {
            $("#node" + node.id + 'c').css("background", "lightcoral");
        }
        if (node.sectionId > 0 && node.sectionId == gdo.net.node[nodeId].sectionId) {
            $("#node" + node.id + 's').css("background", "lightgreen");
        } else if (node.sectionId > 0) {
            $("#node" + node.id + 's').css("background", "lightsalmon");
        } else {
            $("#node" + node.id + 's').css("background", "lightcoral");
        }
        if (node.id == nodeId) {
            $("#node_table_row" + node.row + "_col" + node.col).css("border", "4px solid #555");
            $("#node_table_row" + node.row + "_col" + node.col).css("background", "lightskyblue");
        } else if (isNeighbourOf(node.id, nodeId)) {
            $("#node_table_row" + node.row + "_col" + node.col).css("border", "4px solid #555");
            $("#node_table_row" + node.row + "_col" + node.col).css("background", "lightblue");
        } else {
            $("#node_table_row" + node.row + "_col" + node.col).css("border", "4px solid #555");
            $("#node_table_row" + node.row + "_col" + node.col).css("background", "lightgray");
        }
    }
}

