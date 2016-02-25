$(function () {
    gdo.management.scenarios = {};
    gdo.management.scenarios.currentScenario = null;

});

gdo.management.newScenario = function (name) {
    gdo.management.scenarios.currentScenario = name;
    gdo.net.scenario[name] = {};
    gdo.net.scenario[name].Name = name;
    gdo.net.scenario[name].CurrentElement = 0;
    gdo.net.scenario[name].Elements = [];
}

gdo.management.loadScenario = function () {
    //TODO load current scenario
}

gdo.management.saveScenario = function () {
    //TODO save current scenario
}

gdo.management.deleteScenario = function () {
    //TODO delete current scenario
}

gdo.management.parseFunction = function(func) {
    // func index of (
    //func1 substring to that index
    //func1 last index of .
    //func2 substring to that is module
    //func3 substring from that is function
    //func 4 substring from ( to last 2
    //func4 parse parameters
}