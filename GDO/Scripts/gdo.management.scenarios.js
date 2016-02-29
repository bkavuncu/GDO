gdo.management.scenarios = {};
gdo.management.scenarios.isPlaying = false;
gdo.management.scenarios.selectedElement = -1;

gdo.management.scenarios.ELEMENT_STATUS = {
    NEW: 0,
    DEFAULT: 1,
    SUCCESS: 2,
    CURRENT: 3,
    FAILED: 4
};

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

gdo.management.scenarios.addElement = function () {
    //if there are unsaved elements, save them
    //update all scenario Id; in array
    gdo.management.scenarios.updateScenarioCanvas(gdo.management.scenarios.currentScenario);
}

gdo.management.scenarios.saveElement = function (element) {
    if (gdo.management.scenarios.currentScenario != null) {
        if (gdo.net.scenario[gdo.management.scenarios.currentScenario].CurrentElement == element.Id) {
            element.Status = gdo.management.scenarios.ELEMENT_STATUS.CURRENT;
        } else if (gdo.net.scenario[gdo.management.scenarios.currentScenario].CurrentElement > element.Id) {
            element.Status = gdo.management.scenarios.ELEMENT_STATUS.DEFAULT;
        } else if (gdo.net.scenario[gdo.management.scenarios.currentScenario].CurrentElement < element.Id) {
            element.Status = gdo.management.scenarios.ELEMENT_STATUS.DEFAULT;
        }
    }
    //put values into element
    gdo.management.scenarios.updateScenarioCanvas(gdo.management.scenarios.currentScenario);
}

gdo.management.scenarios.removeElement = function () {

    gdo.management.scenarios.updateScenarioCanvas(gdo.management.scenarios.currentScenario);
}

gdo.management.scenarios.play = function() {
    //if no scenario
    //if unsaved element fails

}

gdo.management.scenarios.executeElement = function (element) {
    if (element.Wait > 0) {
        if (element.Wait == element.DefaultWait) {
            gdo.management.scenarios.isPlaying = true;
        }
        if (gdo.management.scenarios.isPlaying) {
            element.Wait--;
            setTimeout(function() { gdo.management.scenarios.executeElement(element); }, 1000);
        }
    } else {
        try {
            eval(element.Mod + element.Func + element.Params + ";");
            element.Status = gdo.management.scenarios.ELEMENT_STATUS.SUCCESS;
            gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[element.Id + 1].Status = gdo.management.scenarios.ELEMENT_STATUS.CURRENT;
            if (gdo.management.scenarios.isPlaying) {
                setTimeout(function () { gdo.management.scenarios.executeElement(gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[element.Id + 1]); }, 100);
            }
        } catch (e) {
            if (e instanceof SyntaxError) {
                element.Status = gdo.management.scenarios.ELEMENT_STATUS.FAILED;
                gdo.management.scenarios.isPlaying = false;
            }
        }
    }
    gdo.management.scenarios.updateScenarioCanvas(gdo.management.scenarios.currentScenario);
}

gdo.management.scenarios.clearBody = function () {
    $("#scenario_area").empty();
    $("#scenario_area").append("<div id='scenario_labels' class='row' >" +
        "<div class='col-lg-2' style='border: 1px solid #333;color:#FFF'><font color='white'>&nbsp;&nbsp;Index</font></div>" +
        "<div class='col-lg-2' style='border: 1px solid #333;color:#FFF'><font color='white'>Module</font></div>" +
        "<div class='col-lg-2' style='border: 1px solid #333;color:#FFF'><font color='white'>Function</font></div>" +
        "<div class='col-lg-4' style='border: 1px solid #333;color:#FFF'><font color='white'>Parameters</font></div>" +
        "<div class='col-lg-1' style='border: 1px solid #333;color:#FFF'><font color='white'>Timeout</font></div>" +
        "<div class='col-lg-1' style='border: 1px solid #333;color:#FFF'><font color='white'>Status</font></div>" +
        "</div>");
}

