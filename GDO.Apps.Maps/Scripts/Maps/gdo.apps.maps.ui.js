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
gdo.net.app["Maps"].selected["data"] = -1;
gdo.net.app["Maps"].selected["animation"] = -1;
gdo.net.app["Maps"].selected["view"] = -1;
gdo.net.app["Maps"].selected["configuration"] = -1;


gdo.net.app["Maps"].drawListTables = function (instanceId) {
    if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
        gdo.net.app["Maps"].drawListTable(instanceId, "layer");
        gdo.net.app["Maps"].drawListTable(instanceId, "source");
        gdo.net.app["Maps"].drawListTable(instanceId, "style");
        gdo.net.app["Maps"].drawListTable(instanceId, "format");
        gdo.net.app["Maps"].drawListTable(instanceId, "data");
        gdo.net.app["Maps"].drawListTable(instanceId, "animation");
        gdo.net.app["Maps"].drawListTable(instanceId, "view");
        gdo.net.app["Maps"].drawListTable(instanceId, "configuration");
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
    arr = jQuery.extend(true, [], eval("gdo.net.instance[instanceId]." + tab + "s"));;

    if (gdo.net.app["Maps"].selected[tab] >= 0) {
        for (var i in arr) {
            if (arr.hasOwnProperty(i) && arr[i] != null && typeof arr[i] != "undefined") {
                if (arr[i].properties.Id.Value == gdo.net.app["Maps"].selected[tab]) {
                    $("iframe").contents().find("#" + tab + "_label").empty().append("&nbsp;&nbsp;" + arr[i].properties.Name.Value + " (" + arr[i].properties.Id.Value + ")");
                }
            }
        }

    }
    if (tab == "layer") {
        arr.sort(function (a, b) {
            if (a == null && b == null) {
                return 0;
            } else if (a == null) {
                return 100;
            } else if (b == null) {
                return -100;
            } else {
                return b.properties.ZIndex.Value - a.properties.ZIndex.Value;
            }
        });
    }
    for (var i in arr) {
        if (arr.hasOwnProperty(i) && arr[i] != null && typeof arr[i] != "undefined") {

            $("iframe").contents().find("." + tab + "").append("<div class='" + tab + "_" + arr[i].properties.Id.Value + " row' " + tab + "Id='" + arr[i].properties.Id.Value + "'></div>");


            var color = "white";
            var icon = "";

            if (tab == "layer") {
                if (arr[i].properties.isInitialized) {
                    if (arr[i].properties.Visible.Value) {
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
            case 5: //List
                $("iframe").contents().find("#" + inputDiv).append(
                    "<div id='" + inputDiv + "_value' class='col-md-7 input_field_div' style='text-align:left'>" +
                    "</div>");
                for (var i = 0; i < property.Length; i++) {
                    $("iframe").contents().find("#" + inputDiv + "_value").append(
                        "<input type='text' id='" + inputDiv + "_value_input_" + i + "'  class='input_field form-control'  style='width: 100%;height: 3vh;text-align:left' placeholder='" + placeholders[i] + "' value='" + values[i] + "'/></input>"
                    );
                }
                if (property.Length == 0) {
                    $("iframe").contents().find("#" + inputDiv + "_value").append(
                       "<input type='text' id='" + inputDiv + "_value_input_" + 0 + "'  class='input_field form-control'  style='width: 100%;height: 3vh;text-align:left' placeholder='' value=''/></input>"
                   );
                }
                break;
            case 6: //Slider
                $("iframe").contents().find("#" + inputDiv).append(
                  "<div id='" + inputDiv + "_value' class='col-md-7 input_field_div' style='text-align:left'>" +
                  "<div class='col-md-10' style='padding:0px;height: 3vh;'><input id='" + inputDiv + "_slider_input' type='range' max='" + property.MaxValue + "' min='" + property.MinValue + "' step='" + property.Increment + "' class='input_field range-slider__range'  style='width: 100%;height: 3vh;text-align:left' placeholder='" + placeholder + "' value='" + value + "'/></input></div>" +
                  "<div class='col-md-2' style='padding:0px'><input id='" + inputDiv + "_value_input' class='input_field disable'  style='width: 100%;height: 3vh;text-align:left' placeholder='" + placeholder + "' value='" + value + "'/></input></div></div>");
                $("iframe").contents().find("#" + inputDiv + "_slider_input").change(function () {
                    $("iframe").contents().find("#" + inputDiv + "_value_input").val(($("iframe").contents().find("#" + inputDiv + "_slider_input").val()));
                });
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
                        for (var i = 0; i < property.ClassTypes.$values.length; i++) {
                            if (collection[key].properties.ClassName.Value == property.ClassTypes.$values[i]) {
                                if (value == collection[key].properties.Id.Value && value >= 0) {
                                    $("iframe").contents().find("#" + inputDiv + "_value_input").append("<option value='" + collection[key].properties.Id.Value + "' selected='selected'> " + collection[key].properties.Name.Value + "</option>");
                                } else {
                                    $("iframe").contents().find("#" + inputDiv + "_value_input").append("<option value='" + collection[key].properties.Id.Value + "'> " + collection[key].properties.Name.Value + "</option>");
                                }
                            }
                        }
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
            case 15: //Link Datalist
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
                        for (var i = 0; i < property.ClassTypes.$values.length; i++) {
                            if (collection[key].properties.ClassName.Value == property.ClassTypes.$values[i]) {
                                if (value == eval("collection[key].properties." + property.LinkedProperty + ".Value") && value != null) {
                                    $("iframe").contents().find("#" + inputDiv + "_value_input").append("<option value='" + eval("collection[key].properties." + property.LinkedProperty + ".Value") + "' selected='selected'> " + collection[key].properties.Name.Value + "</option>");
                                } else {
                                    $("iframe").contents().find("#" + inputDiv + "_value_input").append("<option value='" + eval("collection[key].properties." + property.LinkedProperty + ".Value") + "'> " + collection[key].properties.Name.Value + "</option>");
                                }
                            }
                        }
                    }
                }
                //somehow assign value somwhere
                break;
            case 16: //File
                $("iframe").contents().find("#" + inputDiv).append(
                    "<div id='" + inputDiv + "_value' class='col-md-7 input_field_div' style='text-align:left'>" +
                        "<form class='row' id='" + inputDiv + "_form' action='' method='post' enctype='multipart/form-data' target='dummy' style='margin:0px;padding:0px;'>" +
                            "<div class='col-sm-8' style='text-align:left;margin:0px;padding:0px;'>" +
                                "<input type='text' id='" + inputDiv + "_value_input' class='form-control input_field input-sm '  style='width: 100%;height: 3vh;text-align:left' placeholder='" + placeholder + "' value='" + value + "'/></input>" +
                            "</div>" +
                            "<div class='col-sm-2' style='  padding:1px;height: 3vh;text-align:left''>" +
                                "<button class='btn btn-primary btn-file btn-sm btn-block' style='border-color:transparent;width: 100%;height: 100%;'>Choose File <input type='file' name='File' class='upload' id='" + inputDiv + "_select_file'></button>" +
                            "</div>" +
                            "<div class='col-sm-2' style=' padding:1px;height: 3vh;text-align:left''>" +
                                "<input id='" + inputDiv + "_submit_file' class='btn btn-success btn-sm btn-block' style='border-color: transparent;width: 100%;height: 100%;' type='submit' value='Submit'></input>" +
                            "</div>" +
                        "</form>" +
                    "</div>");
                $("iframe").contents().find("#" + inputDiv + "_form").on('submit', function () {
                    $("iframe").contents().find("#" + inputDiv + "_value_input").val("../../Data/Maps/" + $("iframe").contents().find("#" + inputDiv + "_select_file").val().slice(12, 500));
                });

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
    if (object != null) {
        gdo.net.app["Maps"].drawTable(instanceId, tab, object, false);
    }
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
    var arr = ["layer", "source", "style", "format", "data", "animation"];
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
                    //$("iframe").contents().find("#" + arr[i] + "_types").append("<option value='" + className + "'>" + className + "</option>");
                    $("iframe").contents().find("#" + arr[i] + "_types").append("<div id='" + arr[i] + "_types_" + className + "' index='" + index + "' type='" + arr[i] + "'>" + className + "</option>");
                    $("iframe").contents().find("#" + arr[i] + "_types_" + className)
                        .unbind()
                        .click(function () {
                            $("iframe").contents().find("#" + $(this).attr("type") + "_types_input").val(eval("gdo.net.instance[" + instanceId + "].template." + upperCaseFirstLetter($(this).attr("type")) + "s.$values[" + parseInt($(this).attr("index")) + "].ClassName.Value"));
                            $("iframe").contents().find("#" + $(this).attr("type") + "_types_input").attr("index", parseInt($(this).attr("index")));
                            $("iframe").contents().find("#" + $(this).attr("type") + "_description").empty().append(eval("gdo.net.instance[" + instanceId + "].template." + upperCaseFirstLetter($(this).attr("type")) + "s.$values[" + parseInt($(this).attr("index")) + "].Description.Value"));
                        }).mouseout(function () {
                            $(this).css("color", "white");
                            if ($("iframe").contents().find("#" + $(this).attr("type") + "_types_input").attr("index") != null && $("iframe").contents().find("#" + $(this).attr("type") + "_types_input").attr("index") != 'undefined') {
                                $("iframe").contents().find("#" + $(this).attr("type") + "_description").empty().append(eval("gdo.net.instance[" + instanceId + "].template." + upperCaseFirstLetter($(this).attr("type")) + "s.$values[" + $("iframe").contents().find("#" + $(this).attr("type") + "_types_input").attr("index") + "].Description.Value"));
                            }
                        }).mouseover(function () {
                            $(this).css("color", "#4CBFF8");
                            $("iframe").contents().find("#" + $(this).attr("type") + "_description").empty().append(eval("gdo.net.instance[" + instanceId + "].template." + upperCaseFirstLetter($(this).attr("type")) + "s.$values[" + parseInt($(this).attr("index")) + "].Description.Value"));
                        });
                }
            }
        }
    }
}




