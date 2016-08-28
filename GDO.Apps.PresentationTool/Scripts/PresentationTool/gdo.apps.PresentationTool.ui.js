﻿$(function () {
    gdo.net.app["PresentationTool"].table_font_size = 10;
    gdo.net.app["PresentationTool"].section_font_size = 11;
    gdo.net.app["PresentationTool"].button_font_size = 21;
    gdo.net.app["PresentationTool"].header_font_size = 17;
    gdo.net.app["PresentationTool"].table_height = 210;
    gdo.net.app["PresentationTool"].info_height = 35;
    gdo.net.app["PresentationTool"].table_width = 100;
    gdo.net.app["PresentationTool"].button_height = 61;
    gdo.net.app["PresentationTool"].button_cols = 9.5;
    gdo.net.app["PresentationTool"].header_cols = 11;
    gdo.net.app["PresentationTool"].cell_padding = 4;

    gdo.net.app["PresentationTool"].currentSlide = 0;
    gdo.net.app["PresentationTool"].totalSlide = 0;
    gdo.net.app["PresentationTool"].template = 0;
    gdo.net.app["PresentationTool"].numOfPPTs = 0;
    gdo.net.app["PresentationTool"].numOfImgs = 0;
    gdo.net.app["PresentationTool"].allFiles = [];
    gdo.net.app["PresentationTool"].appName = null;
    gdo.net.app["PresentationTool"].img_control_status = 0;
    gdo.net.app["PresentationTool"].img_control_enable = 0;
    gdo.net.app["PresentationTool"].video_control_status = 0;
    gdo.net.app["PresentationTool"].video_control_enable = 0;
    gdo.net.app["PresentationTool"].processedImages = [];
});
//template list click
$("iframe").contents().find('#template_list').on('click', 'li', function () {
    gdo.net.app["PresentationTool"].template = $(this).index() + 1;
})

// keywords submit click 
$("iframe").contents().find('#update_url_submit').on('click', function () {
    gdo.net.app["PresentationTool"].selectedResource = $("iframe").contents().find('#new_url').val();
    gdo.net.app["PresentationTool"].appName = "Youtube";
    gdo.updateDisplayCanvas();
}).on('blur', function (e) {
    if ($(e.relatedTarget).attr('id') == 'deploy-app-button')
        return;
    gdo.net.app["PresentationTool"].selectedResource = null;
    gdo.updateDisplayCanvas();
});

//file ppt list click
$("iframe").contents().find('#item_ppts').on('click', 'li', function () {
    gdo.net.app["PresentationTool"].selectedResource = "/PPTs/" + $(this).text();
    gdo.net.app["PresentationTool"].appName = "Images";
    $("iframe").contents().find('#img_preview')
        .empty()
        .append("<img style= 'height: 100%; width: 100%' src='Files/" + gdo.net.app["PresentationTool"].selectedResource + "'/>");
    gdo.updateDisplayCanvas();
}).on('blur', function (e) {
    if ($(e.relatedTarget).attr('id') == 'deploy-app-button')
        return;
    gdo.net.app["PresentationTool"].selectedResource = null;
    gdo.updateDisplayCanvas();
});

//file image list click
$("iframe").contents().find('#item_images').on('click', 'li', function () {
    gdo.net.app["PresentationTool"].selectedResource = "/Images/" + $(this).text();
    gdo.net.app["PresentationTool"].appName = "Images";
    $("iframe").contents().find('#img_preview')
        .empty()
        .append("<img style= 'height: 100%; width: 100%' src='Files/" + gdo.net.app["PresentationTool"].selectedResource + "'/>");
    gdo.updateDisplayCanvas();
}).on('blur', function (e) {
    if ($(e.relatedTarget).attr('id') == 'deploy-app-button')
        return;
    gdo.net.app["PresentationTool"].selectedResource = null;
    gdo.updateDisplayCanvas();
});

