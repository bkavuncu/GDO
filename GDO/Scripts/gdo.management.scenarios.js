gdo.management.scenarios = {};
gdo.management.scenarios.isPlaying = false;

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
    gdo.net.scenario[name].CurrentElement = -1;
    gdo.net.scenario[name].Elements = [];
    gdo.management.scenarios.currentScenario = name;
}

gdo.management.scenarios.addElement = function () {
    gdo.management.scenarios.saveUnsavedElements();
    var element = {};
    element.Mod = '';
    element.Func = '';
    element.Params = [];
    element.DefaultWait = 0;
    element.Wait = 0;
    element.IsLoop = false;
    element.Status = gdo.management.scenarios.ELEMENT_STATUS.NEW;
    if (gdo.net.scenario[gdo.management.scenarios.currentScenario].CurrentElement == -1) {
        element.Id = gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements.length;
        gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements.push(element);
    } else {
        element.Id = parseInt(gdo.net.scenario[gdo.management.scenarios.currentScenario].CurrentElement) + 1;
        gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements.splice(parseInt(gdo.net.scenario[gdo.management.scenarios.currentScenario].CurrentElement) + 1, 0, element);
        var length = gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements.length;
        for (var i = parseInt(gdo.net.scenario[gdo.management.scenarios.currentScenario].CurrentElement) + 2; i < length; i++) {
            gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[i].Id = gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[i].Id + 1;
        }
    }
    gdo.management.scenarios.updateScenarioCanvas();
}

gdo.management.scenarios.editElement = function (element) {
    gdo.management.scenarios.saveEdits();
    gdo.management.scenarios.saveUnsavedElements();
    gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[element.Id].Status = gdo.management.scenarios.ELEMENT_STATUS.NEW;
    gdo.net.scenario[gdo.management.scenarios.currentScenario].CurrentElement = -1;
    gdo.management.scenarios.updateScenarioCanvas();
}

gdo.management.scenarios.saveEdit = function (element) {
    if (typeof $("#scenario_element_" + element.Id + "_mod_input").val() != "undefined") {
        gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[element.Id].Mod = $("#scenario_element_" + element.Id + "_mod_input").val();
    }
    if (typeof $("#scenario_element_" + element.Id + "_func_input").val() != "undefined") {
        gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[element.Id].Func = $("#scenario_element_" + element.Id + "_func_input").val();
    }
    if (typeof $("#scenario_element_" + element.Id + "_params_input").val() != "undefined") {
        gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[element.Id].Params = [$("#scenario_element_" + element.Id + "_params_input").val()];
    }
    if (typeof $("#scenario_element_" + element.Id + "_wait_input").val() != "undefined") {
        gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[element.Id].DefaultWait = $("#scenario_element_" + element.Id + "_wait_input").val();
        gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[element.Id].Wait = parseFloat($("#scenario_element_" + element.Id + "_wait_input").val()).toFixed(1);
    }
    if (element.Mod != '' && element.Func != '' && element.Params == '') {
        try {
            eval("" + element.Mod + "."+element.Func);
            gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[element.Id].Params = eval("[getParamNames(eval('' + element.Mod + '.' + element.Func))]");
            if (gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[element.Id].Params == '') {
                gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[element.Id].Params = [];
            }
            gdo.management.scenarios.updateScenarioCanvas();
        } catch (e) {
        }
    }
}

gdo.management.scenarios.saveEdits = function () {
    for (var index in gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements) {
        if (!gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements.hasOwnProperty((index))) {
            continue;
        } else if (gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[index] != null) {
            if (gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[index].Status == gdo.management.scenarios.ELEMENT_STATUS.NEW) {
                gdo.management.scenarios.saveEdit(gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[index]);
                gdo.management.scenarios.updateScenarioCanvas();
            }
        }
    }
}

