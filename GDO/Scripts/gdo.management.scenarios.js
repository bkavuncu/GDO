gdo.management.scenarios = {};

$(function () {
    gdo.management.scenarios.isActive = true;
    gdo.management.scenarios.currentScenario = null;
});

gdo.management.scenarios.newScenario = function (name) {
    gdo.management.scenarios.currentScenario = name;
    gdo.net.scenario[name] = {};
    gdo.net.scenario[name].Name = name;
    gdo.net.scenario[name].CurrentElement = 0;
    gdo.net.scenario[name].Elements = [];
}

gdo.management.scenarios.loadScenario = function (name) {
    //TODO load current scenario
}

gdo.management.scenarios.unloadScenario = function (name) {
    //TODO delete current scenario
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

gdo.management.scenarios.displayScenariosToLoad = function () {
    $("#scenarios_load").empty();
    for (var index in gdo.net.scenario) {
        if (!gdo.net.scenario.hasOwnProperty((index))) {
            continue;
        }
        if (gdo.net.scenario[index].Name) {
            $("#scenarios_load").append("<div id='scenarios_load_" + gdo.net.scenario[index].Name + "'>" + gdo.net.scenario[index].Name + "</div>");
        }
    }
}

$("#createNewScenario").unbind().click(function() {
    var name = parseInt(document.getElementById('scenario_name_input').value);
    gdo.management.scenarios.newScenario(name);
    gdo.management.scenarios.loadScenario(gdo.management.scenarios.currentScenario);
});

$("#loadScenario").unbind().click(function () {

    if (gdo.management.scenarios.currentScenario != null) {
        gdo.management.scenarios.loadScenario(gdo.management.scenarios.currentScenario);
    }
});

$("#saveScenario").unbind().click(function () {
    if (gdo.management.scenarios.currentScenario != null) {
        gdo.net.server.saveScenario(gdo.management.scenarios.currentScenario);
    }
});

$("#deleteScenario").unbind().click(function() {
    if (gdo.management.scenarios.currentScenario != null) {
        gdo.net.server.deleteScenario(gdo.management.scenarios.currentScenario);
    }
});