gdo.updateDisplayCanvas = function () {
    gdo.net.app["PresentationTool"].drawSectionTable();
    gdo.net.app["PresentationTool"].drawButtonTable();
}

gdo.net.app["PresentationTool"].initialize = function (num) {

    gdo.net.app["PresentationTool"].isRectangle = true;
    gdo.net.app["PresentationTool"].isStarted = false;
    gdo.net.app["PresentationTool"].colStart = 1000;
    gdo.net.app["PresentationTool"].colEnd = -1;
    gdo.net.app["PresentationTool"].rowStart = 1000;
    gdo.net.app["PresentationTool"].rowEnd = -1;
    gdo.net.app["PresentationTool"].selectedSection = -1;
    gdo.net.app["PresentationTool"].selectedResource = null;

    gdo.net.app["PresentationTool"].node = new Array(num);
    gdo.net.app["PresentationTool"].section = new Array(num + 1);

    for (var i = 1; i <= gdo.net.cols * gdo.net.rows; i++) {
        var parentNode = gdo.net.node[i];
        gdo.net.app["PresentationTool"].node[i] = {};
        var node = gdo.net.app["PresentationTool"].node[i];
        node.id = parentNode.id;
        node.row = parentNode.row;
        node.col = parentNode.col;
        node.isSelected = false;
        node.sectionId = 0;
        node.sectionRow = 0;
        node.sectionCol = 0;
        node.isValid = true;
    }

    for (var i = 0; i <= num; i++) {
        gdo.net.app["PresentationTool"].section[i] = {};
        gdo.net.app["PresentationTool"].section[i].id = i;
        gdo.net.app["PresentationTool"].section[i].isSelected = false;
        gdo.net.app["PresentationTool"].section[i].exists = true;
        gdo.net.app["PresentationTool"].section[i].src = null;
        gdo.net.app["PresentationTool"].section[i].appName = null;
        gdo.net.app["PresentationTool"].section[i].appInstanceId = -1;
        gdo.net.app["PresentationTool"].section[i].realInstanceId = -1;
        gdo.net.app["PresentationTool"].section[i].realSectionId = -1;
    }
}

gdo.net.app["PresentationTool"].drawEmptySectionTable = function (maxCol, maxRow) {
    /// <summary>
    /// Draws the section table.
    /// </summary>
    /// <param name="maxRow">The maximum row.</param>
    /// <param name="maxCol">The maximum col.</param>
    /// <returns></returns>gdo.net.app["PresentationTool"]
    $("iframe").contents().find("#section_table").empty();
    for (var i = 0; i < maxRow; i++) {
        $("iframe").contents().find("#section_table").append("<tr id='section_table_row_" + i + "' row='" + i + "'></tr>");
        for (var j = 0; j < maxCol; j++) {
            $("iframe").contents().find("#section_table tr:last").append("<td id='section_table_row_" + i + "_col_" + j + "' col='" + j + "' row='" + i + "'></td>").css('overflow', 'hidden');
        }
    }
}




gdo.net.app["PresentationTool"].selectNodes = function () {
    gdo.net.app["PresentationTool"].isRectangle = true;
    gdo.net.app["PresentationTool"].isStarted = false;
    gdo.net.app["PresentationTool"].colStart = 1000;
    gdo.net.app["PresentationTool"].colEnd = -1;
    gdo.net.app["PresentationTool"].rowStart = 1000;
    gdo.net.app["PresentationTool"].rowEnd = -1;
    for (var i = 1; i <= gdo.net.cols * gdo.net.rows; i++) {
        var node = gdo.net.app["PresentationTool"].node[i];
        if (node.isSelected) {
            gdo.net.app["PresentationTool"].isStarted = true;
            if (node.col <= gdo.net.app["PresentationTool"].colStart) {
                gdo.net.app["PresentationTool"].colStart = node.col;
            }
            if (node.row <= gdo.net.app["PresentationTool"].rowStart) {
                gdo.net.app["PresentationTool"].rowStart = node.row;
            }
            if (node.col >= gdo.net.app["PresentationTool"].colEnd) {
                gdo.net.app["PresentationTool"].colEnd = node.col;
            }
            if (node.row >= gdo.net.app["PresentationTool"].rowEnd) {
                gdo.net.app["PresentationTool"].rowEnd = node.row;
            }
        }
    }
    for (var i = gdo.net.app["PresentationTool"].colStart; i <= gdo.net.app["PresentationTool"].colEnd; i++) {
        for (var j = gdo.net.app["PresentationTool"].rowStart; j <= gdo.net.app["PresentationTool"].rowEnd; j++) {
            var node = gdo.net.app["PresentationTool"].node[gdo.net.getNodeId(i, j)];
            if (!node.isSelected) {
                gdo.net.app["PresentationTool"].isRectangle = false;
            }
        }
    }
}

