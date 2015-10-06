gdo.management.drawEmptyStateTable = function () {

    $("#state_table_state_list")
        .css("height", ((gdo.management.table_height) + (gdo.management.info_height )))
        .css("width", "98%")
        .css("border", "3px solid #444")
        .css("color", "#DDD")
        .css("background", "#222")
        .css('padding', gdo.management.cell_padding)
        .attr("align", "center")
        .css("vertical-align", "top")
        .css({ fontSize: gdo.management.button_font_size });
    $("#state_table_state_header_table")
    .empty();
    $("#state_table_state_header_table").append("<tr id='state_table_state_header_table_head'></tr>");
    $("#state_table_state_header_table tr:last").append("<td id='state_table_state_header_table_row_input'><input type='text' id='state_table_input'  value='Enter State Name' style='width: 95%;height: 100%;'/></input></td>");
    $("#state_table_state_header_table tr:last").append("<td id='state_table_state_header_table_row_save'>Save</td>");
    $("#state_table_state_header_table tr:last").append("<td id='state_table_state_header_table_row_clear'>Clear Cave</td>");
    $("#state_table_input")
        .css("width", "100%")
        .css("border", "3px solid #444")
        .css("background", "#333")
        .css("color", "#FFF")
        .css('padding', gdo.management.cell_padding)
        .attr("align", "center")
        .attr("onfocus", "this.value=''")
        .css({ fontSize: gdo.management.button_font_size * 1 });
    $("#state_table_state_header_table_row_save")
        .css("width", "60%");
    $("#state_table_state_header_table_row_save")
        .css("width", "20%")
        .css("border", "3px solid #444")
        .css("background", "#333")
        .css("color", "#FFF")
        .css('padding', gdo.management.cell_padding)
        .attr("align", "center")
        .attr("onfocus", "this.value=''")
        .css({ fontSize: gdo.management.button_font_size * 1 });
    $("#state_table_state_header_table_row_clear")
        .css("width", "20%")
        .css("border", "3px solid #444")
        .css("background", "#333")
        .css("color", "#FFF")
        .css('padding', gdo.management.cell_padding)
        .attr("align", "center")
        .attr("onfocus", "this.value=''")
        .css({ fontSize: gdo.management.button_font_size * 1 });
    $("#state_table_state_header_table_row_save")
        .unbind()
        .click(function () {
            gdo.consoleOut('.NET', 1, 'Saving State ' + document.getElementById('state_table_input').value);
            gdo.net.server.saveCaveState(document.getElementById('state_table_input').value);
        });
    $("#state_table_state_header_table_row_clear")
            .unbind()
            .click(function () {
                gdo.consoleOut('.NET', 1, 'Clearing States');
                gdo.net.server.clearCave();
            });
}

gdo.management.drawStateTable = function () {
    gdo.management.drawEmptyStateTable();
    $("#state_table_state_list_table")
        .empty();
    for (var i = 0; i < gdo.net.state.length; i++) {
        if (gdo.net.state[i] != null) {
            $("#state_table_state_list_table").append("<tr id='state_table_state_list_table_row_" + i + " row='" + i + "'></tr>");
            $("#state_table_state_list_table tr:last").append("<td id='state_table_state_list_table_row_" + i + "_col_0' col='0' row='" + i + "'>" + gdo.net.state[i].Id+ "</td>");
            $("#state_table_state_list_table tr:last").append("<td id='state_table_state_list_table_row_" + i + "_col_1' col='1' row='" + i + "'>" + gdo.net.state[i].Name + "</td>");
            $("#state_table_state_list_table tr:last").append("<td id='state_table_state_list_table_row_" + i + "_col_2' col='2' row='" + i + "'>Restore</td>");
            $("#state_table_state_list_table tr:last").append("<td id='state_table_state_list_table_row_" + i + "_col_3' col='3' row='" + i + "'>Remove</td>");
        }
        $("#state_table_state_list_table_row_" + i + "_col_0")
            .css("width", "10%")
            .css("border", "3px solid #444")
            .css("background", "#333")
            .css("color", "#FFF")
            .css('padding', gdo.management.cell_padding)
            .attr("align", "center")
            .css({ fontSize: gdo.management.button_font_size * 1 });
        $("#state_table_state_list_table_row_" + i + "_col_1")
            .css("width", "50%")
            .css("border", "3px solid #444")
            .css("background", "#333")
            .css("color", "#FFF")
            .css('padding', gdo.management.cell_padding)
            .attr("align", "center")
            .css({ fontSize: gdo.management.button_font_size * 1 });
        $("#state_table_state_list_table_row_" + i + "_col_2")
            .css("width", "20%")
            .css("border", "3px solid #444")
            .css("background", "#333")
            .css("color", "#FFF")
            .css('padding', gdo.management.cell_padding)
            .attr("align", "center")
            .css({ fontSize: gdo.management.button_font_size * 1 })
            .unbind()
            .click(function () {
                gdo.net.server.restoreCaveState($(this).attr('row'));
            });
        $("#state_table_state_list_table_row_" + i + "_col_3")
            .css("width", "20%")
            .css("border", "3px solid #444")
            .css("background", "#333")
            .css("color", "#FFF")
            .css('padding', gdo.management.cell_padding)
            .attr("align", "center")
            .css({ fontSize: gdo.management.button_font_size * 1 })
            .unbind()
            .click(function () {
                gdo.net.server.removeCaveState($(this).attr('row'));
            });

    }
}