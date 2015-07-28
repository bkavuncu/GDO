$(function () {
    gdo.consoleOut(".BASE", 2, "Loaded Base App");
    $('iframe').contents().find("#base_title").empty().css({ fontSize: 777 }).css("color", "#222").append("<b>" + gdo.clientId + "</b>");
});