gdo.net.app["PresentationTool"].drawButtonTable = function () {
    /// <summary>
    /// Draws the button table.
    /// </summary>
    /// <returns></returns>

    //Create Section

    $("iframe").contents().find(".create_section_button_div")
        .empty()
        .append("<button type='button' id='create_section_button' class='btn btn-default disabled btn-lg btn-block'><i class='fa  fa-plus-circle fa-fw'></i>&nbsp;Create Section</button>")
        .css("height", "100%")
        .css("width", (gdo.net.app["PresentationTool"].table_width / gdo.net.app["PresentationTool"].button_cols) + "%")
        .css('padding', 1)
        .attr("align", "center");

    gdo.net.app["PresentationTool"].selectNodes();
    $("iframe").contents().find(".create_section_button_div").unbind();
    $("iframe").contents().find(".create_section_button_div").click(function () {
        if (gdo.net.app["PresentationTool"].isRectangle && gdo.net.app["PresentationTool"].isStarted) {
            gdo.net.app["PresentationTool"].server.createSection(gdo.controlId, gdo.net.app["PresentationTool"].colStart, gdo.net.app["PresentationTool"].rowStart, gdo.net.app["PresentationTool"].colEnd, gdo.net.app["PresentationTool"].rowEnd);
            for (var i = gdo.net.app["PresentationTool"].colStart; i <= gdo.net.app["PresentationTool"].colEnd; i++) {
                for (var j = gdo.net.app["PresentationTool"].rowStart; j <= gdo.net.app["PresentationTool"].rowEnd; j++) {
                    var node = gdo.net.app["PresentationTool"].node[gdo.net.getNodeId(i, j)];
                    node.isSelected = false;
                }
            }
            gdo.consoleOut('.PresentationTool', 1, 'Requested Creation of Section at (' + gdo.net.app["PresentationTool"].colStart + ',' + gdo.net.app["PresentationTool"].rowStart + '),(' + gdo.net.app["PresentationTool"].colEnd + ',' + gdo.net.app["PresentationTool"].rowEnd + ')');
        } else {

        }
    });

    if (gdo.net.app["PresentationTool"].isStarted) {
        if (gdo.net.app["PresentationTool"].isRectangle) {
            $("iframe").contents().find("#create_section_button")
                .removeClass("disabled")
                .removeClass("btn-default")
                .addClass("btn-success");
        } else {
            $("iframe").contents().find("#create_section_button")
                .removeClass("btn-default")
                .addClass("btn-danger");
        }
    } else {
        $("iframe").contents().find("#create_section_button")
            .addClass("disabled")
            .addClass("btn-default")
            .removeClass("btn-danger")
            .removeClass("btn-success");
    }

    //Enter Section Coordinates

    $("iframe").contents().find(".select_section_div")
        .empty()
        .append("<div id='button_Enter_coordinates'> " +
            "<table id='section_coordinate_table' style='width: 99%;' >" +
            "<tr>" +
            "<td id='section_coordinate_table_start'' style='width:49%'><input type='text' id='section_coordinate_table_start_input' pattern='[1-9]{10}' style='background:#222; width: 100%;height: 100%;' maxlength='2'/></input></td>" +
            "<td id='section_coordinate_table_end' style='width:49%'><input type='text' id='section_coordinate_table_end_input' pattern='[1-9]{10}' style='background:#222; width: 100%;height: 100%;' maxlength='2' /></input></td>" +
            "<td id='section_coordinate_table_select' style='width:35%;'></td>" +
            "</tr>" +
            "</table>")
        .css("width", 1.5 * (gdo.net.app["PresentationTool"].table_width / gdo.net.app["PresentationTool"].button_cols) + "%")
        .css("color", "#FFF")
        .css('padding', 0)
        .attr("align", "center")
        .css({ fontSize: gdo.net.app["PresentationTool"].button_font_size });

    $("iframe").contents().find("#section_coordinate_table_start_input")
        .css("height", "100%")
        .css("width", "98%")
        .css("border", "0px solid #333")
        .css("background", "#333")
        .css("color", "#FFF")
        .css('padding', 0)
        .css('margin-top', 1)
        .css('padding-bottom', 1)
        .css('text-align', 'center')
        .attr("align", "center")
        .attr("onfocus", "this.value=''")
        .attr("value", gdo.net.getNodeId(gdo.net.app["PresentationTool"].colStart, gdo.net.app["PresentationTool"].rowEnd))
        .css({ fontSize: gdo.net.app["PresentationTool"].button_font_size * 1.4 });

    $("iframe").contents().find("#section_coordinate_table_end_input")
        .css("height", "100%")
        .css("width", "98%")
        .css("border", "0px solid #333")
        .css("background", "#333")
        .css("color", "#FFF")
        .css('padding', 0)
        .css('margin-top', 1)
        .css('padding-bottom', 1)
        .css('text-align', 'center')
        .attr("align", "center")
        .attr("onfocus", "this.value=''")
        .attr("value", gdo.net.getNodeId(gdo.net.app["PresentationTool"].colEnd, gdo.net.app["PresentationTool"].rowStart))
        .css({ fontSize: gdo.net.app["PresentationTool"].button_font_size * 1.4 });

    $("iframe").contents().find("#section_coordinate_table_select")
        .empty()
        .append("<button type='button' class='select_button btn btn-default disabled btn-lg btn-block'><i class='fa  fa-expand fa-fw'></i>&nbsp;Select</button>")
        .css("height", "100%")
        .css("width", "100%")
        .css("color", "#FFF")
        .css('padding-top', 1)
        .attr("align", "center");
    $("iframe").contents().find(".select_button").unbind();

    $("iframe").contents().find(".select_button").click(function () {
        var nodeStart = parseInt($("iframe").contents().find('#section_coordinate_table_start_input').val());
        var nodeEnd = parseInt($("iframe").contents().find('#section_coordinate_table_end_input').val());
        if (nodeEnd >= nodeStart && nodeStart <= gdo.net.cols * gdo.net.rows && nodeEnd <= gdo.net.cols * gdo.net.rows && nodeStart > 0 && nodeEnd > 0) {
            for (var i = 1; i <= gdo.net.cols * gdo.net.rows; i++) {
                gdo.net.app["PresentationTool"].node[i].isSelected = false;
            }
            gdo.net.app["PresentationTool"].selectedSection = -1;
            for (var i = gdo.net.app["PresentationTool"].node[nodeStart].col; i <= gdo.net.app["PresentationTool"].node[nodeEnd].col; i++) {
                for (var j = gdo.net.app["PresentationTool"].node[nodeEnd].row; j <= gdo.net.app["PresentationTool"].node[nodeStart].row; j++) {
                    gdo.net.app["PresentationTool"].node[gdo.net.getNodeId(i, j)].isSelected = true;
                }
            }
            gdo.net.app["PresentationTool"].selectNodes();
            gdo.updateDisplayCanvas();
        }
    });
    var nodeStart = parseInt($("iframe").contents().find('#section_coordinate_table_start_input').val());
    var nodeEnd = parseInt($("iframe").contents().find('#section_coordinate_table_end_input').val());

    if (nodeEnd >= nodeStart && nodeStart <= gdo.net.cols * gdo.net.rows && nodeEnd <= gdo.net.cols * gdo.net.rows && nodeStart > 0 && nodeEnd > 0) {
        $("iframe").contents().find(".select_button")
            .removeClass("disabled")
            .removeClass("btn-default")
            .addClass("btn-primary");
    } else {
        $("iframe").contents().find(".select_button")
            .addClass("disabled")
            .addClass("btn-default")
            .removeClass("btn-primary");
    }



    //Close Section

    $("iframe").contents().find(".close_section_button_div")
        .empty()
        .append("<button type='button' class='close_section_button btn btn-default disabled btn-lg btn-block'><i class='fa  fa-times-circle fa-fw'></i>&nbsp;Close Section</button>")
        .css("height", "100%")
        .css("width", (gdo.net.app["PresentationTool"].table_width / gdo.net.app["PresentationTool"].button_cols) + "%")
        .css('padding', 1)
        .attr("align", "center")
        .unbind()
        .click(function () {
            if (gdo.net.app["PresentationTool"].selectedSection > -1) {
                if (gdo.net.app["PresentationTool"].section[gdo.net.app["PresentationTool"].selectedSection].src === null) {
                    gdo.net.app["PresentationTool"].server.closeSection(gdo.controlId, gdo.net.app["PresentationTool"].selectedSection);
                    gdo.consoleOut('.PresentationTool', 1, 'Requested Disposal of Section ' + gdo.net.app["PresentationTool"].selectedSection);
                    gdo.net.app["PresentationTool"].selectedSection = -1;
                }
            }
        });
    if (gdo.net.app["PresentationTool"].selectedSection > -1) {
        if (gdo.net.app["PresentationTool"].section[gdo.net.app["PresentationTool"].selectedSection].appInstanceId == -1) {
            $("iframe").contents().find(".close_section_button")
                .removeClass("disabled")
                .removeClass("btn-default")
                .addClass("btn-warning");
        }
    } else {
        $("iframe").contents().find(".close_section_button")
            .addClass("disabled")
            .addClass("btn-default")
            .removeClass("btn-warning");
    }

    $(function () {
        $("iframe").contents().find('.list-group-item').on('click', function () {
            $('.fa', this)
              .toggleClass('fa-chevron-right')
              .toggleClass('fa-chevron-down');
        });
    });

    //Deploy Image
    $("iframe").contents().find(".deploy_app_button_div")
        .empty()
        .append("<button id='deploy-app-button' type='button' class='deploy_app_button btn btn-default disabled btn-lg btn-block deploy_app_button'><i class='fa  fa-cloud-upload fa-fw'></i>&nbsp;Deploy App</button>")
        .css("height", "100%")
        .css("width", (gdo.net.app["PresentationTool"].table_width / gdo.net.app["PresentationTool"].button_cols) + "%")
        .css('padding', 1)
        .attr("align", "center");
    $("iframe").contents().find(".deploy_app_button")
        .unbind()
        .click(function () {
            if (gdo.net.app["PresentationTool"].section[gdo.net.app["PresentationTool"].selectedSection] != null) {
                if (gdo.net.app["PresentationTool"].section[gdo.net.app["PresentationTool"].selectedSection].src === null && gdo.net.app["PresentationTool"].selectedResource !== null) {
                    gdo.net.app["PresentationTool"].server.deployResource(gdo.controlId, gdo.net.app["PresentationTool"].selectedSection, gdo.net.app["PresentationTool"].selectedResource, gdo.net.app["PresentationTool"].appName);
                    gdo.net.app["PresentationTool"].selectedResource = null;
                }
            }
        });
    if (gdo.net.app["PresentationTool"].selectedSection > -1) {
        if (gdo.net.app["PresentationTool"].selectedResource !== null && gdo.net.app["PresentationTool"].section[gdo.net.app["PresentationTool"].selectedSection].appInstanceId == -1) {
            $("iframe").contents().find(".deploy_app_button")
                .removeClass("disabled")
                .removeClass("btn-default")
                .removeClass("btn-danger")
                .addClass("btn-success");
        } else if (gdo.net.app["PresentationTool"].section[gdo.net.app["PresentationTool"].selectedSection].appInstanceId == -1) {
            $("iframe").contents().find(".deploy_app_button")
                .removeClass("btn-default")
                .removeClass("btn-success")
                .addClass("btn-danger")
                .addClass("disabled");
        } else {
            $("iframe").contents().find(".deploy_app_button")
                .addClass("disabled")
                .addClass("btn-default")
                .removeClass("btn-success")
                .removeClass("btn-danger");
        }
    } else {
        $("iframe").contents().find(".deploy_app_button")
            .addClass("disabled")
            .addClass("btn-default")
            .removeClass("btn-success")
            .removeClass("btn-danger");
    }

    // close app
    $("iframe").contents().find(".close_app_button_div")
        .empty()
        .append("<button type='button' class='close_app_button btn btn-default disabled btn-lg btn-block'><i class='fa  fa-times-circle fa-fw'></i>&nbsp;Close App</button>")
        .css("height", "100%")
        .css("width", (gdo.net.app["PresentationTool"].table_width / gdo.net.app["PresentationTool"].button_cols) + "%")
        .css('padding', 1)
        .attr("align", "center")
        .unbind()
        .click(function () {
            if (gdo.net.app["PresentationTool"].selectedSection > -1) {
                if (gdo.net.app["PresentationTool"].section[gdo.net.app["PresentationTool"].selectedSection].src !== null) {
                    gdo.net.app["PresentationTool"].server.unDeployResource(gdo.controlId, gdo.net.app["PresentationTool"].selectedSection);
                    gdo.consoleOut('.PresentationTool', 1, 'Requested Disposal of App' + gdo.net.app["PresentationTool"].selectedSection);
                    gdo.net.app["PresentationTool"].selectedSection = -1;
                }
            }
        });
    if (gdo.net.app["PresentationTool"].selectedSection > -1) {
        if (gdo.net.app["PresentationTool"].section[gdo.net.app["PresentationTool"].selectedSection].src !== null && gdo.net.app["PresentationTool"].section[gdo.net.app["PresentationTool"].selectedSection].appInstanceId !== gdo.controlId) {
            $("iframe").contents().find(".close_app_button")
                .removeClass("disabled")
                .removeClass("btn-default")
                .removeClass("btn-danger")
                .addClass("btn-warning");
        } else {
            $("iframe").contents().find(".close_app_button")
                .addClass("disabled")
                .addClass("btn-default")
                .removeClass("btn-warning");
        }
    } else {
        $("iframe").contents().find(".close_app_button")
            .addClass("disabled")
            .addClass("btn-default")
            .removeClass("btn-warning");
    }

    $("iframe").contents().find(".clear_cave_button_div")
        .empty()
        .append("<button type='button'  class='clear_cave_button btn btn-danger btn-lg btn-block' data-toggle='modal' data-target='#confirm-clear'><i class='fa  fa-exclamation-circle  fa-fw'></i>&nbsp;Clear All</button>")
        .css("height", "100%")
        .css("width", (gdo.net.app["PresentationTool"].table_width / gdo.net.app["PresentationTool"].button_cols) + "%")
        .css('padding', 1)
        .attr("align", "center");
    $("iframe").contents().find(".clear_cave_button_div")
        .unbind()
        .click(function () {
            gdo.consoleOut('.PresentationTool', 1, 'Clearing All');
            gdo.net.app["PresentationTool"].currentSlide = 0;
            gdo.net.app["PresentationTool"].template = 0;
            gdo.net.app["PresentationTool"].appName = null;
            gdo.net.app["PresentationTool"].clearAllOtherApp();
        });

    //Image Control
    if (gdo.net.app["PresentationTool"].selectedSection !== -1 && gdo.net.app["PresentationTool"].section[gdo.net.app["PresentationTool"].selectedSection].appName === "Images") {
        gdo.net.app["PresentationTool"].img_control_enable = 1;
        gdo.net.app["PresentationTool"].img_control_status = 0;
        $("iframe").contents().find('#img_preview')
            .empty()
            .append("<img style= 'height: 100%; width: 100%' src='" + gdo.net.app["PresentationTool"].section[gdo.net.app["PresentationTool"].selectedSection].src + "'/>");
        $("iframe").contents().find("#img_control").removeClass("btn-primary").removeClass("btn-success").addClass("btn-primary");
    } else {
        gdo.net.app["PresentationTool"].img_control_enable = 0;
        if (gdo.net.app["PresentationTool"].selectedResource === null) {
            $("iframe").contents().find('#img_preview').empty();
        }
        $("iframe").contents().find("#img_control").removeClass("btn-primary").removeClass("btn-success").addClass("btn-primary");
    }


    $("iframe").contents().find("#img_rotate").unbind().click(function () {
        if (gdo.net.app["PresentationTool"].img_control_status === 1 && gdo.net.app["PresentationTool"].img_control_enable === 1) {
            var instanceId = gdo.net.app["PresentationTool"].section[gdo.net.app["PresentationTool"].selectedSection].appInstanceId;
            var realInstanceId = gdo.net.app["PresentationTool"].section[gdo.net.app["PresentationTool"].selectedSection].realInstanceId;
            if (instanceId !== null && instanceId > 0 && gdo.net.instance[instanceId].appName === "Images") {
                gdo.net.app["PresentationTool"].rotateImage(realInstanceId);
            }
        }
    });

    $("iframe").contents().find("#img_restore").unbind().click(function () {
        if (gdo.net.app["PresentationTool"].img_control_status === 1 && gdo.net.app["PresentationTool"].img_control_enable === 1) {
            var instanceId = gdo.net.app["PresentationTool"].section[gdo.net.app["PresentationTool"].selectedSection].appInstanceId;
            var realInstanceId = gdo.net.app["PresentationTool"].section[gdo.net.app["PresentationTool"].selectedSection].realInstanceId;
            $("iframe").contents().find("#img_control").click();
            $("iframe").contents().find("#img_control").click();
            gdo.net.app["PresentationTool"].playInstance(realInstanceId);
        }
    });
    
    // Video control
    if (gdo.net.app["PresentationTool"].selectedSection !== -1 && gdo.net.app["PresentationTool"].section[gdo.net.app["PresentationTool"].selectedSection].appName === "Youtube") {
        gdo.net.app["PresentationTool"].video_control_enable = 1;
        gdo.net.app["PresentationTool"].video_control_status = 0;
        $("iframe").contents().find("#video_control").removeClass("btn-primary").removeClass("btn-success").addClass("btn-primary");
    } else {
        gdo.net.app["PresentationTool"].video_control_enable = 0;
        $("iframe").contents().find("#video_control").removeClass("btn-primary").removeClass("btn-success").addClass("btn-primary");
    }
    $("iframe").contents().find("#video_control").unbind().click(function () {
        if (gdo.net.app["PresentationTool"].video_control_enable === 0) return;
        gdo.net.app["PresentationTool"].video_control_status = 1 - gdo.net.app["PresentationTool"].video_control_status;
        if (gdo.net.app["PresentationTool"].video_control_status === 0) {
            $(this).removeClass("btn-primary").removeClass("btn-success").addClass("btn-primary");
            $("#hidden_app_iframe").attr('src', '');
            return;
        }
        $(this).removeClass("btn-primary").removeClass("btn-success").addClass("btn-success");
        if (gdo.net.app["PresentationTool"].video_control_status === 1 && gdo.net.app["PresentationTool"].video_control_enable === 1) {
            var instanceId = gdo.net.app["PresentationTool"].section[gdo.net.app["PresentationTool"].selectedSection].appInstanceId;
            var realInstanceId = gdo.net.app["PresentationTool"].section[gdo.net.app["PresentationTool"].selectedSection].realInstanceId;
            gdo.net.app["PresentationTool"].playInstance(realInstanceId);
        }
    });

}

