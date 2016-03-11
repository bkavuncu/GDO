﻿$(function () {
    gdo.consoleOut(".BASE", 2, "Loaded Base Frame");
    if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
        $('iframe').contents().find("#base_title").empty();
        if (gdo.net.blankMode == false || gdo.net.blankMode == null) {
            $('iframe').contents().find("#base_title").css("fontSize", "77vh").css("font-family", "fontawesome").css("color", "#222").append("<font face='fontawesome'><b>" + gdo.clientId + "</b></font>").css("");
        }
    }
});

gdo.initBaseFrame = function ()
{
    gdo.consoleOut(".BASE", 2, "Loaded Base Frame");
    if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
        $('iframe').contents().find("#base_title").empty();
        if (gdo.net.blankMode == false) {
            $('iframe').contents().find("#base_title").css("fontSize", "77vh").css("font-family", "fontawesome").css("color", "#222").append("<font face='fontawesome'><b>" + gdo.clientId + "</b></font>");
        } 
    } 
}