gdo.net.app["Maps"].submitNextButton = function (instanceId, tab) {
    var name = $("iframe").contents().find("#" + tab + "_name_input").val();
    var className = $("iframe").contents().find("#" + tab + "_types_input").val();
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

gdo.net.app["Maps"].submitSaveButton = function (instanceId, tab, isCreate) {
    var c;
    var properties;
    if (isCreate) {
        c = "_create";
        properties = gdo.net.instance[instanceId].temp[tab].properties;
    } else {
        c = "";
        if (gdo.net.app["Maps"].selected[tab] >= 0) {
            properties = eval("gdo.net.instance[" + instanceId + "]." + tab + "s[" + gdo.net.app["Maps"].selected[tab] + "].properties");
        }
    }
    if (properties != null) {
        for (var key in properties) {
            var property = properties[key];
            if (!properties.hasOwnProperty((key))) {
                continue;
            } else if (key != "Id" && key != "ClassName" && key != "Type" && key != "ObjectType" && key != "$type" && property.IsVisible) {
                if (property.ParameterType == 0 || property.ParameterType == 2 || property.ParameterType == 3 || property.ParameterType == 4) {
                    property.Value = gdo.net.app["Maps"].readValueFromInput($("iframe").contents().find("#" + tab + c + "_property_" + key + "_value_input"), property.VariableType);
                    if (property.Value == null) {
                        property.IsNull = true;
                    } else {
                        property.IsNull = false;
                    }
                } else if (property.ParameterType == 1) {
                    var nullCheck = false;
                    for (var i = 0; i < property.Length; i++) {
                        property.Values.$values[i] = gdo.net.app["Maps"].readValueFromInput($("iframe").contents().find("#" + tab + c + "_property_" + key + "_value_input_" + i), property.VariableType);
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
        if (isCreate) {
            gdo.net.app["Maps"].uploadObject(instanceId, tab, gdo.net.instance[instanceId].temp[tab], true);
        } else {
            gdo.net.app["Maps"].uploadObject(instanceId, tab, eval("gdo.net.instance[" + instanceId + "]." + tab + "s[" + gdo.net.app["Maps"].selected[tab] + "]"), false);
        }
    }
}


gdo.net.app["Maps"].submitRemoveButton = function (instanceId, tab) {
    if (gdo.net.app["Maps"].selected[tab] >= 0) {
        var temp = gdo.net.app["Maps"].selected[tab];
        gdo.net.app["Maps"].selected[tab] = -1;
        eval("gdo.net.app['Maps'].server.remove" + upperCaseFirstLetter(tab) + "(" + instanceId + ", temp);");
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
            if (gdo.net.app["Maps"].selected["layer"] >= 0) {
                var tempVal = 1000;
                var tempIndex = -1;

                for (var i in gdo.net.instance[instanceId].layers) {
                    if (gdo.net.instance[instanceId].layers.hasOwnProperty(i) && gdo.net.instance[instanceId].layers[i] != null && typeof gdo.net.instance[instanceId].layers[i] != "undefined") {
                        if (gdo.net.instance[instanceId].layers[i].properties.ZIndex.Value > gdo.net.instance[instanceId].layers[gdo.net.app["Maps"].selected["layer"]].properties.ZIndex.Value && gdo.net.instance[instanceId].layers[i].properties.ZIndex.Value < tempVal) {
                            tempVal = gdo.net.instance[instanceId].layers[i].properties.ZIndex.Value;
                            tempIndex = i;
                        }
                    }
                }
                if (tempIndex > -1) {
                    gdo.net.instance[instanceId].layers[tempIndex].properties.ZIndex.Value = gdo.net.instance[instanceId].layers[gdo.net.app["Maps"].selected["layer"]].properties.ZIndex.Value;
                    gdo.net.instance[instanceId].layers[gdo.net.app["Maps"].selected["layer"]].properties.ZIndex.Value = tempVal;
                    gdo.net.app['Maps'].server.updateLayer(instanceId, gdo.net.instance[instanceId].layers[gdo.net.app["Maps"].selected["layer"]].properties.Id.Value, gdo.net.instance[instanceId].layers[gdo.net.app["Maps"].selected["layer"]].properties.ClassName.Value, JSON.stringify(gdo.net.instance[instanceId].layers[gdo.net.app["Maps"].selected["layer"]].properties).replace(/'/g, "\\'"));
                    gdo.net.app['Maps'].server.updateLayer(instanceId, gdo.net.instance[instanceId].layers[tempIndex].properties.Id.Value, gdo.net.instance[instanceId].layers[tempIndex].properties.ClassName.Value, JSON.stringify(gdo.net.instance[instanceId].layers[tempIndex].properties).replace(/'/g, "\\'"));
                }
                //gdo.net.app["Maps"].drawListTables(instanceId);
            }
        });

    $("iframe").contents().find(".layer-down-button")
        .unbind()
        .click(function () {
            if (gdo.net.app["Maps"].selected["layer"] >= 0) {
                var tempVal = -1;
                var tempIndex = -1;
                if (gdo.net.instance[instanceId].layers[gdo.net.app["Maps"].selected["layer"]].properties.ZIndex.Value > 0) {
                    for (var i in gdo.net.instance[instanceId].layers) {
                        if (gdo.net.instance[instanceId].layers.hasOwnProperty(i) && gdo.net.instance[instanceId].layers[i] != null && typeof gdo.net.instance[instanceId].layers[i] != "undefined") {
                            if (gdo.net.instance[instanceId].layers[i].properties.ZIndex.Value < gdo.net.instance[instanceId].layers[gdo.net.app["Maps"].selected["layer"]].properties.ZIndex.Value && gdo.net.instance[instanceId].layers[i].properties.ZIndex.Value > tempVal) {
                                tempVal = gdo.net.instance[instanceId].layers[i].properties.ZIndex.Value;
                                tempIndex = i;
                            }
                        }
                    }
                    if (tempIndex > -1) {
                        gdo.net.instance[instanceId].layers[tempIndex].properties.ZIndex.Value = gdo.net.instance[instanceId].layers[gdo.net.app["Maps"].selected["layer"]].properties.ZIndex.Value;
                        gdo.net.instance[instanceId].layers[gdo.net.app["Maps"].selected["layer"]].properties.ZIndex.Value = tempVal;
                        gdo.net.app['Maps'].server.updateLayer(instanceId, gdo.net.instance[instanceId].layers[gdo.net.app["Maps"].selected["layer"]].properties.Id.Value, gdo.net.instance[instanceId].layers[gdo.net.app["Maps"].selected["layer"]].properties.ClassName.Value, JSON.stringify(gdo.net.instance[instanceId].layers[gdo.net.app["Maps"].selected["layer"]].properties).replace(/'/g, "\\'"));
                        gdo.net.app['Maps'].server.updateLayer(instanceId, gdo.net.instance[instanceId].layers[tempIndex].properties.Id.Value, gdo.net.instance[instanceId].layers[tempIndex].properties.ClassName.Value, JSON.stringify(gdo.net.instance[instanceId].layers[tempIndex].properties).replace(/'/g, "\\'"));
                        //gdo.net.app["Maps"].drawListTables(instanceId);
                    }
                }
            }
        });

    $("iframe").contents().find(".layer-visible-button")
        .unbind()
        .click(function () {
            if (gdo.net.app["Maps"].selected["layer"] >= 0) {
                gdo.net.instance[instanceId].layers[gdo.net.app["Maps"].selected["layer"]].properties.Visible.Value = !gdo.net.instance[instanceId].layers[gdo.net.app["Maps"].selected["layer"]].properties.Visible.Value;
                gdo.net.app['Maps'].server.updateLayer(instanceId, gdo.net.instance[instanceId].layers[gdo.net.app["Maps"].selected["layer"]].properties.Id.Value, gdo.net.instance[instanceId].layers[gdo.net.app["Maps"].selected["layer"]].properties.ClassName.Value, JSON.stringify(gdo.net.instance[instanceId].layers[gdo.net.app["Maps"].selected["layer"]].properties).replace(/'/g, "\\'"));
                gdo.net.app["Maps"].drawListTables(instanceId);
            }
        });

    $("iframe").contents().find("#layer-next-button")
        .unbind()
        .click(function () { gdo.net.app["Maps"].submitNextButton(instanceId, "layer"); });

    $("iframe").contents().find("#layer-create-button")
        .unbind()
        .click(function () { gdo.net.app["Maps"].submitSaveButton(instanceId, "layer", true); });

    $("iframe").contents().find(".layer-remove-button")
        .unbind()
        .click(function () { gdo.net.app["Maps"].submitRemoveButton(instanceId, "layer"); });

    $("iframe").contents().find(".layer-save-button")
        .unbind()
        .click(function () { gdo.net.app["Maps"].submitSaveButton(instanceId, "layer", false); });

    $("iframe").contents().find(".layer-saveas-button")
        .unbind()
        .click(function () {
            gdo.net.instance[instanceId].temp["layer"] = {};
            gdo.net.instance[instanceId].temp["layer"].properties = jQuery.extend(true, {}, gdo.net.instance[instanceId].layers[gdo.net.app["Maps"].selected["layer"]].properties);
            gdo.net.app["Maps"].drawCreateTable(instanceId, "layer", gdo.net.instance[instanceId].temp["layer"]);
            $("iframe").contents().find("#new-layer-input").modal('show');
            $(".modal-backdrop").css("display", "none");
        });

    $("iframe").contents().find("#source-next-button")
        .unbind()
        .click(function () { gdo.net.app["Maps"].submitNextButton(instanceId, "source"); });

    $("iframe").contents().find("#source-create-button")
        .unbind()
        .click(function () { gdo.net.app["Maps"].submitSaveButton(instanceId, "source", true); });

    $("iframe").contents().find(".source-remove-button")
        .unbind()
        .click(function () { gdo.net.app["Maps"].submitRemoveButton(instanceId, "source"); });

    $("iframe").contents().find(".source-save-button")
        .unbind()
        .click(function () { gdo.net.app["Maps"].submitSaveButton(instanceId, "source", false); });

    $("iframe").contents().find(".source-saveas-button")
        .unbind()
        .click(function () {
            gdo.net.instance[instanceId].temp["source"] = {};
            gdo.net.instance[instanceId].temp["source"].properties = jQuery.extend(true, {}, gdo.net.instance[instanceId].sources[gdo.net.app["Maps"].selected["source"]].properties);
            gdo.net.app["Maps"].drawCreateTable(instanceId, "source", gdo.net.instance[instanceId].temp["source"]);
            $("iframe").contents().find("#new-source-input").modal('show');
            $(".modal-backdrop").css("display", "none");
        });

    $("iframe").contents().find("#style-next-button")
        .unbind()
        .click(function () { gdo.net.app["Maps"].submitNextButton(instanceId, "style"); });

    $("iframe").contents().find("#style-create-button")
        .unbind()
        .click(function () { gdo.net.app["Maps"].submitSaveButton(instanceId, "style", true); });

    $("iframe").contents().find(".style-remove-button")
        .unbind()
        .click(function () { gdo.net.app["Maps"].submitRemoveButton(instanceId, "style"); });

    $("iframe").contents().find(".style-save-button")
        .unbind()
        .click(function () { gdo.net.app["Maps"].submitSaveButton(instanceId, "style", false); });

    $("iframe").contents().find(".style-saveas-button")
    .unbind()
    .click(function () {
        gdo.net.instance[instanceId].temp["style"] = {};
        gdo.net.instance[instanceId].temp["style"].properties = jQuery.extend(true, {}, gdo.net.instance[instanceId].styles[gdo.net.app["Maps"].selected["style"]].properties);
        gdo.net.app["Maps"].drawCreateTable(instanceId, "style", gdo.net.instance[instanceId].temp["style"]);
        $("iframe").contents().find("#new-style-input").modal('show');
        $(".modal-backdrop").css("display", "none");
    });

    $("iframe").contents().find("#format-next-button")
       .unbind()
       .click(function () { gdo.net.app["Maps"].submitNextButton(instanceId, "format"); });

    $("iframe").contents().find("#format-create-button")
       .unbind()
       .click(function () { gdo.net.app["Maps"].submitSaveButton(instanceId, "format", true); });

    $("iframe").contents().find(".format-remove-button")
        .unbind()
       .click(function () { gdo.net.app["Maps"].submitRemoveButton(instanceId, "format"); });

    $("iframe").contents().find(".format-save-button")
        .unbind()
       .click(function () { gdo.net.app["Maps"].submitSaveButton(instanceId, "format", false); });

    $("iframe").contents().find(".format-saveas-button")
        .unbind()
        .click(function () {
            gdo.net.instance[instanceId].temp["format"] = {};
            gdo.net.instance[instanceId].temp["format"].properties = jQuery.extend(true, {}, gdo.net.instance[instanceId].formats[gdo.net.app["Maps"].selected["format"]].properties);
            gdo.net.app["Maps"].drawCreateTable(instanceId, "format", gdo.net.instance[instanceId].temp["format"]);
            $("iframe").contents().find("#new-format-input").modal('show');
            $(".modal-backdrop").css("display", "none");
        });

    $("iframe").contents().find("#data-next-button")
    .unbind()
    .click(function () { gdo.net.app["Maps"].submitNextButton(instanceId, "data"); });

    $("iframe").contents().find("#data-create-button")
       .unbind()
       .click(function () { gdo.net.app["Maps"].submitSaveButton(instanceId, "data", true); });

    $("iframe").contents().find(".data-remove-button")
        .unbind()
       .click(function () { gdo.net.app["Maps"].submitRemoveButton(instanceId, "data"); });

    $("iframe").contents().find(".data-save-button")
        .unbind()
       .click(function () { gdo.net.app["Maps"].submitSaveButton(instanceId, "data", false); });

    $("iframe").contents().find(".data-saveas-button")
        .unbind()
        .click(function () {
            gdo.net.instance[instanceId].temp["data"] = {};
            gdo.net.instance[instanceId].temp["data"].properties = jQuery.extend(true, {}, gdo.net.instance[instanceId].datas[gdo.net.app["Maps"].selected["data"]].properties);
            gdo.net.app["Maps"].drawCreateTable(instanceId, "data", gdo.net.instance[instanceId].temp["data"]);
            $("iframe").contents().find("#new-data-input").modal('show');
            $(".modal-backdrop").css("display", "none");
        });

    $("iframe").contents().find("#animation-next-button")
    .unbind()
    .click(function () { gdo.net.app["Maps"].submitNextButton(instanceId, "animation"); });

    $("iframe").contents().find("#animation-create-button")
       .unbind()
       .click(function () { gdo.net.app["Maps"].submitSaveButton(instanceId, "animation", true); });

    $("iframe").contents().find(".animation-remove-button")
        .unbind()
       .click(function () { gdo.net.app["Maps"].submitRemoveButton(instanceId, "animation"); });

    $("iframe").contents().find(".animation-save-button")
        .unbind()
       .click(function () { gdo.net.app["Maps"].submitSaveButton(instanceId, "animation", false); });

    $("iframe").contents().find(".animation-saveas-button")
        .unbind()
        .click(function () {
            gdo.net.instance[instanceId].temp["animation"] = {};
            gdo.net.instance[instanceId].temp["animation"].properties = jQuery.extend(true, {}, gdo.net.instance[instanceId].animations[gdo.net.app["Maps"].selected["animation"]].properties);
            gdo.net.app["Maps"].drawCreateTable(instanceId, "animation", gdo.net.instance[instanceId].temp["animation"]);
            $("iframe").contents().find("#new-animation-input").modal('show');
            $(".modal-backdrop").css("display", "none");
        });

    $("iframe").contents().find("#view-next-button")
    .unbind()
    .click(function () {
        gdo.net.app["Maps"].submitNextButton(instanceId, "view");
        gdo.net.instance[instanceId].temp["view"].properties.Center.Values = gdo.net.instance[instanceId].position.Center;
        gdo.net.instance[instanceId].temp["view"].properties.TopLeft.Values = gdo.net.instance[instanceId].position.TopLeft;
        gdo.net.instance[instanceId].temp["view"].properties.BottomRight.Values = gdo.net.instance[instanceId].position.BottomRight;
        gdo.net.instance[instanceId].temp["view"].properties.Resolution.Value = gdo.net.instance[instanceId].position.Resolution;
        gdo.net.instance[instanceId].temp["view"].properties.Width.Value = gdo.net.instance[instanceId].position.Width;
        gdo.net.instance[instanceId].temp["view"].properties.Height.Value = gdo.net.instance[instanceId].position.Height;
        gdo.net.app["Maps"].drawCreateTable(instanceId, "view", gdo.net.instance[instanceId].temp["view"]);
    });

    $("iframe").contents().find("#view-create-button")
       .unbind()
       .click(function () { gdo.net.app["Maps"].submitSaveButton(instanceId, "view", true); });

    $("iframe").contents().find(".view-save-button")
       .unbind()
       .click(function () { gdo.net.app["Maps"].submitSaveButton(instanceId, "view", false); });

    $("iframe").contents().find(".view-remove-button")
        .unbind()
       .click(function () { gdo.net.app["Maps"].submitRemoveButton(instanceId, "view"); });

    $("iframe").contents().find(".view-set-current-button")
        .unbind()
       .click(function () {
           if (gdo.net.app["Maps"].selected["view"] >= 0) {
               gdo.net.app["Maps"].server.useView(instanceId, gdo.net.app["Maps"].selected["view"]);
               setTimeout(function () { gdo.net.app["Maps"].server.useView(instanceId, gdo.net.app["Maps"].selected["view"]) }, 250);
               setTimeout(function () { gdo.net.app["Maps"].server.useView(instanceId, gdo.net.app["Maps"].selected["view"]) }, 500);
           }
       });

    $("iframe").contents().find(".view-save-current-button")
        .unbind()
        .click(function () {
            if (gdo.net.app["Maps"].selected["view"] >= 0) {
                gdo.net.app["Maps"].server.usePosition(instanceId, gdo.net.app["Maps"].selected["view"]);
            }
        });

    $("iframe").contents().find("#configuration-next-button")
    .unbind()
    .click(function () {
        gdo.net.instance[instanceId].temp["configuration"] = {};
        var currentConfig = 0;
        for (var i = 0; i < gdo.net.instance[instanceId].configurations.length; i++) {
            if (gdo.net.instance[instanceId].configurations[i].properties.Name.Value == gdo.net.instance[instanceId].configName) {
                currentConfig = i;
            }
        }
        gdo.net.instance[instanceId].temp["configuration"].properties = jQuery.extend(true, {}, gdo.net.instance[instanceId].configurations[currentConfig].properties);
        gdo.net.instance[instanceId].temp["configuration"].properties.Name.Value = $("iframe").contents().find("#configuration_name_input").val();
        gdo.net.app["Maps"].drawCreateTable(instanceId, "configuration", gdo.net.instance[instanceId].temp["configuration"]);
        $("iframe").contents().find("#new-configuration-input").modal('show');
        $(".modal-backdrop").css("display", "none");
    });

    $("iframe").contents().find("#configuration-create-button")
       .unbind()
       .click(function () {
           var configName = $("iframe").contents().find("#configuration_name_input").val();
           if (configName != null) {
               gdo.net.app["Maps"].server.saveConfiguration(instanceId, configName);
           }
       });

    $("iframe").contents().find(".configuration-remove-button")
        .unbind()
       .click(function () {
           if (gdo.net.app["Maps"].selected["configuration"] >= 0) {
               gdo.net.app["Maps"].server.deleteConfiguration(instanceId, gdo.net.instance[instanceId].configurations[gdo.net.app["Maps"].selected["configuration"]].properties.Name.Value);
               gdo.net.app["Maps"].selected["configuration"] = -1;
           }
       });

    $("iframe").contents().find(".configuration-save-button")
        .unbind()
       .click(function () {

           if (gdo.net.app["Maps"].selected["configuration"] >= 0) {
               var configName;
               for (var i = 0; i < gdo.net.instance[instanceId].configurations.length; i++) {
                   if (gdo.net.instance[instanceId].configurations[i].properties.Name.Value == gdo.net.instance[instanceId].configName) {
                       configName = gdo.net.instance[instanceId].configName;
                   }
               }
               gdo.net.app["Maps"].selected["configuration"] = -1;
               gdo.net.app["Maps"].server.saveConfiguration(instanceId, configName);
           }
       });

    $("iframe").contents().find(".configuration-load-button")
        .unbind()
        .click(function () {
            if (gdo.net.app["Maps"].selected["configuration"] >= 0) {
                var configName = gdo.net.instance[instanceId].configurations[gdo.net.app["Maps"].selected["configuration"]].properties.Name.Value;
                gdo.net.server.useAppConfiguration(instanceId, configName);
                setTimeout(function () { gdo.net.app["Maps"].server.initMap(instanceId) }, 500);
                setTimeout(function () { gdo.management.instances.loadInstanceControlFrame("Maps", instanceId, configName) }, 1500);
            }
        });

    $("iframe").contents().find(".configuration-upload-button")
    .unbind()
    .click(function () {
        //??
        gdo.net.app["Maps"].server.scanConfigurations(instanceId);
    });
}