gdo.management.scenarios.saveUnsavedElements = function () {
    for (var index in gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements) {
        if (!gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements.hasOwnProperty((index))) {
            continue;
        } else if (gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[index] != null) {
            if (gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[index].Status == gdo.management.scenarios.ELEMENT_STATUS.NEW) {
                gdo.management.scenarios.saveElement(gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[index]);
                gdo.management.scenarios.updateScenarioCanvas();
            } else if (gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[index].Status == gdo.management.scenarios.ELEMENT_STATUS.CURRENT && index != gdo.net.scenario[gdo.management.scenarios.currentScenario].CurrentElement) {
                gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[index].Status = gdo.management.scenarios.ELEMENT_STATUS.DEFAULT;
            }
        }
    }
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
    gdo.management.scenarios.saveEdit(element);
    gdo.management.scenarios.updateScenarioCanvas();
}

gdo.management.scenarios.moveElement = function (element, direction) {
    if (gdo.management.scenarios.currentScenario != null) {
        gdo.management.scenarios.saveUnsavedElements();
        gdo.management.scenarios.saveEdits();
        var id = element.Id;
        if (direction && gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[id + 1] != null) {
            var temp = gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[id + 1];
            gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[id + 1] = gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[id];
            gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[id] = temp;
            gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[id].Id-- ;
            gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[id + 1].Id++;
            gdo.net.scenario[gdo.management.scenarios.currentScenario].CurrentElement++;
        } else if (gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[id - 1] != null) {
            var temp = gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[id - 1];
            gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[id - 1] = gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[id];
            gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[id] = temp;
            gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[id].Id++;
            gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[id - 1].Id--;
            gdo.net.scenario[gdo.management.scenarios.currentScenario].CurrentElement--;
        }
        gdo.management.scenarios.updateScenarioCanvas();
    }

}

gdo.management.scenarios.removeElement = function (element) {
    //gdo.management.scenarios.saveUnsavedElements();
    if (gdo.net.scenario[gdo.management.scenarios.currentScenario].CurrentElement != -1) {
        gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements.splice(element.Id, 1);
        var length = gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements.length;
        for (var i = parseInt(gdo.net.scenario[gdo.management.scenarios.currentScenario].CurrentElement); i < length; i++) {
            gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[i].Id = gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[i].Id - 1;
        }
        if (gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements.length > 0) {
            gdo.net.scenario[gdo.management.scenarios.currentScenario].CurrentElement = 0;
            gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[0].Status = gdo.management.scenarios.ELEMENT_STATUS.CURRENT;
        } else {
            gdo.net.scenario[gdo.management.scenarios.currentScenario].CurrentElement = -1;
        }
    }
    gdo.management.scenarios.updateScenarioCanvas();
}

