$(function () {
    gdo.consoleOut('.PresentationTool', 1, 'Loaded PresentationTool JS');
    $.connection.presentationToolAppHub.client.setMessage = function (message) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.consoleOut('.PresentationTool', 1, 'Message from server:' + message);
            $("iframe").contents().find("#message_from_server").html(message);
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            //do nothing
        }
    }

    $.connection.presentationToolAppHub.client.receiveAppUpdate = function (sections, currentSlide) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            for (var i = 0; i < sections.length; i++) {
                if (sections[i] != null) {
                    var section = JSON.parse(sections[i]);
                    $("iframe").contents().find("#current_slide").text("Slide: " + currentSlide);
                    gdo.net.app["PresentationTool"].currentSlide = currentSlide;
                    gdo.net.app["PresentationTool"].processSection(true, section.Id, sections[i]);
                }
            }
            gdo.updateDisplayCanvas();
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            //do nothing
        }
    }


    $.connection.presentationToolAppHub.client.receiveSectionUpdate = function (status, id, serializedSection) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.net.app["PresentationTool"].processSection(status, id, serializedSection);
            gdo.updateDisplayCanvas();
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            //do nothing
        }
    }

    $.connection.presentationToolAppHub.client.receiveFileNames = function (ppts, images) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.net.app["PresentationTool"].allFiles = [];
            $("iframe").contents().find("#item_ppts").empty();

            for (var i = 0; i < ppts.length; i++) {
                $("iframe").contents().find("#item_ppts")
                    .append("<li><a href='#' class='list-group-item'>" + ppts[i] + "</a></li>");
                gdo.net.app["PresentationTool"].allFiles.push("Files/PPTs/" + ppts[i]);
            }
            $("iframe").contents().find("#item_images").empty();

            for (var i = 0; i < images.length; i++) {
                $("iframe").contents().find("#item_images")
                    .append("<li><a href='#' class='list-group-item'>" + images[i] + "</a></li>");
                gdo.net.app["PresentationTool"].allFiles.push("Files/Images/" + images[i]);
            }
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            //do nothing
        }
    }

    $.connection.presentationToolAppHub.client.receiveSlideUpdate = function (currentSlide) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.net.app["PresentationTool"].initialize(64);
            gdo.net.app["PresentationTool"].server.requestAppUpdate(gdo.controlId, currentSlide);
            gdo.net.app["PresentationTool"].currentSlide = currentSlide;
            gdo.net.app["PresentationTool"].server.updateFileList(gdo.controlId);

        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            //do nothing
        }
    }

    $.connection.presentationToolAppHub.client.receiveSlideSave = function (serializedSlide) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            var blob = new Blob([serializedSlide], { type: "application/json" });
            var url = URL.createObjectURL(blob);
            $("iframe").contents().find("#slide_link").attr({ 'download': "slide.json", 'href': url });
            $("iframe").contents().find("#slide_link")[0].click();
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            //do nothing
        }
    }

    $.connection.presentationToolAppHub.client.receiveSlideOpen = function () {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.net.app["PresentationTool"].initialize(64);
            gdo.net.app["PresentationTool"].server.requestAppUpdate(gdo.controlId, 0);
            gdo.net.app["PresentationTool"].server.updateFileList(gdo.controlId);
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            //do nothing
        }
    }
});

gdo.net.app["PresentationTool"].initClient = function () {
    gdo.consoleOut('.PresentationTool', 1, 'Initializing PresentationTool App Client at Node ' + gdo.clientId);
}

gdo.net.app["PresentationTool"].initControl = function () {
    gdo.controlId = parseInt(getUrlVar("controlId"));
    gdo.consoleOut('.PresentationTool', 1, 'Initializing PresentationTool App Control at Instance ' + gdo.controlId);
    // load script
    gdo.loadScript('ui', 'PresentationTool', gdo.SCRIPT_TYPE.APP);
    // draw ui
    gdo.net.app["PresentationTool"].initialize(64);
    gdo.net.app["PresentationTool"].drawSectionTable();
    gdo.net.app["PresentationTool"].drawButtonTable();
    gdo.net.app["PresentationTool"].server.requestAppUpdate(gdo.controlId, 0);
    gdo.net.app["PresentationTool"].server.updateFileList(gdo.controlId);
}


gdo.net.app["PresentationTool"].terminateClient = function () {
    gdo.consoleOut('.PresentationTool', 1, 'Terminating PresentationTool App Client at Node ' + clientId);
}

gdo.net.app["PresentationTool"].ternminateControl = function () {
    gdo.consoleOut('.PresentationTool', 1, 'Terminating PresentationTool App Control at Instance ' + gdo.controlId);
}

gdo.net.app["PresentationTool"].previousSlide = function () {
    gdo.consoleOut('.PresentationTool', 1, 'Previous slide');
    gdo.net.app["PresentationTool"].server.requestPreviousSlide(gdo.controlId);
}

