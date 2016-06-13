var viewSheet = function(id, sheet) {
    $.ajax({
        url: "http://146.169.45.194/SheetServer/Operations/ViewOnAllNodes",
        method: "POST",
        data : { instanceId : id, sheet : sheet },
        success: function(response) {
            gdo.consoleOut(".Spreadsheets", 1, response);
        }
    });
}

var checkGeneticAlgorithm = function (id) {
    $.ajax({
        url: "http://146.169.45.194/SheetServer/Operations/CheckGeneticAlgorithm",
        method: "GET",
        data: { instanceId: id },
        success: function(response) {
            if (response.complete && response.data != null) {
                var message = "<p>Best Result</p><ul>";
                message += response.data.map(function (i) { return "<li>" + i.Key + " : " + i.Value.toFixed(2) + "</li>"; }).join("\n");
                message += "</ul>";
                message += "<p>Input Chromosome:</p>";
                message += "<p>" + response.inputs.map(function (i) { return i.Value === true ? "1" : "0"; }).join('') + "</p>";
                message += "<p>Hamming Weight : " + response.inputs.filter(function (i) { return i.Value === true; }).length + " </p>";
                $('iframe').contents().find('#genetic_algorithm_message').html(message);
            } else {
                $('iframe').contents().find('#genetic_algorithm_message').html("<p> Genetic Algorithm Running - " + response.iterations + " iterations");
                setTimeout(function() { checkGeneticAlgorithm(id) }, 500);
            }
        }
    });
}

var startGeneticAlgorithm = function (id, numInputs, fitnessDefinition, iterations, chromosomesPerNode, demoMode, visualMode, hammingWeight) {
    var chromPerNode = chromosomesPerNode;
    if (demoMode === "true") {
        chromPerNode = 1;
    }
    gdo.consoleOut(".Spreadsheets", 1, "running GA for instance ID " +
        id + " with " + numInputs + " inputs and " + iterations + " iterations with " + chromPerNode + " chromosomes per node.");
        $.ajax({
            url: "http://146.169.45.194/SheetServer/Operations/StartGeneticAlgorithm",
            method: "POST",
            data: {
                instanceId: id,
                numInputs: numInputs,
                fitnessDefinition: fitnessDefinition,
                iterations: iterations,
                chromosomesPerNode: chromPerNode,
                demoMode : demoMode,
                visualMode: visualMode,
                hammingWeight: hammingWeight
            },
            success: function (response) {
                gdo.consoleOut(".Spreadsheets", 1, JSON.stringify(response));
                checkGeneticAlgorithm(id);
            }
    });
}

var getFitnessDefinitions = function(response, options) {
    var fitnessDefinition = [];
    for (var i = 0; i < response.outputs.length; i++) {
        var direction = options.filter(function (o) { return o.name === ('o' + i); })[0].value;
        var weight = options.filter(function (w) { return w.name === ('w' + i); })[0].value;
        fitnessDefinition.push({ Name: response.outputs[i].Name, Direction: direction, Weight: weight });
    }
    return fitnessDefinition;
}

