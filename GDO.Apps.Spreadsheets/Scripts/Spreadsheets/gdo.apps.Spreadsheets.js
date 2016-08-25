$(function () {
    gdo.consoleOut(".Spreadsheets", 1, "Loaded Spreadsheets JS");
    $.connection.spreadsheetsAppHub.client.receiveName = function (instanceId, name) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.consoleOut(".Spreadsheets", 1, "Instance - " + instanceId + ": Received Name : " + name);
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut(".Spreadsheets", 1, "Instance - " + instanceId + ": Received Name : " + name);
            $("iframe").contents().find("#sheet_details").empty().append(name);
        }
    };
    $.connection.spreadsheetsAppHub.client.serverToConsole = function (instanceId, level, text) {
        gdo.consoleOut(".Spreadsheets", level, "Instance - " + instanceId + ": SERVER : " + text);
    };
});

gdo.net.app["Spreadsheets"].initClient = function () {
    gdo.consoleOut(".Spreadsheets", 1, "Initializing Spreadsheets App Client at Node " + gdo.clientId);
};

var loadModules = function () {
    this.instanceId = gdo.net.node[gdo.clientId].appInstanceId;// this is a shortcut which is depended upon by LoadModules

    gdo.loadScript("viewModel", "Spreadsheets", gdo.SCRIPT_TYPE.APP);
    gdo.loadScript("clearModel", "Spreadsheets", gdo.SCRIPT_TYPE.APP);
    gdo.loadScript("clearServer", "Spreadsheets", gdo.SCRIPT_TYPE.APP);
    gdo.loadScript("registerInstance", "Spreadsheets", gdo.SCRIPT_TYPE.APP);
    gdo.loadScript("runAnalysis", "Spreadsheets", gdo.SCRIPT_TYPE.APP);
    gdo.loadScript("setupGeneticAlgorithm", "Spreadsheets", gdo.SCRIPT_TYPE.APP);
    gdo.loadScript("linkOutputs", "Spreadsheets", gdo.SCRIPT_TYPE.APP);
    gdo.loadScript("unfoldModel", "Spreadsheets", gdo.SCRIPT_TYPE.APP);
    gdo.loadScript("createFormulaTree", "Spreadsheets", gdo.SCRIPT_TYPE.APP);
};

var setEventHandlers = function (message, section) {
    $("iframe").contents().find("#view_model").unbind().click(function () {
        $("iframe").contents().find("#results").show();
        $("iframe").contents().find("#unfoldingMap").hide();
        $("iframe").contents().find("#view_model_result").show();
        $("iframe").contents().find("#view_model_result").siblings().hide();
        gdo.consoleOut(".Spreadsheets", 1, "viewModel selected, now to run task.");
        gdo.net.app["Spreadsheets"].viewModel(gdo.controlId, message.data[0], section);
    });

    $("iframe").contents().find("#unfold_model").unbind().click(function () {
        $("iframe").contents().find("#results").show();
        $("iframe").contents().find("#unfoldingMap").empty().show();
        $("iframe").contents().find("#unfold_model_result").show();
        $("iframe").contents().find("#unfold_model_result").siblings().hide();
        $('iframe').contents().find('#trace_precedent_section').hide();
        gdo.consoleOut(".Spreadsheets", 1, "unfoldModel selected, now to get the viewing information.");
        gdo.net.app["Spreadsheets"].unfoldModel(gdo.controlId, message.data[0], message.data[1]);
    });

    $("iframe").contents().find("#clear_model").unbind().click(function () {
        gdo.consoleOut(".Spreadsheets", 1, "clearing model files from console applications.");
        gdo.net.app["Spreadsheets"].clearModel(gdo.controlId);
    });

    $("iframe").contents().find("#clear_server").unbind().click(function () {
        gdo.consoleOut(".Spreadsheets", 1, "clearing data about spreadsheet app from server.");
        gdo.net.app["Spreadsheets"].clearServer(gdo.controlId);
    });

    $("iframe").contents().find("#analysis").unbind().click(function () {
        $("iframe").contents().find("#results").show();
        $("iframe").contents().find("#unfoldingMap").hide();
        $("iframe").contents().find("#analysis_result").show();
        $("iframe").contents().find("#analysis_result").siblings().hide();
        gdo.consoleOut(".Spreadsheets", 1, "running analysis on " + message.data[0].Filename + " with config file " + message.data[1].Filename);
        gdo.net.app["Spreadsheets"].runAnalysis(gdo.controlId, message.data[0], message.data[1], section);
    });

    $("iframe").contents().find("#link_outputs").unbind().click(function () {
        $("iframe").contents().find("#results").show();
        $("iframe").contents().find("#unfoldingMap").hide();
        $("iframe").contents().find("#link_result").show();
        $("iframe").contents().find("#link_result").siblings().hide();
        gdo.consoleOut(".Spreadsheets", 1, "output linking selected on " + message.data[0].Filename + " with config file " + message.data[1].Filename);
        gdo.net.app["Spreadsheets"].linkOutputs(gdo.controlId, message.data[0], message.data[1], section);
    });

    $("iframe").contents().find("#genetic_algorithm").unbind().click(function () {
        $("iframe").contents().find("#results").show();
        $("iframe").contents().find("#unfoldingMap").hide();
        $("iframe").contents().find("#genetic_algorithm_result").hide();
        gdo.consoleOut(".Spreadsheets", 1, "GA option selected on " + message.data[0].Filename + " with config file " + message.data[1].Filename);
        gdo.net.app["Spreadsheets"].setupGeneticAlgorithm(gdo.controlId, message.data[0], message.data[1]);
    });
};