gdo.management.scenarios.executeElement = function (element) {
    if (gdo.management.scenarios.currentScenario !=null && typeof element != 'undefined') {
        if (element.Wait > 0) {
            if (element.Wait == element.DefaultWait) {
                gdo.management.scenarios.isPlaying = true;
            }
            if (gdo.management.scenarios.isPlaying) {
                element.Wait = parseFloat(element.Wait - 0.1).toFixed(1);
                setTimeout(function () { gdo.management.scenarios.executeElement(element); }, 100);
            }
        } else {
            try {
                if (gdo.net.scenario[gdo.management.scenarios.currentScenario].CurrentElement <= gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements.length) {
                    gdo.consoleOut(".Scenario", 2, "Executing: " + element.Mod + "." + element.Func + "(" + element.Params + ");");
                    var res;
                    if (element.Mod == "") {
                        res = eval(element.Func + "(" + element.Params + ");");
                        
                    } else {
                        res = eval(element.Mod + "." + element.Func + "(" + element.Params + ");");
                    }
                    gdo.consoleOut(".Scenario", 2, "Result: " + res);
                    if (gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[element.Id + 1] != null && gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[element.Id + 1].Wait == -1) {
                        gdo.management.scenarios.isPlaying = false;
                    }
                    
                    gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[element.Id].Status = gdo.management.scenarios.ELEMENT_STATUS.SUCCESS;
                    if (element.Id + 1 >= gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements.length) {
                        gdo.net.scenario[gdo.management.scenarios.currentScenario].CurrentElement = -1;
                    } else {
                        gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[element.Id + 1].Status = gdo.management.scenarios.ELEMENT_STATUS.CURRENT;
                        gdo.net.scenario[gdo.management.scenarios.currentScenario].CurrentElement++;
                        if (gdo.net.scenario[gdo.management.scenarios.currentScenario].CurrentElement == gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements.length) {
                            gdo.management.scenarios.isPlaying = false;
                        }
                    }
                    if (gdo.management.scenarios.isPlaying) {
                        setTimeout(function () { gdo.management.scenarios.executeElement(gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[element.Id + 1]); }, 100);
                    }
                } else {
                    gdo.management.scenarios.isPlaying = false;
                }
            } catch (e) {
                gdo.net.scenario[gdo.management.scenarios.currentScenario].CurrentElement++;
                gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[element.Id].Status = gdo.management.scenarios.ELEMENT_STATUS.FAILED;
                gdo.management.scenarios.isPlaying = false;
                gdo.consoleOut(".Scenario", 5, "Encountered an error executing last command");
                gdo.management.scenarios.updateScenarioCanvas();
            }
        }
    }
    gdo.management.scenarios.updateScenarioCanvas();
}

