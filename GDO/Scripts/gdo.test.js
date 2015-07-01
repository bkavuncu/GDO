
function initTest() {
    //create a section
    //
}

function drawCaveTable(maxRow, maxCol) {
    /// <summary>
    /// Draws the cave table.
    /// </summary>
    /// <param name="maxRow">The maximum row.</param>
    /// <param name="maxCol">The maximum col.</param>
    /// <returns></returns>
    consoleOut('.TEST', 1, 'Drawing Cave Table with ' + maxRow + ',' +maxCol);
    $("#browser_table").empty();
    for (var i = 0; i < maxCol; i++) {
        $("#browser_table").append("<tr></tr>");
        for (var j = 0; j < maxRow; j++) {
            $("#browser_table tr:last").append("<td>(" + (j + 1) + "," + (i + 1) + ")</td>");
        }
    }
}

function updateGDOCanvas() {
   /// <summary>
   /// Updates the gdo canvas.
   /// </summary>
   /// <returns></returns>
   for (var i = 1; i <= gdo.net.cols * gdo.net.rows; i++) {
        var node = gdo.net.node[i];
       $("#browser_table tr:nth-child(" + (node.row+1) + ") td:nth-child(" + (node.col+1) + ")")
            .empty()
            .append("<div id='" + node.id + "i'> <b>ID:</b> " + node.id + "</div>")
            .append("<b>Col:</b> " + node.col + " | <b>Row:</b> " + node.row)
            .append("<div id='" + node.id + "s'> <b>SectionID:</b> " + node.sectionId + "</div>")
            .append("<div id='" + node.id + "p'> <b>PeerID:</b> " + node.peerId + "</div>")
            .append("<div id='" + node.id + "c'> <b>ConnectionID:</b> " + node.connectionId + "</div>");
        if (node.connectedToPeer) {
            $("#" + node.id + 'p').css("background", "lightgreen");
        } else {
            $("#" + node.id + 'p').css("background", "lightcoral");
        }
        if (node.connectedToServer) {
            $("#" + node.id + 'c').css("background", "lightgreen");
        } else {
            $("#" + node.id + 'c').css("background", "lightcoral");
        }
        if (node.sectionId > 0 && node.sectionId == gdo.net.node[gdo.id].sectionId) {
            $("#" + node.id + 's').css("background", "lightgreen");
        } else if (node.sectionId > 0) {
            $("#" + node.id + 's').css("background", "lightsalmon");
        } else {
            $("#" + node.id + 's').css("background", "lightcoral");
        }
        if (node.id == gdo.id) {
            $("#browser_table tr:nth-child(" + (node.row + 1) + ") td:nth-child(" + (node.col + 1) + ")").css("border", "4px solid #555");
            $("#browser_table tr:nth-child(" + (node.row + 1) + ") td:nth-child(" + (node.col + 1) + ")").css("background", "lightskyblue");
        }  else if(node.isNeighbour){
            $("#browser_table tr:nth-child(" + (node.row + 1) + ") td:nth-child(" + (node.col + 1) + ")").css("border", "4px solid #555");
            $("#browser_table tr:nth-child(" + (node.row + 1) + ") td:nth-child(" + (node.col + 1) + ")").css("background", "lightblue");
        }else {
            $("#browser_table tr:nth-child(" + (node.row + 1) + ") td:nth-child(" + (node.col + 1) + ")").css("border", "4px solid #555");
        $("#browser_table tr:nth-child(" + (node.row + 1) + ") td:nth-child(" + (node.col + 1) + ")").css("background", "lightgray");
    }
    }
}