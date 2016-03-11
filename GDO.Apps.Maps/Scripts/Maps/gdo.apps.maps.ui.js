gdo.net.app["Maps"].selectedLayer = -1;
gdo.net.app["Maps"].selectedProperty = -1;
gdo.net.app["Maps"].HeaderHeight = 61;
gdo.net.app["Maps"].tableHeight = 500;
gdo.net.app["Maps"].StatusHeight = 49;
gdo.net.app["Maps"].selected = [];
gdo.net.app["Maps"].selected["layer"] = -1;
gdo.net.app["Maps"].selected["source"] = -1;
gdo.net.app["Maps"].selected["style"] = -1;


gdo.net.app["Maps"].drawEmptyListTable = function (tab) {
    $("iframe").contents().find("." + tab + "")
    .empty();
}

gdo.net.app["Maps"].drawListTable = function (instanceId, tab) {
    gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Drawing ' + tab + ' Table');

    gdo.net.app["Maps"].drawEmptyListTable(tab);

    var j = 1;

    var arr = [];

    switch (tab) {
        case "layer":
            arr = gdo.net.instance[instanceId].layers;
        default:
    }

    for (var i in arr) {
        if (arr.hasOwnProperty(i) && arr[i] != null && typeof arr[i] != "undefined") {
            gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Drawing ' + tab + ' ' + i);

            $("iframe").contents().find("." + tab + "").append("<div class='" + tab + "_" + i + " row' " + tab + "='" + i + "'></div>");

            var color = "white";
            var icon = "";

            if (tab == "layer") {
                if (arr[i].getVisible()) {
                    icon = "fa-eye";
                    color = "white";
                } else {
                    icon = "fa-eye-slash";
                    color = "gray";
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

            if (gdo.net.app["Maps"].selected[tab] == i) {
                color = "#4CBFF8";
            }

            $("iframe").contents().find("." + tab + "_" + i)
                .css("align", "top")
                .css("width", "100%")
                .append("<div class='" + tab + "_" + i + "_content table'  " + tab + "='" + i + "' style='color:" + color + "'>" +
                        "<div class='" + tab + "_" + i + "_id col-md-2'  " + tab + "='" + i + "'> &nbsp;&nbsp;" + arr[i].id + "</div>" +
                        "<div class='" + tab + "_" + i + "_name col-md-8'  " + tab + "='" + i + "'> " + arr[i].name + "</div>" +
                        "<div class='" + tab + "_" + i + "_icon col-md-1'  " + tab + "='" + i + "'><i class='fa " + icon + "'></i></div>" +
                    "</div>");
            $("iframe").contents().find("." + tab + "_" + i + "_content").unbind().click(function () {
                gdo.net.app["Maps"].selected[tab] = $(this).attr(tab);
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

        switch (tab) {
            case "layer":
                arr = gdo.net.instance[instanceId].layers;
            default:
        }

        if (id >= 0) {
            for (var key in arr[id].properties) {
                if (arr[id].properties.hasOwnProperty(key) && key != "$type") {
                    gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Drawing Property ' + key + ' for ' + tab + ' ' + id);


                    $("iframe").contents().find("#" + tab + "_properties").append("<div id='" + tab + "_" + id + "_property_" + key + "' class='row' " + tab + "='" + id + "' property='" + key + "' style='width: 98%;height: 100%;'></div>");

                    $("iframe").contents().find("#" + tab + "_" + id + "_property_").append(
                        "<div id='" + tab + "_" + id + "_property_" + key + "_key' class='col-md-5' >&nbsp;&nbsp;" + key + "</div>" +
                        "<div id='" + tab + "_" + id + "_property_" + key + "_value' class='col-md-7' style='color:gray' >" + arr[id].properties[key] + "</div>");



                    if (Object.prototype.toString.call(arr[id].properties[key]) === '[object Array]') {
                        $("iframe").contents().find("#" + tab + "_" + id + "_property_" + key).append(
                        "<div id='" + tab + "_" + id + "_property_" + key + "_key' class='col-md-5' >&nbsp;&nbsp;" + key + "</div>" +
                        "<div id='" + tab + "_" + id + "_property_" + key + "_value' class='col-md-7' style='color:gray'>" + arr[id].properties[key] + "</div>");

                    } else {
                        if (contains(arr[id].properties["Editables"].$values, key)) {
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

    $("iframe").contents().find(".layer-add-button")
        .unbind()
        .click(function () {

        });

    $("iframe").contents().find(".layer-remove-button")
        .unbind()
        .click(function () {

        });

    $("iframe").contents().find(".layer-save-button")
        .unbind()
        .click(function () {

        });

    $("iframe").contents().find(".source-add-button")
        .unbind()
        .click(function () {

        });

    $("iframe").contents().find(".source-remove-button")
        .unbind()
        .click(function () {

        });

    $("iframe").contents().find(".source-save-button")
        .unbind()
        .click(function () {

        });

    $("iframe").contents().find(".style-add-button")
        .unbind()
        .click(function () {

        });

    $("iframe").contents().find(".style-remove-button")
        .unbind()
        .click(function () {

        });

    $("iframe").contents().find(".style-save-button")
        .unbind()
        .click(function () {

        });

}