gdo.management.scenarios.clearBody = function () {
    $("#scenario_area").empty();
    $("#scenario_area").append("<div id='scenario_labels' class='row' >" +
        "<div class='col-lg-1' style='border: 1px solid #333;color:#FFF'><font color='white'>&nbsp;&nbsp;Index</font></div>" +
        "<div class='col-lg-3' style='border: 1px solid #333;color:#FFF'><font color='white'>Module</font></div>" +
        "<div class='col-lg-3' style='border: 1px solid #333;color:#FFF'><font color='white'>Function</font></div>" +
        "<div class='col-lg-3' style='border: 1px solid #333;color:#FFF'><font color='white'>Parameters</font></div>" +
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
            icon = 'fa-edit';
            break;
        case gdo.management.scenarios.ELEMENT_STATUS.DEFAULT:
            color = '#999';
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
    if (element.Status == gdo.management.scenarios.ELEMENT_STATUS.NEW) {

        $("#scenario_area").append("<div id='scenario_element_" + element.Id + "' class='row' elementId='" + element.Id + "' >" +
        "<div id='scenario_element_" + element.Id + "_id' class='col-lg-1 input_field_div form-group' style='background:#2A2A2A;color:" + color + ";border: 1px solid #333;pointer-events: none;'><input type='text' class='input_field form-control' id='scenario_element_" + element.Id + "_id' value='" + element.Id + "' spellcheck='false' /></input></div>" +
        "<div id='scenario_element_" + element.Id + "_mod' class='col-lg-3    input_field_div form-group' style='background:#2A2A2A;color:" + color + ";border: 1px solid #333;'><input type='text' class='input_field form-control' id='scenario_element_" + element.Id + "_mod_input' value='" + element.Mod + "' spellcheck='false'/></input></div>" +
        "<div id='scenario_element_" + element.Id + "_func' class='col-lg-3    input_field_div form-group' style='background:#2A2A2A;color:" + color + ";border: 1px solid #333;'><input type='text' class='input_field form-control' id='scenario_element_" + element.Id + "_func_input' value='" + element.Func + "' spellcheck='false' /></input></div>" +
        "<div id='scenario_element_" + element.Id + "_params' class='col-lg-3    input_field_div form-group' style='background:#2A2A2A;color:" + color + ";border: 1px solid #333;'><input type='text' class='input_field form-control' id='scenario_element_" + element.Id + "_params_input' value='" + element.Params + "' spellcheck='false' /></input></div>" +
        "<div id='scenario_element_" + element.Id + "_wait' class='col-lg-1  input_field_div form-group' style='background:#2A2A2A;color:" + color + ";border: 1px solid #333;'><input type='text' class='input_field form-control' id='scenario_element_" + element.Id + "_wait_input' value='" + element.DefaultWait + "' spellcheck='false' /></input></div>" +
        "<div id='scenario_element_" + element.Id + "_status' class='col-lg-1  input_field_div form-group' style='background:#2A2A2A;color:" + color + ";border: 1px solid #333;pointer-events: none;'><span class='fa " + icon + " form-control' ></span></div>" +
        "</div>");
        $("#scenario_element_" + element.Id + "_mod_input").off().on('change', gdo.management.scenarios.saveEdits);
        $("#scenario_element_" + element.Id + "_mod_input").autocomplete({
            change: gdo.management.scenarios.saveEdits,
            position: {
                my: "left bottom",
                at: "left top"
            },
            source: gdo.functions.array.mods
        });
        $("#scenario_element_" + element.Id + "_func_input").off().on('change', gdo.management.scenarios.saveEdits);
        if (element.Mod != '') {
            $("#scenario_element_" + element.Id + "_func_input").autocomplete({
                change: gdo.management.scenarios.saveEdits,
                position: {
                    my: "left bottom",
                    at: "left top"
                },
                source: gdo.functions.array.funcs[element.Mod]
            });
        }
        $("#scenario_element_" + element.Id + "_params_input").off().on('change', gdo.management.scenarios.saveEdits);
        $("#scenario_element_" + element.Id + "_wait_input").off().on('change', gdo.management.scenarios.saveEdits);
    } else {
        $("#scenario_area").append("<div id='scenario_element_" + element.Id + "' class='row' elementId='" + element.Id + "' >" +
        "<div id='scenario_element_" + element.Id + "_id' class='col-lg-1' style='color:" + color + ";border: 1px solid #333;'>&nbsp;&nbsp;" + element.Id + "</div>" +
        "<div id='scenario_element_" + element.Id + "_mod' class='col-lg-3' style='color:" + color + ";border: 1px solid #333;'>&nbsp;" + element.Mod + "</div>" +
        "<div id='scenario_element_" + element.Id + "_func' class='col-lg-3' style='color:" + color + ";border: 1px solid #333;'>&nbsp;" + element.Func + "</div>" +
        "<div id='scenario_element_" + element.Id + "_params' class='col-lg-3' style='color:" + color + ";border: 1px solid #333;'>&nbsp;" + element.Params + "</div>" +
        "<div id='scenario_element_" + element.Id + "_wait' class='col-lg-1' style='color:" + color + ";border: 1px solid #333;'>&nbsp;" + element.Wait + "</div>" +
        "<div id='scenario_element_" + element.Id + "_status' class='col-lg-1' style='color:" + color + ";border: 1px solid #333;'><span class='fa " + icon + "'></span></div>" +
        "</div>");
        $("#scenario_element_" + element.Id + "").unbind().click(function () {
            gdo.net.scenario[gdo.management.scenarios.currentScenario].CurrentElement = $(this).attr('elementId');
            gdo.management.scenarios.selectElement(parseInt($(this).attr('elementId')));
            gdo.management.scenarios.updateScenarioCanvas();
        });
    }

}

gdo.management.scenarios.selectElement = function (id){
    for (var index in gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements) {
        if (!gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements.hasOwnProperty((index))) {
            continue;
        } else if (gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[index] != null) {
            if (gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[index].Status == gdo.management.scenarios.ELEMENT_STATUS.CURRENT) {
                gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[index].Status = gdo.management.scenarios.ELEMENT_STATUS.DEFAULT;
            } else if (index == id) {
                gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[index].Status = gdo.management.scenarios.ELEMENT_STATUS.CURRENT;
            }
        }
    }
}

gdo.management.scenarios.updateScenarioCanvas = function () {
    gdo.management.scenarios.clearBody();
    if (gdo.management.scenarios.currentScenario != null) {
        if (typeof gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[gdo.net.scenario[gdo.management.scenarios.currentScenario].CurrentElement] != 'undefined') {
            gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[gdo.net.scenario[gdo.management.scenarios.currentScenario].CurrentElement].Status = gdo.management.scenarios.ELEMENT_STATUS.CURRENT;
        }
        for (var index in gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements) {
            if (!gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements.hasOwnProperty((index))) {
                continue;
            } else if (gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[index] != null) {
                gdo.management.scenarios.addElementToUI(gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[index]);
            }
        }
    }
}

gdo.management.scenarios.loadScenario = function (name) {
    gdo.management.scenarios.currentScenario = name;
    $("#scenario_label").empty().append("<h6><span class='fa fa-list'></span>&nbsp;&nbsp;" + gdo.management.scenarios.currentScenario + "</h6>");
    $("#scenario_panel").addClass("panel-primary").removeClass("panel-default");
    $("#loadButton").hide();
    $("#unloadButton").show();
    $("#deleteButton").show();
    $("#resetButton").show();
    $("#saveButton").show();
    for (var index in gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements) {
        if (!gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements.hasOwnProperty((index))) {
            continue;
        } else if (gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[index] != null) {
            gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[index].Status = gdo.management.scenarios.ELEMENT_STATUS.DEFAULT;
            gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[index].Wait = gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[index].DefaultWait;
        }
    }
    if (gdo.management.scenarios.currentScenario > 0 && gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements.length > 0) {
        gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[0].Status = gdo.management.scenarios.ELEMENT_STATUS.CURRENT;
        gdo.net.scenario[gdo.management.scenarios.currentScenario].CurrentElement = 0;
    } else {
        gdo.net.scenario[gdo.management.scenarios.currentScenario].CurrentElement = -1;
    }

    gdo.management.scenarios.updateScenarioCanvas();
}

gdo.management.scenarios.unloadScenario = function () {
    $("#scenario_label").empty().append("<h6><span class='fa fa-list'></span>&nbsp;&nbsp;</h6>");
    $("#scenario_panel").addClass("panel-default").removeClass("panel-primary");
    $("#loadButton").show();
    $("#unloadButton").hide();
    $("#deleteButton").hide();
    $("#resetButton").hide();
    $("#saveButton").hide();
    gdo.management.scenarios.currentScenario = null;
    gdo.management.scenarios.clearBody();
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
    $("#playButton").show();
    $("#nextButton").show();
    $("#pauseButton").show();
    $("#addButton").show();
    $("#editButton").show();
    $("#removeButton").show();
    gdo.consoleOut('.Scenario', 1, 'Created New Scenario:' + gdo.management.scenarios.currentScenario);
});

