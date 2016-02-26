gdo.management.scenarios = {};

$(function () {
    gdo.management.scenarios.isActive = true;
    gdo.management.scenarios.currentScenario = null;
    gdo.management.scenarios.displayScenariosToLoad("");
    $("#scenario_area").enscroll({
        showOnHover: false,
        verticalTrackClass: 'track4',
        verticalHandleClass: 'handle4'
    }).css("padding-right", "0px");
    gdo.management.scenarios.clearBody();
});

gdo.management.scenarios.newScenario = function (name) {
    gdo.net.scenario[name] = {};
    gdo.net.scenario[name].Name = name;
    gdo.net.scenario[name].CurrentElement = 0;
    gdo.net.scenario[name].Elements = [];
    gdo.management.scenarios.currentScenario = name;
}

gdo.management.scenarios.addElement = function ()
{
    
}

gdo.management.scenarios.removeElement = function () {

}

gdo.management.scenarios.executeElement = function () {

}

gdo.management.scenarios.clearBody = function () {
    $("#scenario_area").empty();
    $("#scenario_area").append("<div id='scenario_labels' class='row' >" +
        "<div class='col-lg-1' style='border: 1px solid #333;color:#FFF'><font color='white'>&nbsp;&nbsp;Index</font></div>" +
        "<div class='col-lg-3' style='border: 1px solid #333;color:#FFF'><font color='white'>Module</font></div>" +
        "<div class='col-lg-3' style='border: 1px solid #333;color:#FFF'><font color='white'>Function</font></div>" +
        "<div class='col-lg-4' style='border: 1px solid #333;color:#FFF'><font color='white'>Parameters</font></div>" +
        "<div class='col-lg-1' style='border: 1px solid #333;color:#FFF'><font color='white'>Timeout</font></div>" +
        "</div>");
}

gdo.management.scenarios.addElementToUI = function (element) {
    $("#scenario_area").append("<div id='scenario_element_" + element.Id + "' class='row' >" +
        "<div class='col-lg-1' style='border: 1px solid #333;'>&nbsp;&nbsp;" + element.Id + "</div>" +
        "<div class='col-lg-3' style='border: 1px solid #333;'>" + element.Mod + "</div>" +
        "<div class='col-lg-3' style='border: 1px solid #333;'>" + element.Func + "</div>" +
        "<div class='col-lg-4' style='border: 1px solid #333;'>" + element.Params + "</div>" +
        "<div class='col-lg-1' style='border: 1px solid #333;'>" + element.Wait + "</div>" +
        "</div>");
}

gdo.management.scenarios.loadScenario = function (name) {
    gdo.management.scenarios.currentScenario = name;
    $("#scenario_label").empty().append("<h6><span class='fa fa-list'></span>&nbsp;&nbsp;" + name + "</h6>");
    $("#scenario_panel").addClass("panel-primary").removeClass("panel-default");
    $("#loadButton").hide();
    $("#unloadButton").show();
    gdo.management.scenarios.clearBody();
    for (var index in gdo.net.scenario[name].Elements) {
        if (!gdo.net.scenario[name].Elements.hasOwnProperty((index))) {
            continue;
        } else if (gdo.net.scenario[name].Elements[index] != null) {
            gdo.management.scenarios.addElementToUI(gdo.net.scenario[name].Elements[index]);
        }
    }
}

gdo.management.scenarios.unloadScenario = function () {
    $("#scenario_label").empty().append("<h6><span class='fa fa-list'></span>&nbsp;&nbsp;</h6>");
    $("#scenario_panel").addClass("panel-default").removeClass("panel-primary");
    $("#loadButton").show();
    $("#unloadButton").hide();
    gdo.management.scenarios.currentScenario = null;
    gdo.management.scenarios.clearBody();
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


$("#unloadScenario").unbind().click(function () {
    if (gdo.management.scenarios.currentScenario != null) {
        gdo.management.scenarios.unloadScenario();
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
        gdo.management.scenarios.unloadScenario();
        gdo.net.server.removeScenario(gdo.management.scenarios.currentScenario);
        gdo.management.scenarios.displayScenariosToLoad("");
    }
});



