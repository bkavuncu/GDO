var startPrecedentTracing = function(id, selectedOutput) {
    $.ajax({
        url: "http://146.169.45.194/SheetServer/Operations/StartPrecedentTracing",
        method: "POST",
        data: { instanceId: id, output: selectedOutput},
        success: function (response) {
            if (response.success) {
                console.log(response);
            }
        }
    });
}

var generateSelector = function (response) {
    var textBox = "<h6>Trace Output Through Model</h6>\n<select id=\"output_options\" class=\"form-control\">";
    textBox += response.outputs.map(function (o, i) { return "<option value=\"" + i + "\">" + o.Name + "</option>"; }).join("\n");
    textBox += "</select>";
    var button = "<button id=\"step_output\" class=\"btn btn-success\">Step Output</button>";
    return "<div class=\"form-inline\">" + textBox + "\n" + button + "</div>";
}

var setupTracePrecedent = function (id) {
    $.ajax({
        url: "http://146.169.45.194/SheetServer/Operations/GetInputsAndOutputs",
        method: "GET",
        data: { instanceId: id },
        success: function(response) {
            if (response.success) {
                $('iframe').contents().find('#trace_precedent_section').empty().html(generateSelector(response));
                $('iframe').contents().find('#step_output').off('click').on('click', function() {
                    var selectedValue = $('iframe').contents().find('#output_options').val();
                    startPrecedentTracing(id, response.outputs[selectedValue]);
                });
            } else {
                setTimeout(function () { setupTracePrecedent(id); }, 1000);
            }
        }
    });
}

var drawCanvas = function (packing) {
    var screenSize = 50;
    var canvas = $('iframe').contents().find('#viewCanvas')[0];
    var context = canvas.getContext('2d');
    context.font = '12px Arial';
    var i;
    for (i = 0; i < 4; i++) {
        for (var j = 0; j < 16; j++) {
            context.strokeRect(screenSize * j, screenSize * i, screenSize, screenSize);
        }
    }

    for (i = 0; i < packing.length; i++) {
        var temp = packing[i];
        //Get a random colour, fill the canvas space with that color, draw around it with a black line
        context.fillStyle = 'hsl(' + 360 * Math.random() + ', 100%,' + (30 * Math.random() + 40) + '%)';
        context.fillRect(screenSize * temp.X, screenSize * (4 - temp.Y - temp.Height), screenSize * temp.Width, screenSize * temp.Height);
        context.strokeRect(screenSize * temp.X, screenSize * (4 - temp.Y - temp.Height), screenSize * temp.Width, screenSize * temp.Height);
        //Compute Perceptive Luminance of the background color in question, and set the text colour based on the luminance.
        var complement = context.fillStyle.substring(1, context.fillStyle.length);
        var r = parseInt("0x" + complement.substring(0, 2));
        var g = parseInt("0x" + complement.substring(2, 4));
        var b = parseInt("0x" + complement.substring(4, 6));
        //https://www.w3.org/TR/AERT#color-contrast
        var luminance = 1 - (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        if (luminance < 0.5) {
            context.fillStyle = "#000000";
        }
        else {
            context.fillStyle = "#ffffff";
        }
        context.fillText((i + 1).toString(), screenSize * temp.X + temp.Width * (screenSize / 2), (screenSize) * (4 - temp.Y - temp.Height) + (screenSize / 2) * temp.Height);
    }
    $("iframe").contents().find("#sheetKey").empty().html(
        packing.map(function(o) { return "<li>" + o.Sheet + "</li>"; }).join("\n")
    );
}

var getViewInfo = function(id, packHeuristic, count) {
    $.ajax({
        url: "http://146.169.45.194/SheetServer/Operations/GetViewInfo",
        method: "POST",
        data: { instanceId: id, packHeuristic : packHeuristic},
        success: function (response) {
            if (response.success) {
                gdo.consoleOut(".Spreadsheets", 1, response.message);
                $('iframe').contents().find('#unfold_model_message').html("<p style=\"color:green\">Successfully obtained ViewInformation</p>");
                $('iframe').contents().find('#unfoldingMap').empty().html("<canvas id=\"viewCanvas\" width=\"800\" height=\"200\"></canvas>" +
                    "<ol id=\"sheetKey\" style=\"column-count:3;-webkit-column-count:3; list-style-position:inside\"></ol>");
                drawCanvas(response.packing);
                setupTracePrecedent(id);
                gdo.consoleOut(".Spreadsheets", 1, "Now to work on getting the viewInformation");
            } else {
                if (response.retry) {
                    $('iframe').contents().find('#unfold_model_message').html("<p style=\"color:red\">Attempt " + count + " unsuccessful. Retrying...</p>");
                    setTimeout(function() { getViewInfo(id, packHeuristic, count + 1); }, 1000);
                    gdo.consoleOut(".Spreadsheets", 1, "UnfoldModel failure message " + count + ":" + response.message);
                } else {
                    $('iframe').contents().find('#unfold_model_message').html("<p style=\"color:red\">Exception[UnfoldModel]:" + response.message);
                }
            }
        }
    });
}

var setupPackingForm = function (id) {
    var form = $('iframe').contents().find('#packing_detail_form');
    $('iframe').contents().find('#submit_packing_data').off('click').on('click', function() {
        form.submit();
    });
    form.off('submit').on('submit', function(e) {
        e.preventDefault();
        var packHeuristic = form.serializeArray().filter(function(f) { return f.name === "packHeuristic"; })[0].value;
        getViewInfo(id, packHeuristic, 1);
    });
}


gdo.net.app["Spreadsheets"].unfoldModel = function (id, model, config) {
    $('iframe').contents().find('#unfold_model_message').empty();
    $.ajax({
        url: "http://146.169.45.194/SheetServer/Operations/UnfoldModel",
        method: "POST",
        data: { instanceId: id, model: model, config:config},
        success: function (response) {
            if (response.success) {
                gdo.consoleOut(".Spreadsheets", 1, response.message);
                setupPackingForm(id);
                gdo.consoleOut(".Spreadsheets", 1, "Now to work on getting the viewInformation and rendering the canvas.");
            } else {
                $('iframe').contents().find('#view_model_message').html("<p style=\"color:red\">Exception[ViewModel]:" + response.message + "</p>");
                gdo.consoleOut(".Spreadsheets", 1, "Exception[ViewModel]:" + response.message);
            }
        }
    });
}