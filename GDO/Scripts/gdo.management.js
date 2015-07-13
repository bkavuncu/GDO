var table_font_size = 70;
var button_font_size = 90;
var table_height = 340;
var table_width = 100;
var button_height = 70;
var button_cols = 4;
var cell_padding = 7;
var isRectangle = true;
var isStarted = false;
var colStart = 1000;
var colEnd = -1;
var rowStart = 1000;
var rowEnd = -1;


function drawEmptySectionTable(maxCol, maxRow) {
    /// <summary>
    /// Draws the section table.
    /// </summary>
    /// <param name="maxRow">The maximum row.</param>
    /// <param name="maxCol">The maximum col.</param>
    /// <returns></returns>
    
    $("#section_table").empty();
    for (var i = 0; i < maxRow; i++) {
        $("#section_table").append("<tr id='section_table_row_" + i + "' row='" + i + "'></tr>");
        for (var j = 0; j < maxCol; j++) {
            $("#section_table tr:last").append("<td id='section_table_row_" + i + "_col_" + j + "' col='" + j + "' row='" + i + "'></td>");
        }
    }
}

function drawEmptyNodeTable(maxCol, maxRow) {
    /// <summary>
    /// Draws the node table.
    /// </summary>
    /// <param name="maxRow">The maximum row.</param>
    /// <param name="maxCol">The maximum col.</param>
    /// <returns></returns>
    //consoleOut('.MAN', 1, 'Drawing Empty Node Table with ' + maxRow + ',' +maxCol);
    $("#node_table").empty();
    for (var i = 0; i < maxRow; i++) {
        $("#node_table").append("<tr id='node_table_row_" + i + "' row='"+i+"'></tr>");
        for (var j = 0; j < maxCol; j++) {
            $("#node_table tr:last").append("<td id='node_table_row_" + i + "_col_" + j + "' col='"+j+"' row='"+i+"'></td>");
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
    //consoleOut('.MAN', 1, 'Drawing Empty Button Table with ' + maxRow + ',' + maxCol);
    $("#button_table").empty();
    for (var i = 0; i < maxRow; i++) {
        $("#button_table").append("<tr id='button_table_row_" + i + "' row='" + i + "'></tr>");
        for (var j = 0; j < maxCol; j++) {
            $("#button_table tr:last").append("<td id='button_table_row_" + i + "_col_" + j + "' col='" + j + "' row='" + i + "'></td>");
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
        drawNodeTable(gdo.nodeId);
        drawSectionTable();
        drawButtonTable();
    }
}

function drawNodeTable(nodeId) {
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
                        gdo.nodeId = getNodeId(j, i);
                        drawNodeTable(gdo.nodeId);
                    };
                }(i, j));
            }
        }
    }
    for (var i = 1; i <= gdo.net.cols * gdo.net.rows; i++) {
        var node = gdo.net.node[i];
        $("#node_table_row_" + node.row + "_col_" + node.col)
             .empty()
             .append("<div id='node_table_node_" + node.id + "_i'> <b>ID:</b> " + node.id + "</div>")
             .append("<b>Col:</b> " + node.col + " | <b>Row:</b> " + node.row)
             .append("<div id='node_table_node_" + node.id + "_s'> <b>Section ID:</b> " + node.sectionId + "</div>")
             //.append("<div id='node_table_node_" + node.id + "_p'> <b>Peer ID:</b> " + node.peerId + "</div>")
             //.append("<div id='node_table_node_" + node.id + "_c'> <b>Conn ID:</b> " + node.connectionId + "</div>")
             .append("<div id='node_table_node_" + node.id + "_p'> <b>Peer Conn</b></div>")
             .append("<div id='node_table_node_" + node.id + "_c'> <b>Server Conn</b></div>")
             .append("<div id='node_table_node_" + node.id + "_h'> <b>Node Health</b></div>")
             .css("height", (table_height / gdo.net.rows) + "")
             .css("width", (table_width / gdo.net.cols) + "%")
             .css("font-size", table_font_size + "%")
             .css('padding', cell_padding);
        if(node.id == gdo.nodeId){
            $("#selected_node_id").empty().append("<b>Node Id:</b> " + node.id).css("width",7+"%");
            $("#selected_node_col").empty().append("<b>Col:</b> " + node.col).css("width", 5 + "%");
            $("#selected_node_row").empty().append("<b>Row:</b> " + node.row).css("width", 5 + "%");
            $("#selected_node_sid").empty().append("<b>Section Id:</b> " + node.sectionId).css("width", 7 + "%");
            $("#selected_node_scol").empty().append("<b>Section Col:</b> " + node.sectionCol).css("width", 10 + "%");
            $("#selected_node_srow").empty().append("<b>Section Row:</b> " + node.sectionRow).css("width", 10 + "%");
            $("#selected_node_cid").empty().append("<b>Connection Id:</b> " + node.connectionId).css("width", 20 + "%");
            $("#selected_node_pid").empty().append("<b>Peer Id:</b> " + node.peerId).css("width", 10 + "%");
            $("#selected_node_h").empty().append("<b>Node Health:</b> " + (node.aggregatedConnectionHealth * 25) + "%").css("width", 10 + "%");
            if (node.isConnectedToCaveServer) {
                $("#selected_node_cid").css("background", "lightgreen");
            } else {
                $("#selected_node_cid").css("background", "lightcoral");
            }
            if (node.isConnectedToPeerServer) {
                $("#selected_node_pid").css("background", "lightgreen");
            } else {
                $("#selected_node_pid").css("background", "lightcoral");
            }
            if (node.aggregatedConnectionHealth == 4) {
                $("#selected_node_h").css("background", "lightgreen");
            } else if (node.aggregatedConnectionHealth == 3) {
                $("#selected_node_h").css("background", "yellow");
            } else if (node.aggregatedConnectionHealth == 2) {
                $("#selected_node_h").css("background", "lightsalmon");
            } else if (node.aggregatedConnectionHealth == 1) {
                $("#selected_node_h").css("background", "lightcoral");
            } else {
                $("#selected_node_h").css("background", "lightcoral");
            }
        }
        var forward = false;
        var reverse = false;
        if (gdo.net.node[nodeId].connectedNodeList != null) {
            if(contains(gdo.net.node[nodeId].connectedNodeList, node.id)){
                forward = true;
            }
        } 
        if (node.connectedNodeList != null) {
            if(contains(node.connectedNodeList, nodeId)){
                reverse = true;
            }
        }
        if (node.aggregatedConnectionHealth == 4) {
            $("#node_table_node_" + node.id + '_h').css("background", "lightgreen");
        } else if (node.aggregatedConnectionHealth == 3) {
            $("#node_table_node_" + node.id + '_h').css("background", "yellow");
        } else if (node.aggregatedConnectionHealth == 2) {
            $("#node_table_node_" + node.id + '_h').css("background", "lightsalmon");
        } else if (node.aggregatedConnectionHealth == 1) {
            $("#node_table_node_" + node.id + '_h').css("background", "lightcoral");
        } else {
            $("#node_table_node_" + node.id + '_h').css("background", "lightcoral");
        }
        if (forward && reverse || (nodeId == node.id && node.peerId != null)) {
            $("#node_table_node_" + node.id + '_p').css("background", "lightgreen");
        } else if (forward || reverse ) {
            $("#node_table_node_" + node.id + '_p').css("background", "lightsalmon");
        } else {
            $("#node_table_node_" + node.id + '_p').css("background", "lightcoral");
        }
        if (node.isConnectedToCaveServer) {
            $("#node_table_node_" + node.id + '_c').css("background", "lightgreen");
        } else {
            $("#node_table_node_" + node.id + '_c').css("background", "lightcoral");
        }
        if (node.sectionId > 0 && node.sectionId == gdo.net.node[nodeId].sectionId) {
            $("#node_table_node_" + node.id + '_s').css("background", "lightgreen");
        } else if (node.sectionId > 0) {
            $("#node_table_node_" + node.id + '_s').css("background", "lightsalmon");
        } else {
            $("#node_table_node_" + node.id + '_s').css("background", "lightcoral");
        }
        if (node.id == nodeId) {
            $("#node_table_row_" + node.row + "_col_" + node.col).css("border", "4px solid #555");
            $("#node_table_row_" + node.row + "_col_" + node.col).css("background", "lightskyblue");
        } else if (isNeighbourOf(node.id, nodeId)) {
            $("#node_table_row_" + node.row + "_col_" + node.col).css("border", "4px solid #555");
            $("#node_table_row_" + node.row + "_col_" + node.col).css("background", "lightblue");
        } else {
            $("#node_table_row_" + node.row + "_col_" + node.col).css("border", "4px solid #555");
            $("#node_table_row_" + node.row + "_col_" + node.col).css("background", "lightgray");
        }
    }
}

