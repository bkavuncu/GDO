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

gdo.net.app["Maps"].drawEmptyListTable = function (tab) {
    $("iframe").contents().find("." + tab + "")
    .empty();
}

gdo.net.app["Maps"].drawListTable = function (instanceId, tab) {
    gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Drawing ' + tab + ' Table');

    gdo.net.app["Maps"].drawEmptyListTable(tab);

    var j = 1;

    var arr = [];
    arr = eval("gdo.net.instance[instanceId]." + tab + "s");

    for (var i in arr) {
        if (arr.hasOwnProperty(i) && arr[i] != null && typeof arr[i] != "undefined") {
            gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Drawing ' + tab + ' ' + i);

            $("iframe").contents().find("." + tab + "").append("<div class='" + tab + "_" + i + " row' " + tab + "Id='" + i + "'></div>");
            if (gdo.net.app["Maps"].selected[tab] > 0) {
                $("iframe").contents().find("#" + tab + "_label").empty().append("&nbsp;&nbsp;" + arr[gdo.net.app["Maps"].selected[tab]].properties.Name + " (" + arr[gdo.net.app["Maps"].selected[tab]].properties.Id + ")");
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
                        "<div class='" + tab + "_" + i + "_id col-md-2'  " + tab + "Id='" + i + "'> &nbsp;&nbsp;" + arr[i].properties.Id + "</div>" +
                        "<div class='" + tab + "_" + i + "_name col-md-8'  " + tab + "Id='" + i + "'> " + arr[i].properties.Name + "</div>" +
                        "<div class='" + tab + "_" + i + "_icon col-md-1'  " + tab + "Id='" + i + "'><i class='fa " + icon + "'></i></div>" +
                    "</div>");
            $("iframe").contents().find("." + tab + "_" + i + "_content").unbind().click(function () {
                gdo.net.app["Maps"].selected[tab] = $(this).attr(tab+"Id");
                gdo.net.app["Maps"].drawListTable(instanceId, tab);
            });
            j++;
        }
    }
    gdo.net.app["Maps"].drawPropertyTable(instanceId, tab, gdo.net.app["Maps"].selected[tab]);

    //TODO draw property table
}

gdo.net.app["Maps"].drawEmptyPropertyTable = function (tab) {
    $("iframe").contents().find("#" + tab + "_properties")
    .empty();
}

