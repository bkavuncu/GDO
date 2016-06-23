gdo.management.terminal = {};

$(function () {
    gdo.management.terminal.isActive = true;
});

gdo.management.terminal.drawTerminalInput = function () {
    $("#terminal_area").enscroll({
        showOnHover: false,
        verticalTrackClass: 'track4',
        verticalHandleClass: 'handle4'
    }).css("padding-right", "0px");
    $("#terminal_input_div")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", "80%")
        .css("height", "40px")
        .empty()
        .append("<input type='text' class='form-control' id='terminal_input' value='&nbsp;Enter Terminal Command' spellcheck='false' style='width: 95%;height: 100%;' /></input>");
    $("#terminal_input")
        .css("width", "100%")
        .css("height", "40px")
        .css("background", "#333")
        .css("color", "#FFF")
        .css("padding", "0px")
        .css("display", "inline-block")
        .css("position", "relative")
        .attr("text-align", "center")
        .attr("onfocus", "this.value=''")
        .css({ fontSize: gdo.management.button_font_size * 0.7 });
    //$("#terminal_input").keyup(function (event) {
    //    if (event.keyCode == 13) {
    //        $("#terminal_submit").click();
    //    }
    //});
    $("#terminal_submit_div")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", "20%")
        .css("height", "40px")
        .css("background", "#444")
        .empty()
        .append("<button type='button' id='terminal_submit' class='btn btn-primary btn-block'><i class='fa fa-check-circle fa-fw'></i>&nbsp;Execute</button>");
    $("#terminal_submit")
        .css("width", "100%")
        .attr("onfocus", "this.value=''")
        .css({ fontSize: gdo.management.button_font_size * 0.7 })
        .unbind()
        .click(function () {
            gdo.consoleOut(".MANAGEMENT", 1, "Executing: " + document.getElementById('terminal_input').value);
            gdo.consoleOut(".MANAGEMENT", 1, "Result: " + eval(document.getElementById('terminal_input').value));
        });
    $("#terminal_input").autocomplete({
        position: {
            my: "left bottom",
            at: "left top"
        },
        source: gdo.functions.list
    });

}
