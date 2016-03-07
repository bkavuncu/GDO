gdo.net.app["Maps"].selectedLayer = -1;
gdo.net.app["Maps"].selectedProperty = -1;
gdo.net.app["Maps"].HeaderHeight = 61;
gdo.net.app["Maps"].tableHeight = 500;
gdo.net.app["Maps"].StatusHeight = 49;
gdo.net.app["Maps"].selected = [];
gdo.net.app["Maps"].selected["layer"] = null;
gdo.net.app["Maps"].selected["source"] = null;
gdo.net.app["Maps"].selected["style"] = null;


gdo.net.app["Maps"].drawEmptyListTable = function (tab) {
    $("iframe").contents().find("#" + tab + "")
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

            $("iframe").contents().find("#" + tab + "").append("<div id='" + tab + "_" + i + "' class='row' " + tab + "='" + i + "'></div>");

            $("iframe").contents().find("#" + tab + "_" + i)
                .css("align", "top")
                .css("width", "100%")
                .append("<div id='" + tab + "_" + i + "_content' class='table' " + tab + "='" + i + "'>" +
                        "<div id='" + tab + "_" + i + "_id' class='col-md-2' " + tab + "='" + i + "'> &nbsp;&nbsp;" + arr[i].id + "</div>" +
                        "<div id='" + tab + "_" + i + "_name' class='col-md-5' " + tab + "='" + i + "'> " + arr[i].name + "</div>" +
                    "</div>");
            j++;
        }
    }
    gdo.net.app["Maps"].drawEmptyPropertyTable();
}

gdo.net.app["Maps"].drawEmptyPropertyTable = function (tab) {
    $("iframe").contents().find("#" + tab + "_properties")
    .empty();
}

gdo.net.app["Maps"].drawPropertyTable = function (instanceId, tab, id) {
    gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Drawing Property Table for ' + tab + ' ' + id);
    if (id > 0) {
        gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Drawing Property Table for ' + tab + ' ' + id);

        gdo.net.app["Maps"].drawEmptyPropertyTable();

        //TODO change the name of the panel

        if (id >= 0) {
            for (var key in arr[id].properties) {
                if (arr[id].properties.hasOwnProperty(key) && key != "$type") {
                    gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Drawing Property ' + key + ' for "+tab+" ' + id);


                    $("iframe").contents().find("#" + tab + "_properties").append("<div id='" + tab + "_" + id + "_property_" + key + "' class='row' " + tab + "='" + id + "' property='" + key + "'></div>");

                    $("iframe").contents().find("#" + tab + "_" + id + "_property_").append(
                        "<div id='" + tab + "_" + id + "_property_" + key + "_key' class='col-md-5' ><b>" + key + "</b></div>" +
                        "<div id='" + tab + "_" + id + "_property_" + key + "_value' class='col-md-7' >" + arr[id].properties[key] + "</div>");



                    if (Object.prototype.toString.call(arr[id].properties[key]) === '[object Array]') {
                        $("iframe").contents().find("#" + tab + "_" + id + "_property_" + key).append(
                        "<div id='" + tab + "_" + id + "_property_" + key + "_key' class='col-md-5' ><b>" + key + "</b></div>" +
                        "<div id='" + tab + "_" + id + "_property_" + key + "_value' class='col-md-7' >" + arr[id].properties[key] + "</div>");

                    } else {
                        if (contains(arr[id].properties["Editables"].$values, key)) {

                            $("iframe").contents().find("#" + tab + "_" + id + "_property_" + key).append(
                                "<div id='" + tab + "_" + id + "_property_" + key + "_key' class='col-md-5' ><b>" + key + "</b></div>" +
                                "<div id='" + tab + "_" + id + "_property_" + key + "_value' class='col-md-7' >" +
                                    "<input type='text' id='" + tab + "_" + id + "_property_" + key + "_value_input'  style='width: 100%;height: 100%;' value=" + arr[id].properties[key] + "/></input></div>");
                            $("iframe").contents().find("#" + tab + "_" + id + "_property_" + key + "_value_input")
                                .attr("onfocus", "this.value=''")
                                .attr("value", arr[id].properties[key]);
                        } else {
                            $("iframe").contents().find("#" + tab + "_" + id + "_property_" + key).append(
                            "<div id='" + tab + "_" + id + "_property_" + key + "_key' class='col-md-5' ><b>" + key + "</b></div>" +
                            "<div id='" + tab + "_" + id + "_property_" + key + "_value' class='col-md-7' >" + arr[id].properties[key] + "</div>");
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
      .append("<input type='text'  class='form-control' id='map_input' value='Enter Location' spellcheck='false' style='width: 95%;height: 100%;' /></input>");
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