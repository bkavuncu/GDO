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
gdo.net.app["Maps"].temp = [];
gdo.net.app["Maps"].temp["layer"] = {};
gdo.net.app["Maps"].temp["source"] = {};
gdo.net.app["Maps"].temp["style"] = {};
gdo.net.app["Maps"].temp["format"] = {};


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
    gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Drawing ' + tab + ' Table');

    gdo.net.app["Maps"].drawEmptyListTable(tab);

    var j = 0;

    var arr = [];
    arr = eval("gdo.net.instance[instanceId]." + tab + "s");

    for (var i in arr) {
        if (arr.hasOwnProperty(i) && arr[i] != null && typeof arr[i] != "undefined") {
            gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Drawing ' + tab + ' ' + i);

            $("iframe").contents().find("." + tab + "").append("<div class='" + tab + "_" + i + " row' " + tab + "Id='" + i + "'></div>");
            if (gdo.net.app["Maps"].selected[tab] >= 0) {
                $("iframe").contents().find("#" + tab + "_label").empty().append("&nbsp;&nbsp;" + arr[gdo.net.app["Maps"].selected[tab]].properties.Name.Value + " (" + arr[gdo.net.app["Maps"].selected[tab]].properties.Id.Value + ")");
            }

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
            if (gdo.net.app["Maps"].selected[tab] == i) {
                color = "#4CBFF8";
            }

            $("iframe").contents().find("." + tab + "_" + i)
                .css("align", "top")
                .css("width", "100%")
                .append("<div class='" + tab + "_" + i + "_content table'  " + tab + "Id='" + i + "' style='color:" + color + "'>" +
                        "<div class='" + tab + "_" + i + "_id col-md-2'  " + tab + "Id='" + i + "'> &nbsp;&nbsp;" + arr[i].properties.Id.Value + "</div>" +
                        "<div class='" + tab + "_" + i + "_name col-md-8'  " + tab + "Id='" + i + "'> " + arr[i].properties.Name.Value + "</div>" +
                        "<div class='" + tab + "_" + i + "_icon col-md-1'  " + tab + "Id='" + i + "'><i class='fa " + icon + "'></i></div>" +
                    "</div>");
            $("iframe").contents().find("." + tab + "_" + i + "_content").unbind().click(function () {
                gdo.net.app["Maps"].selected[tab] = $(this).attr(tab + "Id");
                gdo.net.app["Maps"].drawListTable(instanceId, tab);
            });
            j++;
        }
    }
    gdo.net.app["Maps"].drawPropertyTable(instanceId, tab, gdo.net.app["Maps"].selected[tab]);

    //TODO draw property table
}

gdo.net.app["Maps"].drawEmptyCreateTable = function (tab) {
    $("iframe").contents().find("#" + tab + "_create_properties")
    .empty();
}

gdo.net.app["Maps"].registerCreateButton = function (instanceId, tab) {
    /*for (var key in gdo.net.app["Maps"].temp["layer"].properties) {
        if (!gdo.net.app["Maps"].temp["layer"].properties.hasOwnProperty((key))) {
            continue;
        } else if (key != "Id" && key != "Name" && key != "ClassName" && key != "Type" && key != "Editables" && key != "$type") {
            if ($("iframe").contents().find("#layer_create_property_" + key + "_value_input").val() == '') {
                gdo.net.app["Maps"].temp["layer"].properties[key] = null;
            } else {
                gdo.net.app["Maps"].temp["layer"].properties[key] = eval($("iframe").contents().find("#layer_create_property_" + key + "_value_input").val().replace(/'/g, "\\'"));
            }
        }
    }
    gdo.net.app["Maps"].uploadLayer(instanceId, gdo.net.app["Maps"].temp["layer"], true);*/
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
                    object.properties = clone(eval("gdo.net.instance[" + instanceId + "].template." + upperCaseFirstLetter(tab) + "s.$values[" + index + "]"));
                    object.properties.Name.Value = name;
                }
            }
        }
        gdo.net.app["Maps"].temp[tab] = object;
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
        eval("gdo.net.app['Maps'].server.remove" + upperCaseFirstLetter(tab) + "(" + instanceId + ", gdo.net.app['Maps'].selected[" + tab + "]);");
        gdo.net.app["Maps"].selected[tab] = -1;
    }
}



