gdo.management.drawConsoleInput = function () {
    $("#console_input_div")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", "80%")
        .css("height", "40px")
        .empty()
        .append("<input type='text' id='console_input' value='Enter Console Command' spellcheck='false' style='width: 95%;height: 100%;' /></input>");
    $("#console_input")
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
    $("#console_input").keyup(function (event) {
        if (event.keyCode == 13) {
            $("#console_submit").click();
        }
    });
    $("#console_submit_div")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", "20%")
        .css("height", "40px")
        .css("background", "#444")
        .empty()
        .append("<button type='button' id='console_submit' class='btn btn-primary btn-block'><i class='fa fa-check-circle fa-fw'></i>&nbsp;Execute</button>");
    $("#console_submit")
        .css("width", "100%")
        .attr("onfocus", "this.value=''")
        .css({ fontSize: gdo.management.button_font_size * 0.7 })
        .unbind()
        .click(function () {
            gdo.consoleOut(".MANAGEMENT", 1, "Executing: " + document.getElementById('console_input').value);
            eval(document.getElementById('console_input').value);
        });
}
