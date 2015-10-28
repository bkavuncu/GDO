gdo.management.drawEmptyStateTable = function () {

    $("#state_table_state_list")
        .css("height", ((gdo.management.table_height) + (gdo.management.info_height))*2.8)
        .css("width", "95%")
        .css("border", "1px solid #333")
        .css("color", "#DDD")
        .css("background", "#222")
        .css('padding', gdo.management.cell_padding)
        .attr("align", "center")
        .css("vertical-align", "top")
        .css({ fontSize: gdo.management.button_font_size });
    $("#state_table_state_header_table")
        .empty().css("border", "1px solid #333");
    $("#state_table_state_header_table").append("<tr id='state_table_state_header_table_head'></tr>");
    $("#state_table_state_header_table tr:last").append("<td id='state_table_state_header_table_row_input'><input type='text' id='state_table_input'  value='Enter State Name' style='width: 95%;height: 100%;'/></input></td>");
    $("#state_table_state_header_table tr:last").append("<td id='state_table_state_header_table_row_save'><button type='button' id='state_table_save' class='btn btn-primary '>Save</button></td>");
    $("#state_table_state_header_table tr:last").append("<td id='state_table_state_header_table_row_clear'><button type='button' id='state_table_clear' class='btn btn-primary btn-danger'>Clear Cave</button></td>");
    $("#state_table_input")
        .css("width", "100%")
        .css("height", "40px")
        .css("border", "1px solid #333")
        .css("background", "#333")
        .css("color", "#FFF")
        .css("padding", "0px")
        .css("display", "inline-block")
        .css("position", "relative")
        .attr("text-align", "center")
        .attr("onfocus", "this.value=''")
        .css({ fontSize: gdo.management.button_font_size * 0.7 });
    $("#state_table_state_header_table_row_input")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", "60%")
        .css("height", "40px");

    $("#state_table_state_header_table_row_save")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", "20%")
        .css("height", "40px")
        .css("background", "#444");
    $("#state_table_save")
        .css("width", "100%")
        .attr("onfocus", "this.value=''")
        .css({ fontSize: gdo.management.button_font_size * 0.7 });
    $("#state_table_state_header_table_row_clear")
        .css("width", "20%")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("background", "#444")
        .css("height", "40px");
    $("#state_table_clear")
        .css("width", "100%")
        .attr("onfocus", "this.value=''")
        .css({ fontSize: gdo.management.button_font_size * 0.7 });
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
            $("#state_table_state_list_table tr:last").append("<td id='state_table_state_list_table_row_" + i + "_col_0' col='0' row='" + i + "'>" + gdo.net.state[i].Id + "</td>");
            $("#state_table_state_list_table tr:last").append("<td id='state_table_state_list_table_row_" + i + "_col_1' col='1' row='" + i + "'>" + gdo.net.state[i].Name + "</td>");
            $("#state_table_state_list_table tr:last").append("<td id='state_table_state_list_table_row_" + i + "_col_2' col='2' row='" + i + "'><button type='button' class='btn btn-success' style='width:100%;'>Restore</button></td>");
            $("#state_table_state_list_table tr:last").append("<td id='state_table_state_list_table_row_" + i + "_col_3' col='3' row='" + i + "'><button type='button' class='btn btn-danger' style='width:100%;'>Remove</button></td>");
        }
        $("#state_table_state_list_table_row_" + i + "_col_0")
            .css("width", "10%")
            .css("border", "1px solid #222")
            .css("background", "#333")
            .css("color", "#FFF")
            .css('padding', gdo.management.cell_padding)
            .attr("align", "center")
            .css({ fontSize: gdo.management.button_font_size * 0.7 });
        $("#state_table_state_list_table_row_" + i + "_col_1")
            .css("width", "50%")
            .css("border", "1px solid #222")
            .css("background", "#333")
            .css("color", "#FFF")
            .css('padding', gdo.management.cell_padding)
            .attr("align", "center")
            .css({ fontSize: gdo.management.button_font_size * 0.7 });
        $("#state_table_state_list_table_row_" + i + "_col_2")
            .css("width", "20%")
            .css("border", "1px solid #222")
            .css("background", "#333")
            .css("color", "#FFF")
            .css('padding', gdo.management.cell_padding)
            .attr("align", "center")
            .css({ fontSize: gdo.management.button_font_size * 0.7 })
            .unbind()
            .click(function () {
                gdo.net.server.restoreCaveState($(this).attr('row'));
            });
        $("#state_table_state_list_table_row_" + i + "_col_3")
            .css("width", "20%")
            .css("border", "1px solid #222")
            .css("background", "#333")
            .css("color", "#FFF")
            .css('padding', gdo.management.cell_padding)
            .attr("align", "center")
            .css({ fontSize: gdo.management.button_font_size * 0.7 })
            .unbind()
            .click(function () {
                gdo.net.server.removeCaveState($(this).attr('row'));
            });

    }
}