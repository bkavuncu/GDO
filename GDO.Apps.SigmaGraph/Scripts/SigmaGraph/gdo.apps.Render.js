/**
 * Functions for rendering the graph with sigma.js
 */
$(function () {
    // Node global variables.
    const nodeRow = gdo.net.node[gdo.clientId].sectionRow;
    const nodeColumn = gdo.net.node[gdo.clientId].sectionCol;
    const totalRows = gdo.net.section[gdo.clientID].Rows;
    const totalCols = gdo.net.section[gdo.clientID].Cols;
    /**
     * Renders the graph at folderNameDigit.    
     * TODO specification for files at folderNameDigit
     * @param {} folderNameDigit the location of the graph to parse and render
     * @param {} zoomed true if the graph should be zoomed in and false otherwise
     * @returns {} void?
     */
    $.connection.sigmaGraphAppHub.client.renderGraph = function (folderNameDigit, zoomed) {

    }
});