gdo.net.app["PresentationTool"].nextSlide = function () {
    gdo.consoleOut('.PresentationTool', 1, 'Next slide');
    gdo.net.app["PresentationTool"].server.requestNextSlide(gdo.controlId);
}

gdo.net.app["PresentationTool"].createNewSlide = function () {
    gdo.consoleOut('.PresentationTool', 1, 'Create a new slide');
    gdo.net.app["PresentationTool"].server.requestCreateNewSlide(gdo.controlId);
}

gdo.net.app["PresentationTool"].deleteCurrentSlide = function () {
    gdo.consoleOut('.PresentationTool', 1, 'Create a new slide');
    gdo.net.app["PresentationTool"].server.requestDeleteCurrentSlide(gdo.controlId);
}

gdo.net.app["PresentationTool"].saveSlideFile = function () {
    gdo.consoleOut('.PresentationTool', 1, 'Save slides');
    gdo.net.app["PresentationTool"].server.requestSlideSave(gdo.controlId);
}

gdo.net.app["PresentationTool"].openSlideFile = function (filename) {
    gdo.consoleOut('.PresentationTool', 1, 'Open Slides');
    gdo.net.app["PresentationTool"].server.requestSlideOpen(gdo.controlId, filename);
}

gdo.net.app["PresentationTool"].loadTemplate = function () {
    gdo.consoleOut('.PresentationTool', 1, 'Load template ' + gdo.net.app["PresentationTool"].template);
    gdo.net.app["PresentationTool"].server.clearCave(gdo.controlId);
    var length = gdo.net.app["PresentationTool"].allFiles.length;
    switch (gdo.net.app["PresentationTool"].template) {
        case 1:
            var slides = length / 4 + 1;
            var count = 0;
            for (var i = 0; i < slides; i++) {
                for (var j = 0; j < 5; j++) {
                    if (count === length) break;
                    gdo.net.app["PresentationTool"].server.createSection(gdo.controlId, j * 3, 0, j * 3 + 2, 3);
                    gdo.net.app["PresentationTool"].server.deployResource(gdo.controlId, j + 1, gdo.net.app["PresentationTool"].allFiles[count], "Images");
                    count++;
                }
                if (count == length) break;
                gdo.net.app["PresentationTool"].server.requestCreateNewSlide(gdo.controlId);
            }
            break;
        case 2:
            var slides = (length / 16) + 1;
            var count = 0;
            for (var i = 0; i < slides; i++) {
                for (var j = 0; j < 15; j++) {
                    if (count === length) break;
                    var m = (j % 2 == 0) ? j : j - 1;
                    var n = (j % 2 == 0) ? 0 : 2;
                    gdo.net.app["PresentationTool"].server.createSection(gdo.controlId, m, n, m + 1, n + 1);
                    gdo.net.app["PresentationTool"].server.deployResource(gdo.controlId, j + 1, gdo.net.app["PresentationTool"].allFiles[count], "Images");
                    count++;
                }
                if (count == length) break;
                gdo.net.app["PresentationTool"].server.requestCreateNewSlide(gdo.controlId);
            }
            break;

    }
}

gdo.net.app["PresentationTool"].playCurrentSlide = function (i) {

    var numOfSections = gdo.net.app["PresentationTool"].section.length;

    if (i == numOfSections) {
        $("iframe").contents().find("#hidden_app_control").css({ "display": "none", "visibility": "hidden" });
        $("iframe").contents().find("body").css({ "overflow": "auto", "heigth": "100%" });
        return;
    };

    var section = gdo.net.app["PresentationTool"].section[i];
    if (section != null && section.src !== null) {

            var appPage = window.location.origin + "/Web/Instances.cshtml?id=" + (section.appInstanceId + 1);
            $("iframe").contents().find("body").css({ "overflow": "hidden", "heigth": "1080px" });
            $("iframe").contents().find("#hidden_app_control").css({ "display": "block", "visibility": "hidden" });
            $("iframe").contents().find("#hidden_app_iframe").unbind().attr('src', appPage);

            $("iframe").contents().find("#hidden_app_iframe").on('load', function () {
                $(this).contents().find("iframe").on('load', function () {
                    if (section.appName === "Images") {
                        $(this).contents().find("#thumbnail_control > img").on('load', function () {
                            setTimeout(function () {
                                $("iframe").contents().find("#hidden_app_iframe").contents().find("iframe").contents().find("#active_control").click();
                                $("iframe").contents().find("#hidden_app_iframe").contents().find("iframe").contents().find("#fill_mode").click();
                                $("iframe").contents().find("#message_from_server").html("Play Image on instance " + section.appInstanceId + 1);
                            }, 1000);
                            setTimeout(function () {
                                i++;
                                gdo.net.app["PresentationTool"].playCurrentSlide(i);
                            }, 1500);
                        });
                    } else if (section.appName === "YoutubeWall") {
                        setTimeout(function () {
                            $("iframe").contents().find("#hidden_app_iframe").contents().find("iframe").contents().find("#search_mode").click();
                        }, 1000);
                        setTimeout(function () {
                            $("iframe").contents().find("#hidden_app_iframe").contents().find("iframe").contents().find("#new_keyword").val(section.src);
                        }, 1000);
                        setTimeout(function () {
                            $("iframe").contents().find("#hidden_app_iframe").contents().find("iframe").contents().find("#update_keyword_submit").click();
                        }, 1000);


                        //gdo.net.app["PresentationTool"].excuteElement('gdo.net.app.YoutubeWall.server', 'setKeywords', [section.appInstanceId + 1, '"' + section.src + '"']);

                        $("iframe").contents().find("#message_from_server").html("Play Video on instance " + section.appInstanceId + 1);
                        setTimeout(function () {
                            i++;
                            gdo.net.app["PresentationTool"].playCurrentSlide(i);
                        }, 1500);
                    }
                });
            });
        
    } else {
        i++;
        gdo.net.app["PresentationTool"].playCurrentSlide(i);
    }

}