$("#loadScenario").unbind().click(function () {

    if (gdo.management.scenarios.currentScenario != null) {
        gdo.consoleOut('.Scenario', 1, 'Loading Scenario:' + gdo.management.scenarios.currentScenario);
        gdo.management.scenarios.loadScenario(gdo.management.scenarios.currentScenario);
        gdo.management.scenarios.displayScenariosToLoad("");
        $("#playButton").show();
        $("#nextButton").show();
        $("#pauseButton").show();
        $("#addButton").show();
        $("#editButton").show();
        $("#removeButton").show();
        $("#upButton").show();
        $("#downButton").show();
        $("#saveElementButton").show();
    }
});


$("#unloadScenario").unbind().click(function () {
    if (gdo.management.scenarios.currentScenario != null) {
        gdo.consoleOut('.Scenario', 1, 'Unloading Scenario: ' + gdo.management.scenarios.currentScenario);
        gdo.management.scenarios.unloadScenario();
        gdo.management.scenarios.displayScenariosToLoad("");
        $("#playButton").hide();
        $("#nextButton").hide();
        $("#pauseButton").hide();
        $("#addButton").hide();
        $("#editButton").hide();
        $("#removeButton").hide();
        $("#upButton").hide();
        $("#downButton").hide();
        $("#saveElementButton").hide();
    }
});

