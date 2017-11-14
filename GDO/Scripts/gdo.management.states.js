gdo.management.states = {};

$(function () {
    gdo.management.states.isActive = true;
});

gdo.management.states.drawStateInputTable = function () {

    $("#state_table_state_list")
        .css("height", ((gdo.management.table_height) + (gdo.management.info_height))*2.5)
        .css("width", "95%")
        .css("border", "1px solid #333")
        .css("color", "#DDD")
        .css("background", "#222")
        .css('padding', gdo.management.cell_padding)
        .attr("align", "top")
        .css("vertical-align", "top")
        .css({ fontSize: gdo.management.button_font_size });
    $("#state_table_state_header_table")
        .empty().css("border", "1px solid #333");
    $("#state_table_state_header_table").append("<tr id='state_table_state_header_table_head'></tr>");
    $("#state_table_state_header_table tr:last").append("<td id='state_table_state_header_table_row_input'><input type='text' id='state_table_input'  value='Enter State Name' style='width: 95%;height: 100%;'/></input></td>");
    $("#state_table_state_header_table tr:last").append("<td id='state_table_state_header_table_row_save'><button type='button' id='state_table_save' class='btn btn-primary '><i class='fa fa-save fa-fw'></i>&nbsp;Save</button></td>");
    $("#state_table_state_header_table tr:last").append("<td id='state_table_state_header_table_row_clear'><button type='button' id='state_table_clear' class='btn btn-primary btn-danger' data-toggle='modal' data-target='#confirm-clear'><i class='fa fa-exclamation-circle fa-fw'></i>&nbsp;Clear Cave</button></td>");
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
    $("#clear_confirm_button")
    .unbind()
    .click(function () {
        gdo.consoleOut('.NET', 1, 'Clearing States');
        gdo.net.server.clearCave();
    });
}

gdo.management.states.drawStateTable = function () {
    $("#state_table_state_list_table")
        .empty();

    var i = 0;
    for (var name in gdo.net.state) {
        if (gdo.net.state.hasOwnProperty(name)) {
        
            $("#state_table_state_list_table").append("<tr id='state_table_state_list_table_row_" + i + " rowname='" + name + "'></tr>");
            $("#state_table_state_list_table tr:last").append("<td id='state_table_state_list_table_row_" + i + "_col_0' col='0'"+" rowname='" + name + "' row='" + i + "'>" + name + "</td>");
            $("#state_table_state_list_table tr:last").append("<td id='state_table_state_list_table_row_" + i + "_col_1' col='1'"+" rowname='" + name + "' row='" + i + "'><button type='button' class='btn btn-success' style='width:100%;'><i class='fa fa-repeat fa-fw'></i>&nbsp;Restore</button></td>");
            $("#state_table_state_list_table tr:last").append("<td id='state_table_state_list_table_row_" + i + "_col_2' col='2'"+" rowname='" + name + "' row='" + i + "'><button type='button' class='btn btn-danger' style='width:100%;'><i class='fa fa-times fa-fw'></i>&nbsp;Remove</button></td>");
        
        $("#state_table_state_list_table_row_" + i + "_col_0")
            .css("width", "50%")
            .css("border", "1px solid #222")
            .css("background", "#333")
            .css("color", "#FFF")
            .css('padding', gdo.management.cell_padding)
            .attr("align", "center")
            .css({ fontSize: gdo.management.button_font_size * 0.7 });
        $("#state_table_state_list_table_row_" + i + "_col_1")
            .css("width", "20%")
            .css("border", "1px solid #222")
            .css("background", "#333")
            .css("color", "#FFF")
            .css('padding', gdo.management.cell_padding)
            .attr("align", "center")
            .css({ fontSize: gdo.management.button_font_size * 0.7 })
            .unbind()
            .click(function () {
                gdo.net.server.clearCave();
                gdo.consoleOut(".NET", 4, "Requested Restoring Cave State " + $(this).attr('rowname'));
                gdo.net.server.restoreCaveState($(this).attr('rowname'));
            });
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
                gdo.net.server.removeCaveState($(this).attr('rowname'));
            });
            }
        i++;
    }
}