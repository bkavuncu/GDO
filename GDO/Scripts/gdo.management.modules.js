$(function () {
    
});

gdo.management.loadModuleControlFrame = function (moduleName) {
    gdo.consoleOut(".MANAGEMENT", 3, "Loading Control Frame " + moduleName);
    $("#module_label").empty().append("<h3><b>" + moduleName + "</b></h3>");
    $("#nav_modules").addClass("in");
    $("#nav_li_" + moduleName).addClass("active");
    document.title = "" + moduleName;
    $('iframe').attr('src', "/Web/" + moduleName + "/control.cshtml");
    $('iframe').fadeIn();
}