function drawSectionTable() {
    /// <summary>
    /// Draws the section table.
    /// </summary>
    /// <returns></returns>
    drawEmptySectionTable(gdo.net.cols, gdo.net.rows);
    
    for (var i = 1; i <= gdo.net.cols * gdo.net.rows; i++) {
        var node = gdo.net.node[i];
        var sectionId = node.sectionId;

        if (sectionId == 0) {
            $("#section_table_row_" + node.row + "_col_" + node.col)
                    .empty()
                    .unbind()
                    .append("<div id='section_table_node_" + node.id + "_i'> <b>ID:</b> " + node.id + "</div>")
                    .append("<b>Col:</b> " + node.col + " | <b>Row:</b> " + node.row)
                    .css("height", (table_height / gdo.net.rows) + "")
                    .css("width", (table_width / gdo.net.cols) + "%")
                    .css("border", "4px solid #555")
                    .css("background", "lightgray")
                    .css("font-size", table_font_size + "%")
                    .css('padding', cell_padding)
                    .click(function () {
                        var id = getNodeId($(this).attr('col'), $(this).attr('row'))
                        if (net.node[id].isSelected) {
                            net.node[id].isSelected = false;
                        } else {
                            net.node[id].isSelected = true;
                        }
                        updateDisplayCanvas();
                    });

        } else if ((node.sectionCol == 0 && node.sectionRow == 0) && node.sectionId > 0) {
            $("#section_table_row_" + node.row + "_col_" + node.col)
                .empty()
                .unbind()
                .attr('colspan', gdo.net.section[sectionId].cols)
                .attr('rowspan', gdo.net.section[sectionId].rows)
                .css("height", ((table_height / gdo.net.rows) * gdo.net.section[sectionId].rows) + "")
                .css("width", ((100 / gdo.net.cols) * gdo.net.section[sectionId].cols) + "%")
                .css("border", "4px solid #333")
                .css("background", "lightskyblue")
                .css('padding', cell_padding)
                .append("<div id='section_table_section_" + sectionId + "_s'> <b>Section ID:</b> " + sectionId + "</div>")
                .append("<b>Start Col:</b> " + gdo.net.section[sectionId].col + " | <b>Start Row:</b> " + gdo.net.section[sectionId].row)
                .append("</br><b>End Col:</b> " + (gdo.net.section[sectionId].col + gdo.net.section[sectionId].cols - 1) + " | <b>End Row:</b> " + (gdo.net.section[sectionId].row + gdo.net.section[sectionId].rows - 1))
                .append("<div id='section_table_section_" + sectionId + "_h'> <b>Section Health</b></div>")
                .css("font-size", table_font_size + "%")
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
                $("#section_table_row_" + node.row + "_col_" + node.col).css("background-color", "dodgerblue");
            }
            if (gdo.net.section[sectionId].health >= 4) {
                $("#section_table_section_" + sectionId + '_h').css("background", "lightgreen");
            } else if (gdo.net.section[sectionId].health >= 3) {
                $("#section_table_section_" + sectionId + '_h').css("background", "yellow");
            } else if (gdo.net.section[sectionId].health >= 2) {
                $("#section_table_section_" + sectionId + '_h').css("background", "lightsalmon");
            } else if (gdo.net.section[sectionId].health >= 1) {
                $("#section_table_section_" + sectionId + '_h').css("background", "lightcoral");
            } else {
                $("#section_table_section_" + sectionId + '_h').css("background", "lightcoral");
            }
        } else if ((node.sectionCol != 0 || node.sectionRow != 0) && node.sectionId > 0) {
            $("#section_table_row_" + node.row + "_col_" + node.col).hide();
        }
        if (node.isSelected) {
            $("#section_table_row_" + node.row + "_col_" + node.col).css("background-color", "gray");
        }
    }
}

