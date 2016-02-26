gdo.management.scenarios = {};

$(function () {
    gdo.management.scenarios.isActive = true;
    gdo.management.scenarios.currentScenario = null;
    gdo.management.scenarios.displayScenariosToLoad("");
});

gdo.management.scenarios.newScenario = function (name) {
    gdo.net.scenario[name] = {};
    gdo.net.scenario[name].Name = name;
    gdo.net.scenario[name].CurrentElement = 0;
    gdo.net.scenario[name].Elements = [];
    gdo.management.scenarios.currentScenario = name;
}

gdo.management.scenarios.loadScenario = function (name) {
    gdo.management.scenarios.currentScenario = name;
    $("#scenario_label").empty().append("<h6><span class='fa fa-list'></span>&nbsp;&nbsp;" + name + "</h6>");
}

gdo.management.scenarios.unloadScenario = function (name) {
    $("#scenario_label").empty().append("<h6><span class='fa fa-list'></span>&nbsp;&nbsp;</h6>");
    gdo.management.scenarios.currentScenario = null;
}

gdo.management.scenarios.parseFunction = function (func) {
    // func index of (
    //func1 substring to that index
    //func1 last index of .
    //func2 substring to that is module
    //func3 substring from that is function
    //func 4 substring from ( to last 2
    //func4 parse parameters
}

gdo.management.scenarios.displayScenariosToLoad = function (scenarioName) {
    $("#scenarios_load").empty();
    for (var index in gdo.net.scenario) {
        if (!gdo.net.scenario.hasOwnProperty((index))) {
            continue;
        }else if (gdo.net.scenario[index] != null) {
            
            if (scenarioName == gdo.net.scenario[index].Name) {
                $("#scenarios_load").append("<div id='scenarios_load_" + gdo.net.scenario[index].Name + "' name=" + gdo.net.scenario[index].Name + " style='color:#77B200'>" + gdo.net.scenario[index].Name + "</div>");
            } else {
                $("#scenarios_load").append("<div id='scenarios_load_" + gdo.net.scenario[index].Name + "' name=" + gdo.net.scenario[index].Name + ">" + gdo.net.scenario[index].Name + "</div>");
            }
            $("#scenarios_load_" + gdo.net.scenario[index].Name).unbind().click(function () {
                gdo.management.scenarios.currentScenario = $(this).attr('name');
                gdo.management.scenarios.displayScenariosToLoad($(this).attr('name'));
            });
        }
    }
}

$("#createNewScenario").unbind().click(function() {
    var name = document.getElementById('scenario_name_input').value;
    document.getElementById('scenario_name_input').value = "";
    gdo.management.scenarios.newScenario(name);
    gdo.management.scenarios.loadScenario(gdo.management.scenarios.currentScenario);
    gdo.management.scenarios.displayScenariosToLoad("");
});

$("#loadScenario").unbind().click(function () {

    if (gdo.management.scenarios.currentScenario != null) {
        gdo.management.scenarios.loadScenario(gdo.management.scenarios.currentScenario);
        gdo.management.scenarios.displayScenariosToLoad("");
    }
});

$("#saveScenario").unbind().click(function () {
    if (gdo.management.scenarios.currentScenario != null) {
        gdo.net.server.saveScenario(JSON.stringify(gdo.net.scenario[gdo.management.scenarios.currentScenario]));
        gdo.management.scenarios.displayScenariosToLoad("");
    }
});

$("#deleteScenario").unbind().click(function() {
    if (gdo.management.scenarios.currentScenario != null) {
        gdo.net.scenario[gdo.management.scenarios.currentScenario] = null;
        gdo.net.server.removeScenario(gdo.management.scenarios.currentScenario);
        gdo.management.scenarios.displayScenariosToLoad("");
    }
});



