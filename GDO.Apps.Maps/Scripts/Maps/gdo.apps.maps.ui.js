gdo.net.app["Maps"].selectedLayer = -1;
gdo.net.app["Maps"].selectedProperty = -1;
gdo.net.app["Maps"].HeaderHeight = 61;
gdo.net.app["Maps"].tableHeight = 500;
gdo.net.app["Maps"].StatusHeight = 49;
gdo.net.app["Maps"].selected = [];
gdo.net.app["Maps"].selected["layer"] = -1;
gdo.net.app["Maps"].selected["source"] = -1;
gdo.net.app["Maps"].selected["style"] = -1;
gdo.net.app["Maps"].selected["format"] = -1;


gdo.net.app["Maps"].drawListTables = function (instanceId) {
    if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
        gdo.net.app["Maps"].drawListTable(instanceId, "layer");
        gdo.net.app["Maps"].drawListTable(instanceId, "source");
        gdo.net.app["Maps"].drawListTable(instanceId, "style");
        gdo.net.app["Maps"].drawListTable(instanceId, "format");
    }
}

gdo.net.app["Maps"].drawEmptyListTable = function (tab) {
    $("iframe").contents().find("." + tab + "")
    .empty();
    $("iframe").contents().find("#" + tab + "_label").empty();
}

gdo.net.app["Maps"].drawListTable = function (instanceId, tab) {

    gdo.net.app["Maps"].drawEmptyListTable(tab);

    var j = 0;

    var arr = [];
    arr = eval("gdo.net.instance[instanceId]." + tab + "s");

    if (gdo.net.app["Maps"].selected[tab] >= 0) {
        $("iframe").contents().find("#" + tab + "_label").empty().append("&nbsp;&nbsp;" + arr[gdo.net.app["Maps"].selected[tab]].properties.Name.Value + " (" + arr[gdo.net.app["Maps"].selected[tab]].properties.Id.Value + ")");
    }
    if (tab == "layer") {
        var temp = [];
        for (var i = 0; i < arr.length; i++) {

            temp[arr.length - arr[i].properties.ZIndex.Value - 1] = arr[i];
        }
        arr = temp;
    }
    for (var i in arr) {
        if (arr.hasOwnProperty(i) && arr[i] != null && typeof arr[i] != "undefined") {

            $("iframe").contents().find("." + tab + "").append("<div class='" + tab + "_" + arr[i].properties.Id.Value + " row' " + tab + "Id='" + arr[i].properties.Id.Value + "'></div>");


            var color = "white";
            var icon = "";

            if (tab == "layer") {
                if (arr[i].properties.isInitialized) {
                    if (arr[i].getVisible()) {
                        icon = "fa-eye";
                        color = "white";
                    } else {
                        icon = "fa-eye-slash";
                        color = "gray";
                    }
                }
                if (arr[i].canAnimate) {
                    icon = "fa-play";
                    color = "white";
                }
                if (arr[i].isAnimating) {
                    icon = "fa-spinner";
                    color = "#77B200";
                }
            }
            if (!arr[i].properties.isInitialized) {
                icon = " fa-plus";
                color = "#77B200";
            }
            if (gdo.net.app["Maps"].selected[tab] == arr[i].properties.Id.Value) {
                color = "#4CBFF8";
            }

            $("iframe").contents().find("." + tab + "_" + arr[i].properties.Id.Value)
                .css("align", "top")
                .css("width", "100%")
                .append("<div class='" + tab + "_" + arr[i].properties.Id.Value + "_content table'  " + tab + "Id='" + arr[i].properties.Id.Value + "' style='color:" + color + "'>" +
                        "<div class='" + tab + "_" + arr[i].properties.Id.Value + "_id col-md-2'  " + tab + "Id='" + arr[i].properties.Id.Value + "'> &nbsp;&nbsp;" + arr[i].properties.Id.Value + "</div>" +
                        "<div class='" + tab + "_" + arr[i].properties.Id.Value + "_name col-md-8'  " + tab + "Id='" + arr[i].properties.Id.Value + "'> " + arr[i].properties.Name.Value + "</div>" +
                        "<div class='" + tab + "_" + arr[i].properties.Id.Value + "_icon col-md-1'  " + tab + "Id='" + arr[i].properties.Id.Value + "'><i class='fa " + icon + "'></i></div>" +
                    "</div>");
            $("iframe").contents().find("." + tab + "_" + arr[i].properties.Id.Value + "_content").unbind().click(function () {
                gdo.net.app["Maps"].selected[tab] = $(this).attr(tab + "Id");
                gdo.net.app["Maps"].drawListTable(instanceId, tab);
            });
            j++;
        }
    }
    if (gdo.net.app["Maps"].selected[tab] >= 0) {
        gdo.net.app["Maps"].drawPropertyTable(instanceId, tab, eval("gdo.net.instance[" + instanceId + "]." + tab + "s[" + gdo.net.app["Maps"].selected[tab] + "]"));
    } else {
        gdo.net.app["Maps"].drawEmptyTable(tab);
    }

    //TODO draw property table
}