gdo.net.app["PresentationTool"].loadCurrentSlide = function () {
    gdo.consoleOut('.PresentationTool', 1, 'Load current slide ' + gdo.net.app["PresentationTool"].currentSlide);
    $("iframe").contents().find("#message_from_server").html('Load current slide ' + gdo.net.app["PresentationTool"].currentSlide);
    // undeploy apps
    var length = gdo.net.section.length;
    for (var i = 1; i < length; i++) {
        var section = gdo.net.section[i];
        if (section != null && section.appInstanceId >= 0 && section.appInstanceId !== gdo.controlId) {
            gdo.net.app["PresentationTool"].excuteElement('gdo.net.server', 'closeApp', [section.appInstanceId]);
            gdo.consoleOut('.PresentationTool', 1, 'Undeploy app with instance id' + section.appInstanceId);
        }
        if (section != null && section.id > 0 && section.appInstanceId !== gdo.controlId) {
            gdo.net.app["PresentationTool"].excuteElement('gdo.net.server', 'closeSection', [section.id]);
        }
    }

    // deploy app on sections
    var numOfSections = gdo.net.app["PresentationTool"].section.length;
    for (var i = 1; i < numOfSections; i++) {
        var section = gdo.net.app["PresentationTool"].section[i];
        if (section.appName === "YoutubeWall") {
            gdo.net.app["PresentationTool"].deployApp(section, "Imperial");
        } else if (section.appName === "YoutubeWall") {
            gdo.net.app["PresentationTool"].deployApp(section, "Default");
        }

    }
}

gdo.net.app["PresentationTool"].deployApp = function (section, config) {
    if (section != null && section.id > 0 && section.src != null) {
        // section start from 2
        gdo.net.app["PresentationTool"].excuteElement('gdo.net.server', 'createSection', [section.col, section.row, section.col + section.cols - 1, section.row + section.rows - 1]);
        gdo.net.app["PresentationTool"].excuteElement('gdo.net.server', 'deployBaseApp', [section.id + 1, '"' + section.appName + '"', '"' + config + '"']);
        gdo.consoleOut('.PresentationTool', 1, 'Deploy app on section' + (section.id + 1));
        if (section.appName === "Images") {
            // instance id start from 1
            gdo.net.app["PresentationTool"].excuteElement('gdo.net.app.Images.server', 'processImage', [section.appInstanceId + 1, '"' + section.src.replace(/^.*[\\\/]/, '') + '"']);
        } else if (section.appName === "YoutubeWall") {

        }
    }
}

gdo.net.app["PresentationTool"].excuteElement = function (mod, func, params) {
    var element = {};
    element.Mod = mod;
    element.Func = func;
    element.Params = params;

    gdo.consoleOut(".PresentationTool", 1, "Executing: " + element.Mod + "." + element.Func + "(" + element.Params + ");");
    try {
        var res = eval(element.Mod + "." + element.Func + "(" + element.Params + ");");
        gdo.consoleOut(".PresentationTool", 1, "Result: " + res);
    } catch (e) {

    }
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
        for (var i = 0; i < gdo.net.app["PresentationTool"].section[id].cols; i++) {
            for (var j = 0; j < gdo.net.app["PresentationTool"].section[id].rows; j++) {
                gdo.net.app["PresentationTool"].node[gdo.net.getNodeId(gdo.net.app["PresentationTool"].section[id].col + i, gdo.net.app["PresentationTool"].section[id].row + j)].sectionId = 0;
                gdo.consoleOut('.PresentationTool', 3, 'Updating Node : (id:' + gdo.net.getNodeId(gdo.net.app["PresentationTool"].section[id].col + i, gdo.net.app["PresentationTool"].section[id].row + j) + '),(col,row:' + gdo.net.app["PresentationTool"].section[id].col + i + ',' + gdo.net.app["PresentationTool"].section[id].row + j + ')');
            }
        }
    }
}