gdo.net.app["Maps"].drawInputField = function (instanceId, property, key, inputDiv, isCreate) {
    if (property.IsVisible) {
        if (property.Priority == 0 || property.Priority == -1) {
            $("iframe").contents().find("#" + inputDiv).append(
                        "<div id='" + inputDiv + "_key' class='col-md-5' data-toggle='popover' data-placement='left' data-html='true' data-trigger='hover' data-content='" + property.Description + "'>&nbsp;&nbsp;" + key + "</div>").popover();

        } else if (property.Priority == 1) {
            $("iframe").contents().find("#" + inputDiv).append(
            "<div id='" + inputDiv + "_key' class='col-md-5' data-toggle='popover' data-placement='left' data-html='true' data-trigger='hover' data-content='" + property.Description + "'><font color='gray'>&nbsp;&nbsp;" + key + "</font></div>").popover();

        }
        $("body").find("#" + inputDiv + "_key").popover();
        $("#" + inputDiv + "_key").popover();
        $("iframe").contents().find("#" + inputDiv + "_key").popover();

        var placeholder;
        var value;

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

        switch (property.InputType) {
            case 1: // Boolean
                if (property.Value || (property.Value == null && property.DefaultValue)) {
                    $("iframe").contents().find("#" + inputDiv).append(
                        "<div id='" + inputDiv + "_value' class='col-md-7 input_field_div'  style='text-align:left' value=true>" +
                        "<div class='col-sm-6' style='padding:0px'><button type='button' id='" + inputDiv + "_on' class='btn btn-success btn-sm' style='width:100%'>On</button></div>" +
                        "<div class='col-sm-6' style='padding:0px'><button type='button' id='" + inputDiv + "_off' class='btn btn-default btn-sm' style='width:100%'>Off</button></div>" +
                        "</div>");
                } else if (!property.Value || (property.Value == null && !property.DefaultValue)) {
                    $("iframe").contents().find("#" + inputDiv).append(
                        "<div id='" + inputDiv + "_value' class='col-md-7 input_field_div' align='left'  style='text-align:left' value=false>" +
                        "<div class='col-sm-6' style='padding:0px'><button type='button' id='" + inputDiv + "_on' class='btn btn-default btn-sm' style='width:100%'>On</button></div>" +
                        "<div class='col-sm-6' style='padding:0px'><button type='button' id='" + inputDiv + "_off' class='btn btn-danger btn-sm' style='width:100%'>Off</button></div>" +
                        "</div>");
                } else if ((property.Value == null && property.DefaultValue == null)) {
                    $("iframe").contents().find("#" + inputDiv).append(
                        "<div id='" + inputDiv + "_value' class='col-md-7 input_field_div' align='left' style='text-align:left' value=null>" +
                        "<div class='col-sm-6' style='padding:0px'><button type='button' id='" + inputDiv + "_on' class='btn btn-default btn-sm' style='width:100%'>On</button></div>" +
                        "<div class='col-sm-6' style='padding:0px'><button type='button' id='" + inputDiv + "_off' class='btn btn-default btn-sm' style='width:100%'>Off</button></div>" +
                        "</div>");
                }
                $("iframe").contents().find("#" + inputDiv + "_on").click(function () {
                    $("iframe").contents().find("#" + inputDiv + "_on").removeClass("btn-default").addClass("btn-success");
                    $("iframe").contents().find("#" + inputDiv + "_off").removeClass("btn-danger").addClass("btn-default");
                    $("iframe").contents().find("#" + inputDiv + "_value").attr("value", false);
                });
                $("iframe").contents().find("#" + inputDiv + "_off").click(function () {
                    $("iframe").contents().find("#" + inputDiv + "_on").removeClass("btn-success").addClass("btn-default");
                    $("iframe").contents().find("#" + inputDiv + "_off").removeClass("btn-default").addClass("btn-danger");
                    $("iframe").contents().find("#" + inputDiv + "_value").attr("value", true);
                });
                break;
            case 2: //String
                $("iframe").contents().find("#" + inputDiv).append(
                "<div id='" + inputDiv + "_value' class='col-md-7 input_field_div' style='text-align:left'>" +
                "<input type='text' id='" + inputDiv + "_value_input' class='form-control input_field input-xs '  style='width: 100%;height: 3vh;text-align:left' placeholder='" + placeholder + "' value='" + value + "'/></input>" +
                "</div>");
                break;
            case 4: //Integer
                $("iframe").contents().find("#" + inputDiv).append(
                    "<div id='" + inputDiv + "_value' class='col-md-7 input_field_div' style='text-align:left'>" +
                    "<input id='" + inputDiv + "_value_input' type='number' class='input_field form-control'  style='width: 100%;height: 3vh;text-align:left' placeholder='" + placeholder + "' value='" + value + "'/></input>" +
                    "</div>");
                break;
            case 5: //Float
                $("iframe").contents().find("#" + inputDiv).append(
                    "<div id='" + inputDiv + "_value' class='col-md-7 input_field_div' style='text-align:left'>" +
                    "<input id='" + inputDiv + "_value_input' type='number' step='0.00001' class='input_field form-control'  style='width: 100%;height: 3vh;text-align:left' placeholder='" + placeholder + "' value='" + value + "'/></input>" +
                    "</div>");
                break;
            case 6: //Increment
                $("iframe").contents().find("#" + inputDiv).append(
                    "<div id='" + inputDiv + "_value' class='col-md-7 input_field_div' style='text-align:left'>" +
                    "<input id='" + inputDiv + "_value_input' type='number' step='0.00001' class='input_field form-control'  style='width: 100%;height: 3vh;text-align:left' placeholder='" + placeholder + "' value='" + value + "'/></input>" +
                    "<button type='button' id='" + inputDiv + "_plus' class='btn btn-primary'>+</button>" +
                    "<button type='button' id='" + inputDiv + "_minus' class='btn btn-primary'>-</button>" +
                    "</div>");
                $("iframe").contents().find("#" + inputDiv + "_plus").click(function () {
                    $("iframe").contents().find("#" + inputDiv + "_value_input").attr("value", $("iframe").contents().find("#" + inputDiv + "_value_input").val() + property.Increment);
                });
                $("iframe").contents().find("#" + inputDiv + "_minus").click(function () {
                    $("iframe").contents().find("#" + inputDiv + "_value_input").attr("value", $("iframe").contents().find("#" + inputDiv + "_value_input").val() - property.Increment);
                });
                break;
            case 7: //Slider
                $("iframe").contents().find("#" + inputDiv).append(
                  "<div id='" + inputDiv + "_value' class='col-md-5 input_field_div' style='text-align:left'>" +
                  "<input id='" + inputDiv + "_slider_input' type='range' max='" + property.MaxValue + "' min='" + property.MinValue + "' step='" + property.Increment + "' class='input_field range-slider__range'  style='width: 100%;height: 3vh;text-align:left' placeholder='" + placeholder + "' value='" + value + "'/></input>" +
                  "</div><div class='col-md-2' id='" + inputDiv + "_slider_value_div'><input id='" + inputDiv + "_slider_value' class='input_field disable'  style='width: 100%;height: 3vh;text-align:left' placeholder='" + placeholder + "' value='" + value + "'/></input></div>");
                $("iframe").contents().find("#" + inputDiv + "_slider_input").change(function () {
                    $("iframe").contents().find("#" + inputDiv + "_slider_value").empty().attr("value", ($("iframe").contents().find("#" + inputDiv + "_slider_input").val()));
                });
                $("iframe").contents().find("#" + inputDiv + "_slider_input_value").change(function () {
                    $("iframe").contents().find("#" + inputDiv + "_slider_input").attr("value", ($("iframe").contents().find("#" + inputDiv + "_slider_input_value").val()));
                });
                break;
            case 8: //Color
                $("iframe").contents().find("#" + inputDiv).append(
                    "<div id='" + inputDiv + "_value' class='col-md-7 input_field_div' >" +
                    "<input type='text' id='" + inputDiv + "_value_input' class='color no-alpha form-control input_field input-xs'  style='width: 100%;height: 3vh;text-align:left'  value='" + value + "'/></input>" +
                    "</div>");
                var frame = parent.document.getElementById("control_frame_content");
                $("iframe").contents().find("#" + inputDiv + "_value_input").colorPicker({
                    body: frame.contentDocument.body,
                    cssAddon: '.cp-color-picker{border-radius:0px}',
                    margin: '57px 810px',
                });
                $("#cp-color-picker").css("right", 0).css("bottom", 0);


                break;
            case 9: //DataList
                $("iframe").contents().find("#" + inputDiv).append(
                    "<div id='" + inputDiv + "_value' class='col-md-7 input_field_div' style='text-align:left'>" +
                    "</div>");
                $("iframe").contents().find("#" + inputDiv + "_value").append("<select id='" + inputDiv + "_value_input' class='form-control input_field'  style='width: 100%;height: 3vh;padding-top:3px'></select>");
                for (var key in property.DefaultValues.$values) {
                    if (property.DefaultValues.$values.hasOwnProperty(key)) {
                        $("iframe").contents().find("#" + inputDiv + "_value_input").append("<option value='" + property.DefaultValues.$values[key] + "'>" + property.DefaultValues.$values[key] + "</option>");
                    }
                }
                break;
            case 10: //Link
                $("iframe").contents().find("#" + inputDiv).append(
                    "<div id='" + inputDiv + "_value' class='col-md-7 input_field_div' style='text-align:left'>" +
                    "</div>");
                $("iframe").contents().find("#" + inputDiv + "_value").append("<select id='" + inputDiv + "_value_input' class='form-control input_field' style='width: 100%;height: 3vh;padding-top:3px'></select>");
                var collection = eval("gdo.net.instance[instanceId]." + property.LinkedParameter);
                for (var key in collection) {
                    if (collection.hasOwnProperty(key)) {
                        //Check object type here somehow
                        $("iframe").contents().find("#" + inputDiv + "_value_input").append("<option value='" + collection[key].properties.Name.Value + "'");
                    }
                }
                //somehow assign value somwhere
                break;
            case 11: //Integer Array
                $("iframe").contents().find("#" + inputDiv).append(
                    "<div id='" + inputDiv + "_value' class='col-md-7 input_field_div' style='text-align:left'>" +
                    "</div>");
                for (var i = 0; i < property.Length; i++) {
                    if (property.DefaultValues == null && property.Values == null) {
                        $("iframe").contents().find("#" + inputDiv + "_value").append(
                            "<input id='" + inputDiv + "_value_input_" + i + "' type='number'  class='input_field form-control'  style='width: " + (100 / property.Length) + "%;height: 3vh;text-align:left' /></input>"
                        );
                    }
                    if (property.DefaultValues == null && property.Values != null) {
                        $("iframe").contents().find("#" + inputDiv + "_value").append(
                            "<input id='" + inputDiv + "_value_input_" + i + "' type='number'  class='input_field form-control'  style='width: " + (100 / property.Length) + "%;height: 3vh;text-align:left'  value='" + property.Values[i] + "'/></input>"
                        );
                    }
                    if (property.DefaultValues != null && property.Values == null) {
                        $("iframe").contents().find("#" + inputDiv + "_value").append(
                            "<input id='" + inputDiv + "_value_input_" + i + "' type='number'  class='input_field form-control'  style='width: " + (100 / property.Length) + "%;height: 3vh;text-align:left' placeholder='" + property.DefaultValues[i] + "'/></input>"
                        );
                    }
                    if (property.DefaultValues != null && property.Values != null) {
                        $("iframe").contents().find("#" + inputDiv + "_value").append(
                            "<input id='" + inputDiv + "_value_input_" + i + "' type='number'  class='input_field form-control'  style='width: " + (100 / property.Length) + "%;height: 3vh;text-align:left' placeholder='" + property.DefaultValues[i] + "' value='" + property.Values[i] + "'/></input>"
                        );
                    }
                }
                break;
            case 12: //Float Array
                $("iframe").contents().find("#" + inputDiv).append(
                    "<div id='" + inputDiv + "_value' class='col-md-7 input_field_div' style='text-align:left'>" +
                    "</div>");
                for (var i = 0; i < property.Length; i++) {
                    if (property.DefaultValues == null && property.Values == null) {
                        $("iframe").contents().find("#" + inputDiv + "_value").append(
                            "<input id='" + inputDiv + "_value_input_" + i + "' type='number' step='0.0001' class='input_field form-control'  style='width: " + (100 / property.Length) + "%;height: 3vh;text-align:left' /></input>"
                        );
                    }
                    if (property.DefaultValues == null && property.Values != null) {
                        $("iframe").contents().find("#" + inputDiv + "_value").append(
                            "<input id='" + inputDiv + "_value_input_" + i + "' type='number' step='0.0001' class='input_field form-control'  style='width: " + (100 / property.Length) + "%;height: 3vh;text-align:left'  value='" + property.Values[i] + "'/></input>"
                        );
                    }
                    if (property.DefaultValues != null && property.Values == null) {
                        $("iframe").contents().find("#" + inputDiv + "_value").append(
                            "<input id='" + inputDiv + "_value_input_" + i + "' type='number' step='0.0001' class='input_field form-control'  style='width: " + (100 / property.Length) + "%;height: 3vh;text-align:left' placeholder='" + property.DefaultValues[i] + "'/></input>"
                        );
                    }
                    if (property.DefaultValues != null && property.Values != null) {
                        $("iframe").contents().find("#" + inputDiv + "_value").append(
                            "<input id='" + inputDiv + "_value_input_" + i + "' type='number' step='0.0001' class='input_field form-control'  style='width: " + (100 / property.Length) + "%;height: 3vh;text-align:left' placeholder='" + property.DefaultValues[i] + "' value='" + property.Values[i] + "'/></input>"
                        );
                    }
                }
                break;
            case 13: //String Array
                $("iframe").contents().find("#" + inputDiv).append(
                    "<div id='" + inputDiv + "_value' class='col-md-7 input_field_div' style='text-align:left'>" +
                    "</div>");
                for (var i = 0; i < property.Length; i++) {
                    if (property.DefaultValues == null && property.Values == null) {
                        $("iframe").contents().find("#" + inputDiv + "_value").append(
                            "<input type='text' id='" + inputDiv + "_value_input_" + i + "'  class='input_field form-control'  style='width: " + (100 / property.Length) + "%;height: 3vh;text-align:left' /></input>"
                        );
                    }
                    if (property.DefaultValues == null && property.Values != null) {
                        $("iframe").contents().find("#" + inputDiv + "_value").append(
                            "<input type='text' id='" + inputDiv + "_value_input_" + i + "' class='input_field form-control'  style='width: " + (100 / property.Length) + "%;height: 3vh;text-align:left'  value='" + property.Values[i] + "'/></input>"
                        );
                    }
                    if (property.DefaultValues != null && property.Values == null) {
                        $("iframe").contents().find("#" + inputDiv + "_value").append(
                            "<input type='text' id='" + inputDiv + "_value_input_" + i + "' class='input_field form-control'  style='width: " + (100 / property.Length) + "%;height: 3vh;text-align:left' placeholder='" + property.DefaultValues[i] + "'/></input>"
                        );
                    }
                    if (property.DefaultValues != null && property.Values != null) {
                        $("iframe").contents().find("#" + inputDiv + "_value").append(
                            "<input type='text' id='" + inputDiv + "_value_input_" + i + "'  class='input_field form-control'  style='width: " + (100 / property.Length) + "%;height: 3vh;text-align:left' placeholder='" + property.DefaultValues[i] + "' value='" + property.Values[i] + "'/></input>"
                        );
                    }
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
        if ((!property.IsEditable && !isCreate)) {
            $("iframe").contents().find("#" + inputDiv).css("opacity", "0.5").css("pointer-events", "none");
        }
        if (property.Priority == -1) {
            $("iframe").contents().find("#" + inputDiv + "_value_input").css("opacity", "0.5").css("pointer-events", "none");
        }
    }
}

gdo.net.app["Maps"].drawCreateTable = function (instanceId, tab, layer) {
    gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Drawing Create Table for ' + tab);

    gdo.net.app["Maps"].drawEmptyCreateTable(tab);

    var properties = layer.properties;

    for (var key in properties) {
        if (key == null) {
            key = "";
        }
        if (properties.hasOwnProperty(key) && key != "$type") {
            gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Drawing Property ' + key + ' for ' + tab);

            $("iframe").contents().find("#" + tab + "_create_properties").append("<div id='" + tab + "_create_property_" + key + "' class='row' " + tab + "' property='" + key + "' style='width: 98%;height: 100%;'></div>");

            $("iframe").contents().find("#" + tab + "_create_property_").append(
                "<div id='" + tab + "_create_property_" + key + "_key' class='col-md-5' >&nbsp;&nbsp;" + key + "</div>" +
                "<div id='" + tab + "_create_property_" + key + "_value' class='col-md-7' style='color:gray' >" + properties[key].Value + "</div>");

            gdo.net.app["Maps"].drawInputField(instanceId, properties[key], key, tab + "_create_property_" + key, true);
        }
    }

    $('[data-toggle="tooltip"]').tooltip();
    $('[data-toggle="popover"]').popover();
}

gdo.net.app["Maps"].drawEmptyPropertyTable = function (tab) {
    $("iframe").contents().find("#" + tab + "_properties")
    .empty();
}

gdo.net.app["Maps"].drawPropertyTable = function (instanceId, tab, id) {
    gdo.net.app["Maps"].drawEmptyPropertyTable(tab);
    if (id >= 0) {
        gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Drawing Property Table for ' + tab + ' ' + id);
        //TODO change the name of the panel

        var arr = [];
        arr = eval("gdo.net.instance[instanceId]." + tab + "s");

        if (id >= 0) {
            for (var key in arr[id].properties) {
                if (key == null) {
                    key = "";
                }
                if (arr[id].properties.hasOwnProperty(key) && key != "$type") {
                    gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Drawing Property ' + key + ' for ' + tab + ' ' + id);


                    $("iframe").contents().find("#" + tab + "_properties").append("<div id='" + tab + "_" + id + "_property_" + key + "' class='row' " + tab + "Id='" + id + "' property='" + key + "' style='width: 98%;height: 100%;'></div>");

                    $("iframe").contents().find("#" + tab + "_" + id + "_property_").append(
                        "<div id='" + tab + "_" + id + "_property_" + key + "_key' class='col-md-5' >&nbsp;&nbsp;" + key + "</div>" +
                        "<div id='" + tab + "_" + id + "_property_" + key + "_value' class='col-md-7' style='color:gray' >" + arr[id].properties[key].Value + "</div>");

                    if (key != "Id" && key != "Name" && key != "ClassName" && key != "Type") {

                        $("iframe").contents().find("#" + tab + "_create_property_" + key).append(
                            "<div id='" + tab + "_property_" + key + "_key' class='col-md-5' >&nbsp;&nbsp;" + key + "</div>" +
                            "<div id='" + tab + "_property_" + key + "_value' class='col-md-7 input_field_div' style='text-align:left'>" +
                            "<input type='text' id='" + tab + "_property_" + key + "_value_input' class='input_field'  style='width: 100%;height: 100%;text-align:left' value='" + properties[key].Value + "'/></input></div>");
                        $("iframe").contents().find("#" + tab + "_property_" + key + "_value_input")
                            .attr("value", properties[key].Value);

                    } else {
                        $("iframe").contents().find("#" + tab + "_create_property_" + key).append(
                            "<div id='" + tab + "_property_" + key + "_key' class='col-md-5' >&nbsp;&nbsp;" + key + "</div>" +
                            "<div id='" + tab + "_property_" + key + "_value' class='col-md-7' style='color:gray'>" + properties[key].Value + "</div>");
                    }

                    /*if (Object.prototype.toString.call(arr[id].properties[key]) === '[object Array]') {
                        $("iframe").contents().find("#" + tab + "_" + id + "_property_" + key).append(
                        "<div id='" + tab + "_" + id + "_property_" + key + "_key' class='col-md-5' >&nbsp;&nbsp;" + key + "</div>" +
                        "<div id='" + tab + "_" + id + "_property_" + key + "_value' class='col-md-7' style='color:gray'>" + arr[id].properties[key] + "</div>");

                    } else {
                        if ((contains(arr[id].properties["Editables"].$values, key)) && (key != "Id" && key != "Name" && key != "ClassName" && key != "Type")) {
                            if (Object.prototype.toString.call(arr[id].properties[key]) === '[object Object]') {
                                $("iframe").contents().find("#" + tab + "_" + id + "_property_" + key).append(
                                "<div id='" + tab + "_" + id + "_property_" + key + "_key' class='col-md-5' >&nbsp;&nbsp;" + key + "</div>" +
                                "<div id='" + tab + "_" + id + "_property_" + key + "_value' class='col-md-7 input_field_div' style='text-align:left'>" +
                                    "<input type='text' id='" + tab + "_" + id + "_property_" + key + "_value_input' class='input_field'  style='width: 100%;height: 100%;text-align:left' value='" + arr[id].properties[key].Id + "'/></input></div>");
                                $("iframe").contents().find("#" + tab + "_" + id + "_property_" + key + "_value_input").val(arr[id].properties[key]);
                            } else {
                                $("iframe").contents().find("#" + tab + "_" + id + "_property_" + key).append(
                                "<div id='" + tab + "_" + id + "_property_" + key + "_key' class='col-md-5' >&nbsp;&nbsp;" + key + "</div>" +
                                "<div id='" + tab + "_" + id + "_property_" + key + "_value' class='col-md-7 input_field_div' style='text-align:left'>" +
                                    "<input type='text' id='" + tab + "_" + id + "_property_" + key + "_value_input' class='input_field'  style='width: 100%;height: 100%;text-align:left' value='" + arr[id].properties[key] + "'/></input></div>");
                                $("iframe").contents().find("#" + tab + "_" + id + "_property_" + key + "_value_input").val(arr[id].properties[key]);
                            }
                        } else {
                            if (Object.prototype.toString.call(arr[id].properties[key]) === '[object Object]') {
                                $("iframe").contents().find("#" + tab + "_" + id + "_property_" + key).append(
                                    "<div id='" + tab + "_" + id + "_property_" + key + "_key' class='col-md-5' >&nbsp;&nbsp;" + key + "</div>" +
                                    "<div id='" + tab + "_" + id + "_property_" + key + "_value' class='col-md-7' style='color:gray'>" + arr[id].properties[key].Id + "</div>");

                            } else {
                                $("iframe").contents().find("#" + tab + "_" + id + "_property_" + key).append(
                                    "<div id='" + tab + "_" + id + "_property_" + key + "_key' class='col-md-5' >&nbsp;&nbsp;" + key + "</div>" +
                                    "<div id='" + tab + "_" + id + "_property_" + key + "_value' class='col-md-7' style='color:gray'>" + arr[id].properties[key] + "</div>");
                            }
                        }

                    }*/
                }
            }
        } else {
            //TODO empty property table with some kind of template
        }
    }
    $('[data-toggle="tooltip"]').tooltip();
    $('[data-toggle="popover"]').popover();
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

        });

    $("iframe").contents().find(".layer-down-button")
        .unbind()
        .click(function () {

        });

    $("iframe").contents().find(".layer-visible-button")
        .unbind()
        .click(function () {

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

    $("iframe").contents().find("#source-remove-button")
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