gdo.net.app["PresentationTool"].processSection = function (exists, id, serializedSection) {
    if (exists) {
        var section = JSON.parse(serializedSection);
        gdo.net.app["PresentationTool"].section[id].id = id;
        gdo.net.app["PresentationTool"].section[id].exists = true;
        gdo.net.app["PresentationTool"].section[id].col = section.Col;
        gdo.net.app["PresentationTool"].section[id].row = section.Row;
        gdo.net.app["PresentationTool"].section[id].cols = section.Cols;
        gdo.net.app["PresentationTool"].section[id].rows = section.Rows;
        gdo.net.app["PresentationTool"].section[id].width = section.Width;
        gdo.net.app["PresentationTool"].section[id].src = section.Src;
        gdo.net.app["PresentationTool"].section[id].appName = section.AppName;
        gdo.net.app["PresentationTool"].section[id].appInstanceId = section.AppInstanceId;
        gdo.net.app["PresentationTool"].section[id].realSectionId = section.RealSectionId;
        gdo.net.app["PresentationTool"].section[id].realInstanceId = section.RealInstanceId;

        for (var i = 0; i < section.Cols; i++) {
            for (var j = 0; j < section.Rows; j++) {
                gdo.net.app["PresentationTool"].node[gdo.net.getNodeId(section.Col + i, section.Row + j)].sectionId = id;
                gdo.net.app["PresentationTool"].node[gdo.net.getNodeId(section.Col + i, section.Row + j)].sectionCol = i;
                gdo.net.app["PresentationTool"].node[gdo.net.getNodeId(section.Col + i, section.Row + j)].sectionRow = j;
                gdo.consoleOut('.PresentationTool', 3, 'Updating Node : (id:' + gdo.net.getNodeId(section.Col + i, section.Row + j) + '),(col,row:' + (section.Col + i) + ',' + (section.Row + j) + ')');
            }
        }
    } else {
        gdo.net.app["PresentationTool"].section[id].id = id;
        gdo.net.app["PresentationTool"].section[id].exists = false;
        gdo.net.app["PresentationTool"].section[id].src = null;
        gdo.net.app["PresentationTool"].section[id].appName = null;
        gdo.net.app["PresentationTool"].section[id].appInstanceId = -1;
        gdo.net.app["PresentationTool"].section[id].realSectionId = -1;
        gdo.net.app["PresentationTool"].section[id].realInstanceId = -1;
        for (var i = 0; i < gdo.net.app["PresentationTool"].section[id].cols; i++) {
            for (var j = 0; j < gdo.net.app["PresentationTool"].section[id].rows; j++) {
                gdo.net.app["PresentationTool"].node[gdo.net.getNodeId(gdo.net.app["PresentationTool"].section[id].col + i, gdo.net.app["PresentationTool"].section[id].row + j)].sectionId = 0;
                gdo.consoleOut('.PresentationTool', 3, 'Updating Node : (id:' + gdo.net.getNodeId(gdo.net.app["PresentationTool"].section[id].col + i, gdo.net.app["PresentationTool"].section[id].row + j) + '),(col,row:' + gdo.net.app["PresentationTool"].section[id].col + i + ',' + gdo.net.app["PresentationTool"].section[id].row + j + ')');
            }
        }
    }
}