$("#resetScenario").unbind().click(function () {
    if (gdo.management.scenarios.currentScenario != null) {
        gdo.consoleOut('.Scenario', 1, 'Reseting Scenario: ' + gdo.management.scenarios.currentScenario);
        gdo.management.scenarios.isPlaying = false;
        for (var index in gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements) {
            if (!gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements.hasOwnProperty((index))) {
                continue;
            } else if (gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[index] != null) {
                gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[index].Status = gdo.management.scenarios.ELEMENT_STATUS.DEFAULT;
                gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[index].Wait = gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[index].DefaultWait;
            }
        }
        if (gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[0] != null) {
            gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[0].Status = gdo.management.scenarios.ELEMENT_STATUS.CURRENT;
            gdo.net.scenario[gdo.management.scenarios.currentScenario].CurrentElement = 0;
        }
        gdo.management.scenarios.updateScenarioCanvas();
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
        gdo.net.server.removeScenario(gdo.management.scenarios.currentScenario);
        gdo.management.scenarios.unloadScenario();
        gdo.management.scenarios.displayScenariosToLoad("");
    }
});


$("#clear_cave_button").unbind().click(function () {
        gdo.consoleOut('.Scenario', 1, 'Clearing Cave');
        gdo.net.server.clearCave();
});

$("#playButton").unbind().click(function () {
    if (!gdo.management.scenarios.isPlaying) {
        gdo.management.scenarios.saveUnsavedElements();
        gdo.management.scenarios.isPlaying = true;
        if (gdo.net.scenario[gdo.management.scenarios.currentScenario].CurrentElement < 0) {
            gdo.net.scenario[gdo.management.scenarios.currentScenario].CurrentElement = 0;
        }
        gdo.management.scenarios.executeElement(gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[gdo.net.scenario[gdo.management.scenarios.currentScenario].CurrentElement]);
    }
});

$("#nextButton").unbind().click(function () {
    if (gdo.management.scenarios.currentScenario != null) {
        gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[gdo.net.scenario[gdo.management.scenarios.currentScenario].CurrentElement].Wait = -1;
    }
});

$("#pauseButton").unbind().click(function () {
    gdo.management.scenarios.isPlaying = false;
});

$("#addButton").unbind().click(function () {
    gdo.management.scenarios.addElement();
});

$("#editButton").unbind().click(function () {
    if (gdo.management.scenarios.currentScenario != null && gdo.net.scenario[gdo.management.scenarios.currentScenario].CurrentElement >= 0) {
        gdo.management.scenarios.editElement(gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[gdo.net.scenario[gdo.management.scenarios.currentScenario].CurrentElement]);
    }
});

$("#removeButton").unbind().click(function () {
    if (gdo.management.scenarios.currentScenario != null && gdo.net.scenario[gdo.management.scenarios.currentScenario].CurrentElement >= 0) {
        gdo.management.scenarios.removeElement(gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[gdo.net.scenario[gdo.management.scenarios.currentScenario].CurrentElement]);
    }
});

$("#upButton").unbind().click(function () {
    if (gdo.management.scenarios.currentScenario != null && gdo.net.scenario[gdo.management.scenarios.currentScenario].CurrentElement >= 0) {
        gdo.management.scenarios.moveElement(gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[gdo.net.scenario[gdo.management.scenarios.currentScenario].CurrentElement], false);
    }
});

$("#downButton").unbind().click(function () {
    if (gdo.management.scenarios.currentScenario != null && gdo.net.scenario[gdo.management.scenarios.currentScenario].CurrentElement >= 0) {
        gdo.management.scenarios.moveElement(gdo.net.scenario[gdo.management.scenarios.currentScenario].Elements[gdo.net.scenario[gdo.management.scenarios.currentScenario].CurrentElement], true);
    }
});

$("#saveElementButton").unbind().click(function () {
    gdo.management.scenarios.saveUnsavedElements();
});