var createForm = function (id,response) {
    var form = $('iframe').contents().find('#output_definition_form');
    form.empty().append("<div class=\"form-inline\"><h5>Settings</h6>" +
                    "<label>Generations</label><input type=\"number\" class=\"form-control\" style=\"width:6em\" id=\"iterations\" value=10 />" +
                    "<label>Chromosomes Per Node</label>" +
                    "<input type=\"number\" class=\"form-control\" style=\"width:6em\" id=\"chromosomesPerNode\" value=2 min=2 step=2 />" +
                    "</div>" +

                    "<h6 data-toggle=\"tooltip\" title=\"Runs Genetic Algorithm slowly with 1 chromosome per node and clusters similar chromosomes.\">Demo Mode</h6>" +
                    "<label class=\"radio-inline\">" +
                    "<input type=\"radio\" name=\"demoMode\" value=\"true\">Yes" +
                    "</label>" +
                    "<label class=\"radio-inline\">" +
                    "<input type=\"radio\" name=\"demoMode\" value=\"false\" checked>No" +
                    "</label>" +

                    "<h6 data-toggle=\"tooltip\" title=\"Shows chart of fitness and outputs.\">Visual Mode</h6>" +
                    "<label class=\"radio-inline\">" +
                    "<input type=\"radio\" name=\"visualMode\" value=\"true\">Yes" +
                    "</label>" + 
                    "<label class=\"radio-inline\">" +
                    "<input type=\"radio\" name=\"visualMode\" value=\"false\" checked>No" +
                    "</label>" +

                    "<h6 data-toggle=\"tooltip\" title=\"Weight algorithm so that it tends towards having fewer strategies.\">Optimise Hamming Weight</h6>" +
                    "<label class=\"radio-inline\">" +
                    "<input type=\"radio\" name=\"hammingWeight\" value=\"true\">Yes" +
                    "</label>" + 
                    "<label class=\"radio-inline\">" +
                    "<input type=\"radio\" name=\"hammingWeight\" value=\"false\" checked>No" +
                    "</label>" +

                    "<h6>NB : Demo Mode will only work properly if section has 64 nodes within it. Otherwise it will just run a normal Genetic Algorithm.</h6>"+
                    "<h5>Output Fitness Definitions</h5>"
                    );
    $('[data-toggle="tooltip"]').tooltip();
    for (var i = 0; i < response.outputs.length; i++) {
        var selectId = "o" + i;
        var weightId = "w" + i;
        form.append("<div class=\"form-inline\"><h6>" + response.outputs[i].Name + "</h6>" +
            "<label for=\"" + selectId + "\">Direction</label>" +
            "<select class=\"form-control\" id=\"" + selectId + "\" name = \"" + selectId + "\">" +
            "<option value=\"true\">Minimise</option>" +
            "<option value=\"false\">Maximise</option>" +
            "</select>" +
            "<label for=\"" + weightId + "\">Weight</label>" +
            "<input type=\"number\" id=\"" + weightId + "\" class=\"form-control\" name=\"" + weightId + "\" min=0 step=1 value=1 />" +
            "</div>"
        );
    }
    $('iframe').contents().find('#gaSheetManipulation').html("<h6>Currently Viewed Sheet</h6><select class=\"form-control\" id=\"gaSheet\"><option value=\"GeneticAlgorithm\">Fitness Chart</option>" +
    "<option value=\"" + response.outputDisplaySheet + "\">" + response.outputDisplaySheet + "</option>" +
    "</select>");
    $('iframe').contents().find('#gaSheet').off('change').on('change', function () {
        viewSheet(id, $(this).find(":selected").val());
    });
    form.off('submit').on('submit', function (e) {
        e.preventDefault();
        var options = form.serializeArray();
        var fitnessDefinition = getFitnessDefinitions(response, options);
        var demoMode = options.filter(function (o) { return o.name === "demoMode"; })[0].value;
        var visualMode = options.filter(function(o) { return o.name === "visualMode"; })[0].value;
        var hammingWeight = options.filter(function(o) { return o.name === "hammingWeight"; })[0].value;
        startGeneticAlgorithm(id,
            response.inputs.length,
            fitnessDefinition,
            $('iframe').contents().find('#iterations').val(),
            $('iframe').contents().find('#chromosomesPerNode').val(),
            demoMode,
            visualMode,
            hammingWeight);
    });
}


var obtainOutputs = function (id) {
    $('iframe').contents().find('#genetic_algorithm_result').siblings().hide();
    $.ajax({
        url: "http://146.169.45.194/SheetServer/Operations/GetInputsAndOutputs",
        method: "GET",
        data: { instanceId: id },
        success: function (response) {
            if (response.success) {
                var form = $('iframe').contents().find('#output_definition_form');
                createForm(id,response);
                var list = "<p>Original Values</p><ul>";
                list += response.outputs.map(function (i) { return "<li>" + i.Name + " : " + i.Original.toFixed(4) + "</li>"; }).join("\n");
                list += "</ul>";
                $('iframe').contents().find('#original_outputs').empty().html(list);
                $('iframe').contents().find('#genetic_algorithm_message').empty();
                $('iframe').contents().find('#submit_genetic_algorithm').off('click').on('click',function () {
                    form.submit();
                });
                $('iframe').contents().find('#genetic_algorithm_result').show();
            } else {
                setTimeout(function () { obtainOutputs(id); }, 1000);
            }
        }
    });
}

gdo.net.app["Spreadsheets"].setupGeneticAlgorithm = function (id, model, config) {
    $.ajax({
        url: "http://146.169.45.194/SheetServer/Operations/SetupGeneticAlgorithm",
        method: "POST",
        data: { instanceId: id, model: model, config: config},
        success: function (response) {
            if (response.success) {
                gdo.consoleOut(".Spreadsheets", 1, response.message);
                obtainOutputs(id);
                gdo.consoleOut(".Spreadsheets", 1, "Now to obtain output definitions from server.");
            } else {
                $('iframe').contents().find('#view_model_message').html("<p style=\"color:red\">Exception[SetupGeneticAlgorithm]:" + response.message + "</p>");
                gdo.consoleOut(".Spreadsheets", 1, "Exception[SetupGeneticAlgorithm]:" + response.message);
            }
        }
    });
}