gdo.net.app["Maps"].drawPropertyTable = function (instanceId, tab, id) {
    gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Drawing Property Table for ' + tab + ' ' + id);
    if (id > 0) {
        gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Drawing Property Table for ' + tab + ' ' + id);

        gdo.net.app["Maps"].drawEmptyPropertyTable(tab);

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
                        "<div id='" + tab + "_" + id + "_property_" + key + "_value' class='col-md-7' style='color:gray' >" + arr[id].properties[key] + "</div>");



                    if (Object.prototype.toString.call(arr[id].properties[key]) === '[object Array]') {
                        $("iframe").contents().find("#" + tab + "_" + id + "_property_" + key).append(
                        "<div id='" + tab + "_" + id + "_property_" + key + "_key' class='col-md-5' >&nbsp;&nbsp;" + key + "</div>" +
                        "<div id='" + tab + "_" + id + "_property_" + key + "_value' class='col-md-7' style='color:gray'>" + arr[id].properties[key] + "</div>");

                    } else {
                        if (key == "Editables") {
                            
                        } else if ((contains(arr[id].properties["Editables"].$values, key) || !arr[id].properties.isInitialized) && (key != "Id" && key !="Name" && key !="ClassName" && key !="Type")) {
                            if (Object.prototype.toString.call(arr[id].properties[key]) === '[object Object]') {
                                $("iframe").contents().find("#" + tab + "_" + id + "_property_" + key).append(
                                "<div id='" + tab + "_" + id + "_property_" + key + "_key' class='col-md-5' >&nbsp;&nbsp;" + key + "</div>" +
                                "<div id='" + tab + "_" + id + "_property_" + key + "_value' class='col-md-7 input_field_div' style='text-align:left'>" +
                                    "<input type='text' id='" + tab + "_" + id + "_property_" + key + "_value_input' class='input_field'  style='width: 100%;height: 100%;text-align:left' value=" + arr[id].properties[key].Id + "/></input></div>");
                                $("iframe").contents().find("#" + tab + "_" + id + "_property_" + key + "_value_input")
                                    .attr("value", arr[id].properties[key].Id);
                            } else {
                                $("iframe").contents().find("#" + tab + "_" + id + "_property_" + key).append(
                                "<div id='" + tab + "_" + id + "_property_" + key + "_key' class='col-md-5' >&nbsp;&nbsp;" + key + "</div>" +
                                "<div id='" + tab + "_" + id + "_property_" + key + "_value' class='col-md-7 input_field_div' style='text-align:left'>" +
                                    "<input type='text' id='" + tab + "_" + id + "_property_" + key + "_value_input' class='input_field'  style='width: 100%;height: 100%;text-align:left' value=" + arr[id].properties[key] + "/></input></div>");
                                $("iframe").contents().find("#" + tab + "_" + id + "_property_" + key + "_value_input")
                                    .attr("value", arr[id].properties[key]);
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
                    }
                }
            }
        } else {
            //TODO empty property table with some kind of template
        }
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
    for (var index in gdo.net.instance[instanceId].template.Layers.$values) {
        if (!gdo.net.instance[instanceId].template.Layers.$values.hasOwnProperty((index))) {
            continue;
        } else if (gdo.net.instance[instanceId].template.Layers.$values[index] != null) {
            className = gdo.net.instance[instanceId].template.Layers.$values[index].ClassName;
            $("iframe").contents().find("#layer_types").append("<option value='" + className + "'>" + className + "</option>");
        }
    }
    for (var index in gdo.net.instance[instanceId].template.Sources.$values) {
        if (!gdo.net.instance[instanceId].template.Sources.$values.hasOwnProperty((index))) {
            continue;
        } else if (gdo.net.instance[instanceId].template.Sources.$values[index] != null) {
            className = gdo.net.instance[instanceId].template.Sources.$values[index].ClassName;
            $("iframe").contents().find("#source_types").append("<option value='" + className + "'>" + className + "</option>");
        }
    }
    for (var index in gdo.net.instance[instanceId].template.Styles.$values) {
        if (!gdo.net.instance[instanceId].template.Styles.$values.hasOwnProperty((index))) {
            continue;
        } else if (gdo.net.instance[instanceId].template.Styles.$values[index] != null) {
            className = gdo.net.instance[instanceId].template.Styles.$values[index].ClassName;
            $("iframe").contents().find("#style_types").append("<option value='" + className + "'>" + className + "</option>");
        }
    }
    for (var index in gdo.net.instance[instanceId].template.Formats.$values) {
        if (!gdo.net.instance[instanceId].template.Formats.$values.hasOwnProperty((index))) {
            continue;
        } else if (gdo.net.instance[instanceId].template.Formats.$values[index] != null) {
            className = gdo.net.instance[instanceId].template.Formats.$values[index].ClassName;
            $("iframe").contents().find("#format_types").append("<option value='" + className + "'>" + className + "</option>");
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

    $("iframe").contents().find("#layer-create-button")
        .unbind()
        .click(function () {
            var name = $("iframe").contents().find("#layer_name_input").val();
            var className = $("iframe").contents().find("#layer_types").val();
            var layer = {};
            if (name != null && className != null) {
                for (var index in gdo.net.instance[instanceId].template.Layers.$values) {
                    if (!gdo.net.instance[instanceId].template.Layers.$values.hasOwnProperty((index))) {
                        continue;
                    } else if (gdo.net.instance[instanceId].template.Layers.$values[index] != null) {
                        if (gdo.net.instance[instanceId].template.Layers.$values[index].ClassName == className) {
                            layer.properties = clone(gdo.net.instance[instanceId].template.Layers.$values[index]);
                            gdo.net.app["Maps"].index["layer"]++;
                            layer.properties.Id = gdo.net.app["Maps"].index["layer"];
                            layer.properties.Name = name;
                            layer.isInitialized = false;
                        }
                    }
                }
                gdo.net.instance[instanceId].layers[layer.properties.Id] = layer;
                gdo.net.app["Maps"].selected["layer"] = layer.properties.Id;
                gdo.net.app["Maps"].drawListTable(instanceId, "layer");
            }
        });

    $("iframe").contents().find(".layer-remove-button")
        .unbind()
        .click(function () {

        });

    $("iframe").contents().find(".layer-save-button")
        .unbind()
        .click(function () {
            //TODO
            //
        });

    $("iframe").contents().find("#source-create-button")
        .unbind()
        .click(function () {
            var name = $("iframe").contents().find("#source_name_input").val();
            var className = $("iframe").contents().find("#source_types").val();
            var source = {};
            if (name != null && className != null) {
                for (var index in gdo.net.instance[instanceId].template.Sources.$values) {
                    if (!gdo.net.instance[instanceId].template.Sources.$values.hasOwnProperty((index))) {
                        continue;
                    } else if (gdo.net.instance[instanceId].template.Sources.$values[index] != null) {
                        if (gdo.net.instance[instanceId].template.Sources.$values[index].ClassName == className) {
                            source.properties = clone(gdo.net.instance[instanceId].template.Sources.$values[index]);
                            gdo.net.app["Maps"].index["source"]++;
                            source.properties.Id = gdo.net.app["Maps"].index["source"];
                            source.properties.Name = name;
                            source.isInitialized = false;
                        }
                    }
                }
                gdo.net.instance[instanceId].sources[source.properties.Id] = source;
                gdo.net.app["Maps"].selected["source"] = source.properties.Id;
                gdo.net.app["Maps"].drawListTable(instanceId, "source");
            }
        });

    $("iframe").contents().find(".source-remove-button")
        .unbind()
        .click(function () {

        });

    $("iframe").contents().find(".source-save-button")
        .unbind()
        .click(function () {

        });

    $("iframe").contents().find("#style-create-button")
        .unbind()
        .click(function () {
            var name = $("iframe").contents().find("#style_name_input").val();
            var className = $("iframe").contents().find("#style_types").val();
            var style = {};
            if (name != null && className != null) {
                for (var index in gdo.net.instance[instanceId].template.Styles.$values) {
                    if (!gdo.net.instance[instanceId].template.Styles.$values.hasOwnProperty((index))) {
                        continue;
                    } else if (gdo.net.instance[instanceId].template.Styles.$values[index] != null) {
                        if (gdo.net.instance[instanceId].template.Styles.$values[index].ClassName == className) {
                            style.properties = clone(gdo.net.instance[instanceId].template.Styles.$values[index]);
                            gdo.net.app["Maps"].index["style"]++;
                            style.properties.Id = gdo.net.app["Maps"].index["style"];
                            style.properties.Name = name;
                            style.isInitialized = false;
                        }
                    }
                }
                gdo.net.instance[instanceId].styles[style.properties.Id] = style;
                gdo.net.app["Maps"].selected["style"] = style.properties.Id;
                gdo.net.app["Maps"].drawListTable(instanceId, "style");
            }
        });

    $("iframe").contents().find(".style-remove-button")
        .unbind()
        .click(function () {

        });

    $("iframe").contents().find(".style-save-button")
        .unbind()
        .click(function () {

        });
    $("iframe").contents().find("#format-create-button")
       .unbind()
       .click(function () {
           var name = $("iframe").contents().find("#format_name_input").val();
           var className = $("iframe").contents().find("#format_types").val();
           var format = {};
           if (name != null && className != null) {
               for (var index in gdo.net.instance[instanceId].template.Formats.$values) {
                   if (!gdo.net.instance[instanceId].template.Formats.$values.hasOwnProperty((index))) {
                       continue;
                   } else if (gdo.net.instance[instanceId].template.Formats.$values[index] != null) {
                       if (gdo.net.instance[instanceId].template.Formats.$values[index].ClassName == className) {
                           format.properties = clone(gdo.net.instance[instanceId].template.Formats.$values[index]);
                           gdo.net.app["Maps"].index["format"]++;
                           format.properties.Id = gdo.net.app["Maps"].index["format"];
                           format.properties.Name = name;
                           format.isInitialized = false;
                       }
                   }
               }
               gdo.net.instance[instanceId].formats[format.properties.Id] = format;
               gdo.net.app["Maps"].selected["format"] = format.properties.Id;
               gdo.net.app["Maps"].drawListTable(instanceId, "format");
           }
       });

    $("iframe").contents().find(".format-remove-button")
        .unbind()
        .click(function () {

        });

    $("iframe").contents().find(".format-save-button")
        .unbind()
        .click(function () {

        });
}