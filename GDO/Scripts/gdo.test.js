function initTest() {
    //create a section
    //
}

function drawCaveTable(maxRow, maxCol) {
    consoleOut('TEST', 'INFO', 'Drawing Cave Table');
    $("#browser_table").empty();
    for (var i = 0; i < maxRow; i++) {
        $("#browser_table").append("<tr></tr>");
        for (var j = 0; j < maxCol; j++) {
            $("#browser_table tr:last").append("<td>(" + (i + 1) + "," + (j + 1) + ")</td>");
        }
    }
}

function updateCanvas() {
    consoleOut('TEST', 'INFO', 'Updating Canvas');
    for (var node in gdo.net.node) {
        if (!gdo.net.node.hasOwnProperty((node))) {
            continue;
        }
        $("#browser_table tr:nth-child(" + node.row + ") td:nth-child(" + node.col + ")")
            .empty()
            .append("<br/>Col: " + node.col + " | Row: " + node.row)
            .append("<br/><div id='" + node.id + "'> ID: " + node.id + "</div>")
            .append("<br/><div peerid='" + node.peerID + "'> PeerID: " + node.peerID + "</div>")
            .append("<br/><div connectionid='" + node.connectionID + "'> ConnectionID: " + node.connectionID + "</div>");
        if (node.connectedToPeer) {
            $("#" + node.peerID).css("background", "lightgreen");
        } else {
            $("#" + node.peerID).css("background", "lightcoral");
        }
        if (node.connectedToServer) {
            $("#" + node.connectionID).css("background", "lightgreen");
        } else {
            $("#" + node.connectionID).css("background", "lightcoral");
        }
        if (node.id == gdo.id) {
            $("#browser_table tr:nth-child(" + node.row + ") td:nth-child(" + node.col + ")").css("border", "3px solid black");
            $("#browser_table tr:nth-child(" + node.row + ") td:nth-child(" + node.col + ")").css("background", "lightseagreen");
        } else if (node.sectionID != 0 && node.sectionID == this.self.sectionID) {
            $("#browser_table tr:nth-child(" + node.row + ") td:nth-child(" + node.col + ")").css("border", "2px solid black");
            $("#browser_table tr:nth-child(" + node.row + ") td:nth-child(" + node.col + ")").css("background", "lightskyblue");
        } else {
            $("#browser_table tr:nth-child(" + node.row + ") td:nth-child(" + node.col + ")").css("border", "1px solid black");
            $("#browser_table tr:nth-child(" + node.row + ") td:nth-child(" + node.col + ")").css("background", "white");
        }
    }
    consoleOut('TEST', 'INFO', 'Canvas Updated');
}