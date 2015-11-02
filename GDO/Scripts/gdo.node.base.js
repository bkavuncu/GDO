$(function () {
    gdo.consoleOut(".BASE", 2, "Loaded Base Frame");
    if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
        $('iframe').contents().find("#base_title").empty().css("fontSize","77vh").css("color", "#222").append("<b>" + gdo.clientId + "</b>").css("");
    }
});

gdo.initBaseFrame = function ()
{
    gdo.consoleOut(".BASE", 2, "Loaded Base Frame");
    if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
        $('iframe').contents().find("#base_title").empty().css("fontSize", "77vh").css("color", "#222").append("<b>" + gdo.clientId + "</b>").css("");
    }
}