gdo.management.scenarios.addElementToUI = function (element) {
    var color = 'gray';
    var icon = '';
    switch (element.Status) {
        case gdo.management.scenarios.ELEMENT_STATUS.NEW:
            color = 'white';
            icon = 'fa-save';
            break;
        case gdo.management.scenarios.ELEMENT_STATUS.DEFAULT:
            color = '#444';
            icon = '';
            break;
        case gdo.management.scenarios.ELEMENT_STATUS.SUCCESS:
            color = '#77B200';
            icon = 'fa-check';
            break;
        case gdo.management.scenarios.ELEMENT_STATUS.CURRENT:
            color = '#4CBFF8';
            if (element.DefaultWait != element.Wait) {
                icon = 'fa-spinner';
            } else {
                icon = 'fa-pause';
            }
            break;
        case gdo.management.scenarios.ELEMENT_STATUS.FAILED:
            color = '#FF2200';
            icon = 'fa-times';
            break;
    }
    if (gdo.management.scenarios.selectedElement == element.Id) {
        color = '#cc0099';
    }
    if (element.Status == gdo.management.scenarios.ELEMENT_STATUS.NEW) {
        $("#scenario_area").append("<div id='scenario_element_" + element.Id + "' class='row' elementId='" + element.Id + "' >" +
        "<div id='scenario_element_" + element.Id + "_id' class='col-lg-2' style='color:" + color + ";border: 1px solid #333;'>&nbsp;&nbsp;" + element.Id + "</div>" +
        "<div id='scenario_element_" + element.Id + "_mod' class='col-lg-2' style='color:" + color + ";border: 1px solid #333;'><input type='text' id='scenario_element_" + element.Id + "_mod_input' value='' spellcheck='false'/></input></div>" +
        "<div id='scenario_element_" + element.Id + "_func' class='col-lg-2' style='color:" + color + ";border: 1px solid #333;'>" + element.Func + "</div>" +
        "<div id='scenario_element_" + element.Id + "_params' class='col-lg-4' style='color:" + color + ";border: 1px solid #333;'>" + element.Params + "</div>" +
        "<div id='scenario_element_" + element.Id + "_wait' class='col-lg-1' style='color:" + color + ";border: 1px solid #333;'>" + element.Wait + "</div>" +
        "<div id='scenario_element_" + element.Id + "_status' class='col-lg-1' style='color:" + color + ";border: 1px solid #333;'><span class='fa " + icon + "'></span></div>" +
        "</div>");
    } else {
        $("#scenario_area").append("<div id='scenario_element_" + element.Id + "' class='row' elementId='" + element.Id + "' >" +
        "<div id='scenario_element_" + element.Id + "_id' class='col-lg-2' style='color:" + color + ";border: 1px solid #333;'>&nbsp;&nbsp;" + element.Id + "</div>" +
        "<div id='scenario_element_" + element.Id + "_mod' class='col-lg-2' style='color:" + color + ";border: 1px solid #333;'>" + element.Mod + "</div>" +
        "<div id='scenario_element_" + element.Id + "_func' class='col-lg-2' style='color:" + color + ";border: 1px solid #333;'>" + element.Func + "</div>" +
        "<div id='scenario_element_" + element.Id + "_params' class='col-lg-4' style='color:" + color + ";border: 1px solid #333;'>" + element.Params + "</div>" +
        "<div id='scenario_element_" + element.Id + "_wait' class='col-lg-1' style='color:" + color + ";border: 1px solid #333;'>" + element.Wait + "</div>" +
        "<div id='scenario_element_" + element.Id + "_status' class='col-lg-1' style='color:" + color + ";border: 1px solid #333;'><span class='fa " + icon + "'></span></div>" +
        "</div>");
        $("#scenario_element_" + element.Id + "").unbind().click(function () {
            gdo.management.scenarios.selectedElement = $(this).attr('elementId');
            gdo.management.scenarios.updateScenarioCanvas(gdo.management.scenarios.currentScenario);
        });
    }

}

gdo.management.scenarios.updateScenarioCanvas = function (name) {
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

gdo.management.scenarios.loadScenario = function (name) {
    gdo.management.scenarios.currentScenario = name;
    gdo.management.scenarios.updateScenarioCanvas(name);
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
    gdo.consoleOut('.Scenario', 1, 'Created New Scenario:' + gdo.management.scenarios.currentScenario);
});

$("#loadScenario").unbind().click(function () {

    if (gdo.management.scenarios.currentScenario != null) {
        gdo.consoleOut('.Scenario', 1, 'Loading Scenario:' + gdo.management.scenarios.currentScenario);
        gdo.management.scenarios.loadScenario(gdo.management.scenarios.currentScenario);
        gdo.management.scenarios.displayScenariosToLoad("");
    }
});


$("#unloadScenario").unbind().click(function () {
    if (gdo.management.scenarios.currentScenario != null) {
        gdo.consoleOut('.Scenario', 1, 'Unloading Scenario: ' + gdo.management.scenarios.currentScenario);
        gdo.management.scenarios.unloadScenario();
        gdo.management.scenarios.displayScenariosToLoad("");
    }
});

$("#saveScenario").unbind().click(function () {
    if (gdo.management.scenarios.currentScenario != null) {
        gdo.consoleOut('.Scenario', 1, 'Saving Scenario: ' + gdo.management.scenarios.currentScenario);
        gdo.net.server.saveScenario(JSON.stringify(gdo.net.scenario[gdo.management.scenarios.currentScenario]));
        gdo.management.scenarios.displayScenariosToLoad("");
    }
});

$("#deleteScenario").unbind().click(function() {
    if (gdo.management.scenarios.currentScenario != null) {
        gdo.consoleOut('.Scenario', 1, 'Deleting Scenario: ' + gdo.management.scenarios.currentScenario);
        gdo.management.scenarios.unloadScenario();
        gdo.net.server.removeScenario(gdo.management.scenarios.currentScenario);
        gdo.management.scenarios.displayScenariosToLoad("");
    }
});


$("#clear_cave_button").unbind().click(function () {
        gdo.consoleOut('.Scenario', 1, 'Clearing Cave');
        gdo.net.server.clearCave();
});
