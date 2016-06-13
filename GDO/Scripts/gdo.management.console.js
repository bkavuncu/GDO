gdo.management.console = {}
gdo.management.console.password = [5,3,4,9,7,1];
gdo.management.console.input = [];
gdo.management.console.index = 1;

$(function () {
    for (var i = 0; i < 10; i++) {
        $("#keypad_" + i).click(function () {
            gdo.management.console.pressKey($(this).attr('key'));
        });
    }
    $("#keypad_e").click(function () {
        if (gdo.management.console.checkPassword()) {
            for (var i = 1; i < 7; i++) {
                $("#password_" + i).removeClass("btn-default").addClass("btn-success");
            }
            setTimeout(function () {
                window.location.replace("/Web/Sections.cshtml");
            }, 500);
        } else {
            for (var i = 1; i < 7; i++) {
                $("#password_" + i).removeClass("btn-default").addClass("btn-danger");
            }
            setTimeout(function() {
                for (var i = 1; i < 7; i++) {
                    $("#password_" + i).empty().append("-").removeClass("btn-danger").addClass("btn-default");
                }
            }, 500);
        }
    });
});

gdo.management.console.pressKey = function (key) {
    if (gdo.management.console.index < 7) {
        gdo.management.console.input[gdo.management.console.index-1] = key;
        $("#password_" + gdo.management.console.index).empty().append("*");
        gdo.management.console.index++;
    }
}

gdo.management.console.checkPassword = function() {
    var check = true;
    for (var i = 0; i < 6; i++) {
        if (gdo.management.console.input[i] != gdo.management.console.password[i]) {
            check = false;
        }
    }
    gdo.management.console.index = 1;
    return check;
}