gdo.net.app["Maps"].readValueFromInput = function (input, type) {
    var value;
    if ((input.val() == null || input.val() == '') && (input.attr("value") == null || input.attr("value") == '')) {
        value = null;
    } else {
        switch (type) {
            case 0: // Boolean
                value = input.attr('value').replace(/'/g, "\\'");
                break;
            case 1: // Integer
                value = parseInt(input.val().replace(/'/g, "\\'"));
                break;
            case 2: // Float
                value = parseFloat(input.val().replace(/'/g, "\\'"));
                break;
            case 3: // String
                value = input.val().replace(/'/g, "\\'");
                break;
        }
    }
    return value;
}

gdo.net.app["Maps"].registerCreateButton = function (instanceId, tab) {
    for (var key in gdo.net.instance[instanceId].temp[tab].properties) {
        var property = gdo.net.instance[instanceId].temp[tab].properties[key];
        if (!gdo.net.instance[instanceId].temp[tab].properties.hasOwnProperty((key))) {
            continue;
        } else if (key != "Id" && key != "Name" && key != "ClassName" && key != "Type" && key != "ObjectType" && key != "Editables" && key != "$type") {
            if (property.ParameterType == 0 || property.ParameterType == 2 || property.ParameterType == 3 || property.ParameterType == 4) {
                property.Value = gdo.net.app["Maps"].readValueFromInput($("iframe").contents().find("#" + tab + "_create_property_" + key + "_value_input"), property.VariableType);
                if (property.Value == null) {
                    property.IsNull = true;
                } else {
                    property.IsNull = false;
                }
            } else if (property.ParameterType == 1) {
                var nullCheck = false;
                for (var i = 0; i < property.Length; i++) {
                    property.Values.$values[i] = gdo.net.app["Maps"].readValueFromInput($("iframe").contents().find("#" + tab + "_create_property_" + key + "_value_input_" + i), property.VariableType);
                    if (property.Values.$values[i] == null) {
                        nullCheck = true;
                    }
                }
                if (nullCheck) {
                    property.IsNull = true;
                } else {
                    property.IsNull = false;
                }
            }
        }
    }
    x = gdo.net.instance[instanceId].temp[tab];
    gdo.net.app["Maps"].uploadObject(instanceId, tab, gdo.net.instance[instanceId].temp[tab], true);
}

gdo.net.app["Maps"].registerNextButton = function (instanceId, tab) {
    var name = $("iframe").contents().find("#" + tab + "_name_input").val();
    var className = $("iframe").contents().find("#" + tab + "_types").val();
    var object = {};
    if (name != null && className != null) {
        for (var index in eval("gdo.net.instance[" + instanceId + "].template." + upperCaseFirstLetter(tab) + "s.$values")) {
            if (eval("!gdo.net.instance[" + instanceId + "].template." + upperCaseFirstLetter(tab) + "s.$values.hasOwnProperty((" + index + "))")) {
                continue;
            } else if (eval("gdo.net.instance[" + instanceId + "].template." + upperCaseFirstLetter(tab) + "s.$values[" + index + "] != null")) {
                if (eval("gdo.net.instance[" + instanceId + "].template." + upperCaseFirstLetter(tab) + "s.$values[" + index + "].ClassName.Value == className")) {
                    object.properties = jQuery.extend(true, {}, eval("gdo.net.instance[" + instanceId + "].template." + upperCaseFirstLetter(tab) + "s.$values[" + index + "]"));
                    object.properties.Name.Value = name;
                }
            }
        }
        gdo.net.instance[instanceId].temp[tab] = object;
        gdo.net.app["Maps"].drawCreateTable(instanceId, tab, object);
    }
}

gdo.net.app["Maps"].registerSaveButton = function (instanceId, tab) {
    /*
                if (gdo.net.app["Maps"].selected["layer"] >= 0) {
                for (var key in gdo.net.instance[instanceId].layers[gdo.net.app["Maps"].selected["layer"]].properties) {
                    if (!gdo.net.instance[instanceId].layers[gdo.net.app["Maps"].selected["layer"]].properties.hasOwnProperty((key))) {
                        continue;
                    } else if (key != "Id" && key != "Name" && key != "ClassName" && key != "Type" && key != "Editables" && key != "$type") {
                        if ($("iframe").contents().find("#layer_" + gdo.net.app["Maps"].selected["layer"] + "_property_" + key + "_value_input").val() == '') {
                            gdo.net.instance[instanceId].layers[gdo.net.app["Maps"].selected["layer"]].properties[key] = null;
                        } else if ($("iframe").contents().find("#layer_" + gdo.net.app["Maps"].selected["layer"] + "_property_" + key + "_value_input").length > 0) {
                            gdo.net.instance[instanceId].layers[gdo.net.app["Maps"].selected["layer"]].properties[key] = eval($("iframe").contents().find("#layer_" + gdo.net.app["Maps"].selected["layer"] + "_property_" + key + "_value_input").val().replace(/'/g, "\\'"));
                        }
                    }
                }
                gdo.net.app["Maps"].uploadLayer(instanceId, gdo.net.instance[instanceId].layers[gdo.net.app["Maps"].selected["layer"]], false);
            }
    */
}

gdo.net.app["Maps"].registerRemoveButton = function (instanceId, tab) {
    if (gdo.net.app["Maps"].selected[tab] >= 0) {
        eval("gdo.net.app['Maps'].server.remove" + upperCaseFirstLetter(tab) + "(" + instanceId + ", gdo.net.app['Maps'].selected['" + tab + "']);");
        gdo.net.app["Maps"].selected[tab] = -1;
    }
}
var a;
gdo.net.app["Maps"].drawInputField = function (instanceId, property, key, inputDiv, isCreate) {
    if (property.IsVisible) {
        if (isCreate) {
            if (property.Priority == 0 || property.Priority == -1) {
                $("iframe").contents().find("#" + inputDiv).attr('data-toggle', 'popover').attr('data-placement', 'left').attr('data-html', 'true').attr('data-trigger', 'hover').attr('data-content', property.Description).append(
                            "<div id='" + inputDiv + "_key' class='col-md-5'><font color='white'>&nbsp;&nbsp;" + key + "</font></div>").popover();

            } else if (property.Priority == 1) {
                $("iframe").contents().find("#" + inputDiv).attr('data-toggle', 'popover').attr('data-placement', 'left').attr('data-html', 'true').attr('data-trigger', 'hover').attr('data-content', property.Description).append(
                "<div id='" + inputDiv + "_key' class='col-md-5'><font color='gray'>&nbsp;&nbsp;" + key + "</font></div>").popover();

            }
        } else {
            if (property.Priority == 0 || property.Priority == -1) {
                $("iframe").contents().find("#" + inputDiv).attr('data-toggle', 'popover').attr('data-placement', 'left').attr('data-html', 'true').attr('data-trigger', 'hover').attr('data-content', property.Description).append(
                            "<div id='" + inputDiv + "_key' class='col-md-5'><font color='#4CBFF8'>&nbsp;&nbsp;" + key + "</font></div>").popover();

            } else if (property.Priority == 1) {
                $("iframe").contents().find("#" + inputDiv).attr('data-toggle', 'popover').attr('data-placement', 'left').attr('data-html', 'true').attr('data-trigger', 'hover').attr('data-content', property.Description).append(
                "<div id='" + inputDiv + "_key' class='col-md-5'><font color='white'>&nbsp;&nbsp;" + key + "</font></div>").popover();

            }
        }

        $("body").find("#" + inputDiv + "_key").popover();
        $("#" + inputDiv + "_key").popover();
        $("iframe").contents().find("#" + inputDiv + "_key").popover();

        var placeholder;
        var value;

        var placeholders = [];
        var values = [];

        if (property.Value != null && property.Value != "undefined") {
            value = property.Value;
            placeholder = property.Value;
        } else if (property.DefaultValue != null && property.DefaultValue != "undefined") {
            value = '';
            placeholder = property.DefaultValue;
        } else {
            value = '';
            placeholder = '';
        }

        if (property.Length != null && property.Length != "undefined") {
            for (var i = 0; i < property.Length; i++) {
                if (property.Values.$values[i] != null && property.Values.$values[i] != "undefined") {
                    values[i] = property.Values.$values[i];
                    placeholders[i] = property.Values.$values[i];
                } else if (property.DefaultValues.$values[i] != null && property.DefaultValues.$values[i] != "undefined") {
                    values[i] = '';
                    placeholders[i] = property.DefaultValues.$values[i];
                } else {
                    values[i] = '';
                    placeholders[i] = '';
                }
            }
        }


        switch (property.InputType) {
            case 1: // Boolean
                if (property.IsNull) {
                    $("iframe").contents().find("#" + inputDiv).append(
                        "<div id='" + inputDiv + "_value' class='col-md-7 input_field_div' align='left' style='text-align:left'>" +
                        "<div id='" + inputDiv + "_value_input' class='col-sm-6' style='padding:1px'><button type='button' id='" + inputDiv + "_on' class='btn btn-default btn-sm' style='width:100%'>On</button></div>" +
                        "<div class='col-sm-6' style='padding:1px'><button type='button' id='" + inputDiv + "_off' class='btn btn-default btn-sm' style='width:100%'>Off</button></div>" +
                        "</div>");
                } else if (value) {
                    $("iframe").contents().find("#" + inputDiv).append(
                        "<div id='" + inputDiv + "_value' class='col-md-7 input_field_div'  style='text-align:left' value=true>" +
                        "<div id='" + inputDiv + "_value_input' class='col-sm-6' style='padding:1px' value=true><button type='button' id='" + inputDiv + "_on' class='btn btn-success btn-sm' style='width:100%'>On</button></div>" +
                        "<div class='col-sm-6' style='padding:1px'><button type='button' id='" + inputDiv + "_off' class='btn btn-default btn-sm' style='width:100%'>Off</button></div>" +
                        "</div>");
                } else {
                    $("iframe").contents().find("#" + inputDiv).append(
                        "<div id='" + inputDiv + "_value' class='col-md-7 input_field_div' align='left'  style='text-align:left' >" +
                        "<div id='" + inputDiv + "_value_input' class='col-sm-6' style='padding:1px' value=false><button type='button' id='" + inputDiv + "_on' class='btn btn-default btn-sm' style='width:100%'>On</button></div>" +
                        "<div class='col-sm-6' style='padding:1px'><button type='button' id='" + inputDiv + "_off' class='btn btn-danger btn-sm' style='width:100%'>Off</button></div>" +
                        "</div>");
                }
                $("iframe").contents().find("#" + inputDiv + "_on").click(function () {
                    $("iframe").contents().find("#" + inputDiv + "_on").removeClass("btn-default").removeClass("btn-success");
                    $("iframe").contents().find("#" + inputDiv + "_off").removeClass("btn-danger").addClass("btn-default");
                    if ($("iframe").contents().find("#" + inputDiv + "_value_input").attr("value") != 'true') {
                        $("iframe").contents().find("#" + inputDiv + "_on").addClass("btn-success");
                        $("iframe").contents().find("#" + inputDiv + "_value_input").attr("value", true);
                    } else {
                        $("iframe").contents().find("#" + inputDiv + "_on").addClass("btn-default");
                        $("iframe").contents().find("#" + inputDiv + "_value_input").attr("value", null);
                    }
                });
                $("iframe").contents().find("#" + inputDiv + "_off").click(function () {
                    $("iframe").contents().find("#" + inputDiv + "_off").removeClass("btn-default").removeClass("btn-danger");
                    $("iframe").contents().find("#" + inputDiv + "_on").removeClass("btn-success").addClass("btn-default");
                    if ($("iframe").contents().find("#" + inputDiv + "_value_input").attr("value") != 'false') {
                        $("iframe").contents().find("#" + inputDiv + "_off").addClass("btn-danger");
                        $("iframe").contents().find("#" + inputDiv + "_value_input").attr("value", false);
                    } else {
                        $("iframe").contents().find("#" + inputDiv + "_off").addClass("btn-default");
                        $("iframe").contents().find("#" + inputDiv + "_value_input").attr("value", null);
                    }
                });
                break;
            case 2: //String
                $("iframe").contents().find("#" + inputDiv).append(
                "<div id='" + inputDiv + "_value' class='col-md-7 input_field_div' style='text-align:left'>" +
                "<input type='text' id='" + inputDiv + "_value_input' class='form-control input_field input-xs '  style='width: 100%;height: 3vh;text-align:left' placeholder='" + placeholder + "' value='" + value + "'/></input>" +
                "</div>");
                break;
            case 3: //Integer
                $("iframe").contents().find("#" + inputDiv).append(
                    "<div id='" + inputDiv + "_value' class='col-md-7 input_field_div' style='text-align:left'>" +
                    "<div class='col-md-10' style='padding:0px;height: 3vh;'><input id='" + inputDiv + "_value_input' type='number' step='" + property.Increment + "' class='input_field form-control'  style='width: 100%;height: 3vh;text-align:left' placeholder='" + placeholder + "' value='" + value + "'/></input></div>" +
                    "<div class='col-md-1' style='padding:1px'><button type='button' id='" + inputDiv + "_plus' step='" + property.Increment + "' class='btn btn-primary btn-sm' style='width:100%;height: 2.8vh;'><b>+</b></button></div>" +
                    "<div class='col-md-1' style='padding:1px'><button type='button' id='" + inputDiv + "_minus' step='" + property.Increment + "' class='btn btn-primary btn-sm' style='width:100%;height: 2.8vh;'><b>-</b></button></div>" +
                    "</div>");
                $("iframe").contents().find("#" + inputDiv + "_plus").click(function () {
                    if ($("iframe").contents().find("#" + inputDiv + "_value_input").val() != '') {
                        $("iframe").contents().find("#" + inputDiv + "_value_input").val(parseInt(parseInt($("iframe").contents().find("#" + inputDiv + "_value_input").val()) + 1));
                    }
                });
                $("iframe").contents().find("#" + inputDiv + "_minus").click(function () {
                    if ($("iframe").contents().find("#" + inputDiv + "_value_input").val() != '') {
                        $("iframe").contents().find("#" + inputDiv + "_value_input").val(parseInt(parseInt($("iframe").contents().find("#" + inputDiv + "_value_input").val()) - 1));
                    }
                });
                break;
            case 4: //Float
                $("iframe").contents().find("#" + inputDiv).append(
                    "<div id='" + inputDiv + "_value' class='col-md-7 input_field_div' style='text-align:left'>" +
                    "<div class='col-md-10' style='padding:0px;height: 3vh;'><input id='" + inputDiv + "_value_input' type='number' step='0.00001'class='input_field form-control'  style='width: 100%;height: 3vh;text-align:left' placeholder='" + placeholder + "' value='" + value + "'/></input></div>" +
                    "<div class='col-md-1' style='padding:1px'><button type='button' id='" + inputDiv + "_plus' step='" + property.Increment + "' class='btn btn-primary btn-sm' style='width:100%;height: 2.8vh;'><b>+</b></button></div>" +
                    "<div class='col-md-1' style='padding:1px'><button type='button' id='" + inputDiv + "_minus' step='" + property.Increment + "' class='btn btn-primary btn-sm' style='width:100%;height: 2.8vh;'><b>-</b></button></div>" +
                    "</div>");
                $("iframe").contents().find("#" + inputDiv + "_plus").click(function () {
                    if ($("iframe").contents().find("#" + inputDiv + "_value_input").val() != '') {
                        $("iframe").contents().find("#" + inputDiv + "_value_input").val(parseFloat(parseFloat($("iframe").contents().find("#" + inputDiv + "_value_input").val()) + 1));
                    }
                });
                $("iframe").contents().find("#" + inputDiv + "_minus").click(function () {
                    if ($("iframe").contents().find("#" + inputDiv + "_value_input").val() != '') {
                        $("iframe").contents().find("#" + inputDiv + "_value_input").val(parseFloat(parseFloat($("iframe").contents().find("#" + inputDiv + "_value_input").val()) - 1));
                    }
                });
                break;
            case 5: //Increment
                //
                break;
            case 6: //Slider
                $("iframe").contents().find("#" + inputDiv).append(
                  "<div id='" + inputDiv + "_value' class='col-md-7 input_field_div' style='text-align:left'>" +
                  "<div class='col-md-10' style='padding:0px;height: 3vh;'><input id='" + inputDiv + "_slider_input' type='range' max='" + property.MaxValue + "' min='" + property.MinValue + "' step='" + property.Increment + "' class='input_field range-slider__range'  style='width: 100%;height: 3vh;text-align:left' placeholder='" + placeholder + "' value='" + value + "'/></input></div>" +
                  "<div class='col-md-2' style='padding:0px'><input id='" + inputDiv + "_value_input' class='input_field disable'  style='width: 100%;height: 3vh;text-align:left' placeholder='" + placeholder + "' value='" + value + "'/></input></div></div>");
                $("iframe").contents().find("#" + inputDiv + "_slider_input").change(function () {
                    $("iframe").contents().find("#" + inputDiv + "_value_input").val(($("iframe").contents().find("#" + inputDiv + "_slider_input").val()));
                });
                /*$("iframe").contents().find("#" + inputDiv + "_slider_input_value").change(function () {
                    $("iframe").contents().find("#" + inputDiv + "_slider_input").attr("value", ($("iframe").contents().find("#" + inputDiv + "_slider_input_value").val()));
                });*/
                break;
            case 7: //Color
                $("iframe").contents().find("#" + inputDiv).append(
                    "<div id='" + inputDiv + "_value' class='col-md-7 input_field_div' >" +
                    "<input type='text' id='" + inputDiv + "_value_input' class='color no-alpha form-control input_field input-xs'  style='width: 100%;height: 3vh;text-align:left' placeholder='" + placeholder + "' value='" + value + "'/></input>" +
                    "</div>");
                var frame = parent.document.getElementById("control_frame_content");
                $("iframe").contents().find("#" + inputDiv + "_value_input").colorPicker({
                    body: frame.contentDocument.body,
                    cssAddon: '.cp-color-picker{border-radius:0px}',
                    positionCallback: function ($elm) {
                        return { // the object will be used as in $('.something').css({...});
                            left: $("iframe").contents().find("#" + inputDiv + "_value").offset().left + $('iframe').offset().left + $("iframe").contents().find("#" + inputDiv + "_value").width() - 150,
                            top: $("iframe").contents().find("#" + inputDiv + "_value").offset().top + $('iframe').offset().top + $("iframe").contents().find("#" + inputDiv + "_value").height() + 7,
                        }
                    }
                });
                break;
            case 8: //DataList
                $("iframe").contents().find("#" + inputDiv).append(
                    "<div id='" + inputDiv + "_value' class='col-md-7 input_field_div' style='text-align:left'>" +
                    "</div>");
                $("iframe").contents().find("#" + inputDiv + "_value").append("<select id='" + inputDiv + "_value_input' class='form-control input_field'  style='width: 100%;height: 3vh;padding-top:3px' value='" + value + "'></select>");
                $("iframe").contents().find("#" + inputDiv + "_value_input").append("<option value=''>Select your option</option>");
                for (var key in property.DefaultValues.$values) {
                    if (property.DefaultValues.$values.hasOwnProperty(key)) {
                        if (value == property.DefaultValues.$values[key] && value != null) {
                            $("iframe").contents().find("#" + inputDiv + "_value_input").append("<option value='" + property.DefaultValues.$values[key] + "' selected>" + property.DefaultValues.$values[key] + "</option>");
                        } else {
                            $("iframe").contents().find("#" + inputDiv + "_value_input").append("<option value='" + property.DefaultValues.$values[key] + "'>" + property.DefaultValues.$values[key] + "</option>");
                        }
                    }
                }
                break;
            case 9: //Link
                $("iframe").contents().find("#" + inputDiv).append(
                    "<div id='" + inputDiv + "_value' class='col-md-7 input_field_div' style='text-align:left'>" +
                    "</div>");
                if (value <= 0) {
                    $("iframe").contents().find("#" + inputDiv + "_value").append("<select id='" + inputDiv + "_value_input' class='form-control input_field' style='width: 100%;height: 3vh;padding-top:3px' value=-1></select>");
                    $("iframe").contents().find("#" + inputDiv + "_value_input").append("<option value='-1' selected='selected' >Select your option</option>");
                } else {
                    $("iframe").contents().find("#" + inputDiv + "_value").append("<select id='" + inputDiv + "_value_input' class='form-control input_field' style='width: 100%;height: 3vh;padding-top:3px' value='" + value + "'></select>");
                    $("iframe").contents().find("#" + inputDiv + "_value_input").append("<option value='-1' >Select your option</option>");
                }
                var collection = eval("gdo.net.instance[instanceId]." + property.LinkedParameter);
                for (var key in collection) {
                    if (collection.hasOwnProperty(key)) {
                        //if (collection[key].properties.ObjectType.Value == property.ObjectType) {
                        if (value == collection[key].properties.Id.Value && value >= 0) {
                            $("iframe").contents().find("#" + inputDiv + "_value_input").append("<option value='" + collection[key].properties.Id.Value + "' selected='selected'> " + collection[key].properties.Name.Value + "</option>");
                        } else {
                            $("iframe").contents().find("#" + inputDiv + "_value_input").append("<option value='" + collection[key].properties.Id.Value + "'> " + collection[key].properties.Name.Value + "</option>");
                        }
                        //}
                    }
                }
                //somehow assign value somwhere
                break;
            case 10: //Integer Array
                $("iframe").contents().find("#" + inputDiv).append(
                    "<div id='" + inputDiv + "_value' class='col-md-7 input_field_div' style='text-align:left'>" +
                    "</div>");
                for (var i = 0; i < property.Length; i++) {
                    $("iframe").contents().find("#" + inputDiv + "_value").append(
                        "<input id='" + inputDiv + "_value_input_" + i + "' type='number'  class='input_field form-control'  style='width: " + (100 / property.Length) + "%;height: 3vh;text-align:left' placeholder='" + placeholders[i] + "' value='" + values[i] + "'/></input>"
                    );
                }
                break;
            case 11: //Float Array
                $("iframe").contents().find("#" + inputDiv).append(
                    "<div id='" + inputDiv + "_value' class='col-md-7 input_field_div' style='text-align:left'>" +
                    "</div>");
                for (var i = 0; i < property.Length; i++) {
                    $("iframe").contents().find("#" + inputDiv + "_value").append(
                        "<input id='" + inputDiv + "_value_input_" + i + "' type='number' step='0.0001' class='input_field form-control'  style='width: " + (100 / property.Length) + "%;height: 3vh;text-align:left' placeholder='" + placeholders[i] + "' value='" + values[i] + "'/></input>"
                    );
                }
                break;
            case 12: //String Array
                $("iframe").contents().find("#" + inputDiv).append(
                    "<div id='" + inputDiv + "_value' class='col-md-7 input_field_div' style='text-align:left'>" +
                    "</div>");
                for (var i = 0; i < property.Length; i++) {
                    $("iframe").contents().find("#" + inputDiv + "_value").append(
                        "<input type='text' id='" + inputDiv + "_value_input_" + i + "'  class='input_field form-control'  style='width: " + (100 / property.Length) + "%;height: 3vh;text-align:left' placeholder='" + placeholders[i] + "' value='" + values[i] + "'/></input>"
                    );
                }
                break;
            case 13: //Color Array
                $("iframe").contents().find("#" + inputDiv).append(
                    "<div id='" + inputDiv + "_value' class='col-md-7 input_field_div' style='text-align:left'>" +
                    "</div>");
                for (var i = 0; i < property.Length; i++) {
                    $("iframe").contents().find("#" + inputDiv + "_value").append(
                        "<input type='text' id='" + inputDiv + "_value_input_" + i + "' class='input_field color no-alpha form-control'  style='width: " + (100 / property.Length) + "%;height: 3vh;text-align:left'   placeholder='" + placeholders[i] + "' value='" + values[i] + "'/></input>");
                    var frame = parent.document.getElementById("control_frame_content");
                    $("iframe").contents().find("#" + inputDiv + "_value_input_" + i).colorPicker({
                        body: frame.contentDocument.body,
                        cssAddon: '.cp-color-picker{border-radius:0px}',
                        positionCallback: function ($elm) {
                            return { // the object will be used as in $('.something').css({...});
                                left: $("iframe").contents().find("#" + inputDiv + "_value").offset().left + $('iframe').offset().left + $("iframe").contents().find("#" + inputDiv + "_value").width() - 150,
                                top: $("iframe").contents().find("#" + inputDiv + "_value").offset().top + $('iframe').offset().top + $("iframe").contents().find("#" + inputDiv + "_value").height() + 7,
                            }
                        },
                    });
                }
                break;
            case 14: //Text Area
                $("iframe").contents().find("#" + inputDiv).append(
                    "<div id='" + inputDiv + "_value' class='col-md-7 input_field_div' style='text-align:left'>" +
                    "<textarea id='" + inputDiv + "_value_input' rows='4' cols='70' class='input_field form-control'  style='width: 100%;text-align:left' placeholder='" + placeholder + "' value='" + value + "'/></textarea>" +
                    "</div>");
                break;
            default:
                $("iframe").contents().find("#" + inputDiv).append(
                    "<div id='" + inputDiv + "_value' class='col-md-7 input_field_div' style='text-align:left'>" +
                    "<input type='text' id='" + inputDiv + "_value_input' class='input_field form-control'  style='width: 100%;text-align:left' placeholder='" + placeholder + "' value='" + value + "'/></input>" +
                    "</div>");
        }

        if (property.Priority == -1 && !property.IsEditable) {
            $("iframe").contents().find("#" + inputDiv + "_key").css("opacity", "0.5");
            $("iframe").contents().find("#" + inputDiv + "_value").css("opacity", "0.5").css("pointer-events", "none");
        } else if ((!property.IsEditable && !isCreate)) {
            $("iframe").contents().find("#" + inputDiv + "_key").css("opacity", "0.5");
            $("iframe").contents().find("#" + inputDiv + "_value").css("opacity", "0.5").css("pointer-events", "none");
        }
    }
}

gdo.net.app["Maps"].drawEmptyTable = function (tab) {
    $("iframe").contents().find("#" + tab + "_properties").empty();
    $("iframe").contents().find("#" + tab + "_properties").empty();
}

gdo.net.app["Maps"].drawTable = function (instanceId, tab, object, isCreate) {
    if (isCreate) {
        tab = tab + "_create";
    }
    gdo.net.app["Maps"].drawEmptyTable(tab, isCreate);

    var properties = object.properties;
    xx = object;
    for (var key in properties) {
        if (key == null) {
            key = "";
        }
        if (properties.hasOwnProperty(key) && key != "$type") {

            $("iframe").contents().find("#" + tab + "_properties").append("<div id='" + tab + "_property_" + key + "' class='row' " + tab + "' property='" + key + "' style='width: 98%;height: 100%;'></div>");

            $("iframe").contents().find("#" + tab + "_property_").append(
                "<div id='" + tab + "_property_" + key + "_key' class='col-md-5' >&nbsp;&nbsp;" + key + "</div>" +
                "<div id='" + tab + "_property_" + key + "_value' class='col-md-7' style='color:gray' >" + properties[key].Value + "</div>");

            gdo.net.app["Maps"].drawInputField(instanceId, properties[key], key, tab + "_property_" + key, isCreate);
        }
    }

    $('[data-toggle="tooltip"]').tooltip();
    $('[data-toggle="popover"]').popover();
}

gdo.net.app["Maps"].drawCreateTable = function (instanceId, tab, object) {
    gdo.net.app["Maps"].drawTable(instanceId, tab, object, true);
}

gdo.net.app["Maps"].drawPropertyTable = function (instanceId, tab, object) {
    gdo.net.app["Maps"].drawTable(instanceId, tab, object, false);
}

gdo.net.app["Maps"].drawSearchInput = function (instanceId) {
    $("iframe").contents().find("#map_input_div")
      .css("margin", "0px")
      .css("padding", "0px")
      .css("width", "60%")
      //.css("height", "40px")
      .empty()
      .append("<input type='text'  class='form-control' id='map_input' value='&nbsp;Enter Location' spellcheck='false' style='width: 95%;height: 100%;' /></input>");
    $("iframe").contents().find("#map_input")
        .css("width", "100%")
        .css("height", "40px")
        //.css("border", "1px solid #333")
        .css("background", "#333")
        //.css("color", "#FFF")
        .css("padding", "0px")
        .css("display", "inline-block")
        .css("position", "relative")
        .attr("text-align", "center")
        .focus(gdo.net.app['Maps'].clearInput)
        .css({ fontSize: gdo.management.button_font_size * 0.7 });
    $("iframe").contents().find("#map_input").keyup(function (event) {
        if (event.keyCode == 13) {
            $("iframe").contents().find("#map_submit").click();
        }
    });
    $("iframe").contents().find("#map_submit_div")
        .css("margin", "0px")
        .css("padding", "0px")
        .css("width", "20%")
        //.css("height", "40px")
        .css("background", "#444")
        .empty()
        .append("<button type='button' id='map_submit' class='btn btn-success btn-block'><i class='fa fa-check-circle fa-fw'></i>&nbsp;Search</button>");
    $("iframe").contents().find("#map_submit")
        .css("width", "100%")
        .focus(gdo.net.app['Maps'].clearInput)
        .css({ fontSize: gdo.management.button_font_size * 0.7 })
        .unbind()
        .click(function () {
            gdo.consoleOut(".Maps", 1, "Finding: " + $("iframe").contents().find('#map_input').val());
            gdo.net.app["Maps"].searchGeoCode(instanceId, $("iframe").contents().find('#map_input').val());
        });
    $("iframe").contents().find("#map_clear_div")
       .css("margin", "0px")
       .css("padding", "0px")
       .css("width", "20%")
             .css("align", "center")
       //.css("height", "40px")
       .css("background", "#444")
       .empty()
       .append("<button type='button' id='map_clear' class='btn btn-danger btn-block'><i class='fa fa-times-circle fa-fw'></i>&nbsp;Clear Marker</button>");
    $("iframe").contents().find("#map_clear")
        .css("width", "100%")
        .css({ fontSize: gdo.management.button_font_size * 0.7 })
        .unbind()
        .click(function () {
            gdo.net.app["Maps"].clearPositionMarker(instanceId);
        });
}
gdo.net.app["Maps"].extractTypes = function (instanceId) {
    var className;
    var arr = ["layer", "source", "style", "format"];
    for (var i in arr) {
        if (!arr.hasOwnProperty((i))) {
            continue;
        } else if (arr[i] != null) {
            var values = eval("gdo.net.instance[" + instanceId + "].template." + upperCaseFirstLetter(arr[i]) + "s.$values");
            for (var index in values) {
                if (!values.hasOwnProperty((index))) {
                    continue;
                } else if (values[index] != null) {
                    className = values[index].ClassName.Value;
                    $("iframe").contents().find("#" + arr[i] + "_types").append("<option value='" + className + "'>" + className + "</option>");
                }
            }
        }
    }
}

gdo.net.app["Maps"].registerButtons = function (instanceId) {
    gdo.net.instance[instanceId].temp = [];
    gdo.net.instance[instanceId].temp["layer"] = {};
    gdo.net.instance[instanceId].temp["source"] = {};
    gdo.net.instance[instanceId].temp["style"] = {};
    gdo.net.instance[instanceId].temp["format"] = {};

    $("iframe").contents().find(".layer-play-button")
        .unbind()
        .click(function () {

        });

    $("iframe").contents().find(".layer-pause-button")
        .unbind()
        .click(function () {

        });

    $("iframe").contents().find(".layer-stop-button")
        .unbind()
        .click(function () {

        });

    $("iframe").contents().find(".layer-up-button")
        .unbind()
        .click(function () {
            if (gdo.net.instance[instanceId].layers[gdo.net.app["Maps"].selected["layer"]].properties.ZIndex.Value < gdo.net.instance[instanceId].layers.length - 1) {
                for (var i = 0; i < gdo.net.instance[instanceId].layers.length; i++) {
                    if (gdo.net.instance[instanceId].layers[i].properties.ZIndex.Value == gdo.net.instance[instanceId].layers[gdo.net.app["Maps"].selected["layer"]].properties.ZIndex.Value + 1) {
                        gdo.net.instance[instanceId].layers[i].properties.ZIndex.Value--;
                        gdo.net.app['Maps'].server.updateLayer(instanceId, gdo.net.instance[instanceId].layers[i].properties.Id.Value, gdo.net.instance[instanceId].layers[i].properties.ClassName.Value, JSON.stringify(gdo.net.instance[instanceId].layers[i].properties).replace(/'/g, "\\'"));
                    }
                }
                gdo.net.instance[instanceId].layers[gdo.net.app["Maps"].selected["layer"]].properties.ZIndex.Value++;
                gdo.net.app['Maps'].server.updateLayer(instanceId, gdo.net.instance[instanceId].layers[gdo.net.app["Maps"].selected["layer"]].properties.Id.Value, gdo.net.instance[instanceId].layers[gdo.net.app["Maps"].selected["layer"]].properties.ClassName.Value, JSON.stringify(gdo.net.instance[instanceId].layers[gdo.net.app["Maps"].selected["layer"]].properties).replace(/'/g, "\\'"));
                gdo.net.app["Maps"].drawListTables(instanceId);
            }
        });

    $("iframe").contents().find(".layer-down-button")
        .unbind()
        .click(function () {
            if (gdo.net.instance[instanceId].layers[gdo.net.app["Maps"].selected["layer"]].properties.ZIndex.Value > 0) {

                for (var i = 0; i < gdo.net.instance[instanceId].layers.length; i++) {
                    if (gdo.net.instance[instanceId].layers[i].properties.ZIndex.Value == gdo.net.instance[instanceId].layers[gdo.net.app["Maps"].selected["layer"]].properties.ZIndex.Value - 1) {
                        gdo.net.instance[instanceId].layers[i].properties.ZIndex.Value++;
                        gdo.net.app['Maps'].server.updateLayer(instanceId, gdo.net.instance[instanceId].layers[i].properties.Id.Value, gdo.net.instance[instanceId].layers[i].properties.ClassName.Value, JSON.stringify(gdo.net.instance[instanceId].layers[i].properties).replace(/'/g, "\\'"));
                    }
                }
                gdo.net.instance[instanceId].layers[gdo.net.app["Maps"].selected["layer"]].properties.ZIndex.Value--;
                gdo.net.app['Maps'].server.updateLayer(instanceId, gdo.net.instance[instanceId].layers[gdo.net.app["Maps"].selected["layer"]].properties.Id.Value, gdo.net.instance[instanceId].layers[gdo.net.app["Maps"].selected["layer"]].properties.ClassName.Value, JSON.stringify(gdo.net.instance[instanceId].layers[gdo.net.app["Maps"].selected["layer"]].properties).replace(/'/g, "\\'"));
                gdo.net.app["Maps"].drawListTables(instanceId);
            }

        });

    $("iframe").contents().find(".layer-visible-button")
        .unbind()
        .click(function () {
            if (gdo.net.app["Maps"].selected["layer"] >= 0) {
                gdo.net.instance[instanceId].layers[gdo.net.app["Maps"].selected["layer"]].properties.Visible.Value = !gdo.net.instance[instanceId].layers[gdo.net.app["Maps"].selected["layer"]].properties.Visible.Value;
                gdo.net.instance[instanceId].layers[gdo.net.app["Maps"].selected["layer"]].setVisible(gdo.net.instance[instanceId].layers[gdo.net.app["Maps"].selected["layer"]].properties.Visible.Value);
                gdo.net.app["Maps"].drawListTables(instanceId);
            }
        });

    $("iframe").contents().find("#layer-next-button")
        .unbind()
        .click(function () { gdo.net.app["Maps"].registerNextButton(instanceId, "layer"); });

    $("iframe").contents().find("#layer-create-button")
        .unbind()
        .click(function () { gdo.net.app["Maps"].registerCreateButton(instanceId, "layer"); });

    $("iframe").contents().find(".layer-remove-button")
        .unbind()
        .click(function () { gdo.net.app["Maps"].registerRemoveButton(instanceId, "layer"); });

    $("iframe").contents().find(".layer-save-button")
        .unbind()
        .click(function () { gdo.net.app["Maps"].registerSaveButton(instanceId, "layer"); });

    $("iframe").contents().find("#source-next-button")
        .unbind()
        .click(function () { gdo.net.app["Maps"].registerNextButton(instanceId, "source"); });

    $("iframe").contents().find("#source-create-button")
        .unbind()
        .click(function () { gdo.net.app["Maps"].registerCreateButton(instanceId, "source"); });

    $("iframe").contents().find(".source-remove-button")
        .unbind()
        .click(function () { gdo.net.app["Maps"].registerRemoveButton(instanceId, "source"); });

    $("iframe").contents().find(".2-save-button")
    .unbind()
    .click(function () {
        if (gdo.net.app["Maps"].selected["layer"] >= 0) {
            for (var key in gdo.net.instance[instanceId].layers[gdo.net.app["Maps"].selected["layer"]].properties) {
                if (!gdo.net.instance[instanceId].layers[gdo.net.app["Maps"].selected["layer"]].properties.hasOwnProperty((key))) {
                    continue;
                } else if (key != "Id" && key != "Name" && key != "ClassName" && key != "Type" && key != "Editables" && key != "$type") {
                    if ($("iframe").contents().find("#layer_" + gdo.net.app["Maps"].selected["layer"] + "_property_" + key + "_value_input").val() == '') {
                        gdo.net.instance[instanceId].layers[gdo.net.app["Maps"].selected["layer"]].properties[key] = null;
                    } else if ($("iframe").contents().find("#layer_" + gdo.net.app["Maps"].selected["layer"] + "_property_" + key + "_value_input").length > 0) {
                        gdo.net.instance[instanceId].layers[gdo.net.app["Maps"].selected["layer"]].properties[key] = eval($("iframe").contents().find("#layer_" + gdo.net.app["Maps"].selected["layer"] + "_property_" + key + "_value_input").val().replace(/'/g, "\\'"));
                    }
                }
            }
            gdo.net.app["Maps"].uploadLayer(instanceId, gdo.net.instance[instanceId].layers[gdo.net.app["Maps"].selected["layer"]], false);
        }
    });
    $("iframe").contents().find("#source-save-button")
        .unbind()
        .click(function () { gdo.net.app["Maps"].registerSaveButton(instanceId, "source"); });

    $("iframe").contents().find("#style-next-button")
        .unbind()
        .click(function () { gdo.net.app["Maps"].registerNextButton(instanceId, "style"); });

    $("iframe").contents().find("#style-create-button")
        .unbind()
        .click(function () { gdo.net.app["Maps"].registerCreateButton(instanceId, "style"); });

    $("iframe").contents().find(".style-remove-button")
        .unbind()
        .click(function () { gdo.net.app["Maps"].registerRemoveButton(instanceId, "style"); });

    $("iframe").contents().find(".style-save-button")
        .unbind()
        .click(function () { gdo.net.app["Maps"].registerSaveButton(instanceId, "style"); });

    $("iframe").contents().find("#format-next-button")
       .unbind()
       .click(function () { gdo.net.app["Maps"].registerNextButton(instanceId, "format"); });

    $("iframe").contents().find("#format-create-button")
       .unbind()
       .click(function () { gdo.net.app["Maps"].registerCreateButton(instanceId, "format"); });

    $("iframe").contents().find(".format-remove-button")
        .unbind()
       .click(function () { gdo.net.app["Maps"].registerRemoveButton(instanceId, "format"); });

    $("iframe").contents().find(".format-save-button")
        .unbind()
       .click(function () { gdo.net.app["Maps"].registerSaveButton(instanceId, "format"); });
}