var uploadFiles = function (spreadSheet, config) {
    gdo.net.app["Spreadsheets"].server.setName(gdo.controlId, spreadSheet.name + " <br /> " + config.name);
    var confName = this.gdo.net.instance[this.instanceId].configName;
    var conf = this.gdo.net.app["Spreadsheets"].config[configName];
    gdo.consoleOut(".Spreadsheets", 1, "Set Name, now calling FileAdded on Server");
    $("iframe").contents().find("#file_upload_form").unbind("submit").submit(function (event) {
        event.preventDefault();
        var formData = new FormData();
        formData.append("files", spreadSheet);
        formData.append("files", config);
        gdo.consoleOut(".Spreadsheets", 1, "Submitting form to Spreadsheet Server");
        $.ajax({
            url: conf.serverAddress + "File/Upload",
            type: "POST",
            data: formData,
            success: function (message) {
                gdo.consoleOut(".Spreadsheets", 1, message.message);
                $("iframe").contents().find("#uploaded_files").html(message.data[0].Filename + "," + message.data[1].Filename);
                $("iframe").contents().find("#operation").show();
                $("iframe").contents().find("#results").hide();
                $("iframe").contents().find("#unfoldingMap").hide();
                gdo.consoleOut(".Spreadsheets", 1, "Registering instance id and section.");
                var section = gdo.net.section.find(
                    function(s) {
                        return s.appInstanceId === parseInt(gdo.controlId, 10) && s.id !== 0;
                    }
                );
                gdo.net.app["Spreadsheets"].registerInstance(gdo.controlId, section);
                setEventHandlers(message, section);
            },
            processData: false,
            contentType: false
        });
    });
    $("iframe").contents().find("#file_upload_form").submit();
};

gdo.net.app["Spreadsheets"].initControl = function () {
    loadModules();

    gdo.controlId = getUrlVar("controlId");
    gdo.net.app["Spreadsheets"].server.requestName(gdo.controlId);
    gdo.consoleOut(".Spreadsheets", 1, "Initializing Spreadsheets App Control at Instance " + gdo.controlId);

    $("iframe").contents().find("#operation").hide();
    $("iframe").contents().find("#spreadsheet_submit")
    .unbind()
    .click(function () {
        var type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        var type2 = "application/vnd.ms-excel.sheet.macroEnabled.12";
        var spreadSheet = $("iframe").contents().find("#sheet").get(0).files[0];
        var config = $("iframe").contents().find("#var").get(0).files[0];
        if (spreadSheet != undefined && config != undefined) {
            if ((spreadSheet.type === type || spreadSheet.type === type2) && config.type === type) {
                uploadFiles(spreadSheet, config);
            } else {
                alert("files should be of type .xls or .xlsx");
                gdo.consoleOut(".Spreadsheets", 5, "files should be of type .xls or .xlsx");
            }
        } else {
            alert("please enter a file for both sections.");
            gdo.consoleOut(".Spreadsheets", 5, "please enter a file for both sections.");
        }
    });
};

gdo.net.app["Spreadsheets"].terminateClient = function () {
    gdo.consoleOut(".Spreadsheets", 1, "Terminating Spreadsheets App Client at Node " + clientId);
};

gdo.net.app["Spreadsheets"].ternminateControl = function () {
    gdo.consoleOut(".Spreadsheets", 1, "Terminating Spreadsheets App Control at Instance " + gdo.controlId);
};