function drawButtonTable() {
    /// <summary>
    /// Draws the button table.
    /// </summary>
    /// <returns></returns>

    //Create Section

    $("#button_table_row_0_col_0")
        .empty()
        .append("<div id='button_Create_section'> <b>Create Section</b></div>")
        .css("height", button_height)
        .css("width", (table_width / button_cols) + "%")
        .css("border", "3px solid #555")
        .css("background", "lightskyblue")
        .css('padding', cell_padding)
        .attr("align", "center")
        .css("font-size", button_font_size + "%");
        
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
    $("#button_table_row_0_col_0").unbind();
    $("#button_table_row_0_col_0").click(function () {
        if (isRectangle && isStarted){
            gdo.net.server.createSection(colStart, rowStart, colEnd, rowEnd);
            for (var i = colStart; i <= colEnd; i++) {
                for (var j = rowStart; j <= rowEnd; j++) {
                    var node = gdo.net.node[getNodeId(i, j)];
                    node.isSelected = false;
                }
            }
            consoleOut('.MAN', 1, 'Requested Creation of Section at (' + colStart + ',' + rowStart + '),(' + colEnd + ',' + rowEnd + ')');
        } else {
            
        }
    });
    if (isStarted) {
        if (isRectangle) {
            $("#button_table_row_0_col_0")
                .css("background", "lightgreen");
        } else {
            $("#button_table_row_0_col_0")
                .css("background", "lightcoral");
        }
    } else {
        $("#button_table_row_0_col_0")
            .css("background", "lightblue");
    }

    //Dispose Section

    $("#button_table_row_0_col_1")
        .empty()
        .append("<div id='button_dispose_section'> <b>Dispose Section</b></div>")
        .css("height", button_height)
        .css("width", (100 / button_cols) + "%")
        .css("border", "3px solid #555")
        .css("background", "lightblue")
        .css('padding', cell_padding)
        .attr("align", "center")
        .css("font-size", button_font_size + "%")
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
                    consoleOut('.MAN', 1, 'Requested Disposal of Section ' + i);
                }
            }
        });

    for (var i = 1; i < (gdo.net.cols * gdo.net.rows) ; i++) {
        if (gdo.net.section[i].isSelected) {
            $("#button_table_row_0_col_1").css("background", "lightgreen");
        }
    }

}



////////
/*

function drawCaveTable() {
    for (var i = 1; i <= gdo.net.cols * gdo.net.rows; i++) {
        var node = gdo.net.node[i];
        $("#node_table_row_" + node.row + "_col_" + node.col)
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
        $("#node_table_row_" + node.row + "_col_" + node.col).css("border", "4px solid #555");
        $("#node_table_row_" + node.row + "_col_" + node.col).css("background", "lightgray");
    }
}
*/