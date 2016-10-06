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

    $.connection.presentationToolAppHub.client.receiveAppUpdate = function (sections, currentSlide, totalSlide, isPlaying, currentPlayingIndex, imagesWidth) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            for (var i = 0; i < sections.length; i++) {
                if (sections[i] != null) {
                    var section = JSON.parse(sections[i]);
                    gdo.net.app["PresentationTool"].processSection(gdo.net.app["PresentationTool"].isPlaying, true, section.Id, sections[i]);
                }
            }
            gdo.net.app["PresentationTool"].currentSlide = currentSlide;
            gdo.net.app["PresentationTool"].totalSlide = totalSlide;
            gdo.net.app["PresentationTool"].updateSlideTab(currentSlide, totalSlide);
            gdo.net.app["PresentationTool"].isPlaying = isPlaying;
            gdo.net.app["PresentationTool"].currentPlayingIndex = currentPlayingIndex;
            gdo.net.app["PresentationTool"].imagesWidth = imagesWidth;
            gdo.updateDisplayCanvas();
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            //do nothing
        }
    }

    $.connection.presentationToolAppHub.client.receiveSectionUpdate = function (status, id, serializedSection) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.net.app["PresentationTool"].processSection(gdo.net.app["PresentationTool"].isPlaying, status, id, serializedSection);
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
                gdo.net.app["PresentationTool"].allFiles.push("/PPTs/" + ppts[i]);
            }
            $("iframe").contents().find("#item_images").empty();

            for (var i = 0; i < images.length; i++) {
                $("iframe").contents().find("#item_images")
                    .append("<li><a href='#' class='list-group-item'>" + images[i] + "</a></li>");
                gdo.net.app["PresentationTool"].allFiles.push("/Images/" + images[i]);
            }
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            //do nothing
        }
    }

    $.connection.presentationToolAppHub.client.receiveSlideUpdate = function (currentSlide) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.net.app["PresentationTool"].initialize(64);
            gdo.net.app["PresentationTool"].server.requestAppUpdate(gdo.controlId);
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
            gdo.net.app["PresentationTool"].server.requestAppUpdate(gdo.controlId);
            gdo.net.app["PresentationTool"].server.updateFileList(gdo.controlId);
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            //do nothing
        }
    }

    $.connection.presentationToolAppHub.client.receiveVoiceInfo = function (info, type) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {

        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.PresentationTool', 1, 'Requesting update voice info from section: ' + gdo.net.node[gdo.clientId].sectionCol + ', ' + gdo.net.node[gdo.clientId].sectionRow);
            gdo.net.app["PresentationTool"].server.updateVoiceInfo(gdo.net.node[gdo.clientId].appInstanceId,
                                                          gdo.net.node[gdo.clientId].sectionCol,
                                                          gdo.net.node[gdo.clientId].sectionRow,
                                                          info, type);
        }
    }

    $.connection.presentationToolAppHub.client.setVoiceInfo = function (info, type, firstChild) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {

        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.PresentationTool', 1, 'Set voice control information: ' + info + firstChild);
            $("iframe")[0].contentWindow.setVoiceInfo(info, type, firstChild);
        }
    }

    $.connection.presentationToolAppHub.client.changeVoiceControlStatus = function (currentStatus) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            if (currentStatus === 0) {
                gdo.net.app["PresentationTool"].artyom.clearGarbageCollection();
                gdo.net.app["PresentationTool"].artyom.fatality();// use this to stop any of
                $("iframe").contents().find("#voice_control").removeClass("btn-success").addClass("btn-primary");
            } else {
                gdo.net.app["PresentationTool"].artyom.fatality();// use this to stop any of
                setTimeout(function () {// if you use artyom.fatality , wait 250 ms to initialize again.
                    gdo.net.app["PresentationTool"].artyom.initialize({
                        lang: "en-GB",// A lot of languages are supported. Read the docs !
                        continuous: true,// Artyom will listen forever
                        listen: true, // Start recognizing
                        debug: true, // Show everything in the console
                        speed: 1 // talk normally
                    });
                }, 250);
                $("iframe").contents().find("#voice_control").removeClass("btn-primary").addClass("btn-success");
            }
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

        }
    }
    $.connection.presentationToolAppHub.client.receiveVoiceControlStatus = function (currentStatus) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            if (currentStatus === 0) {
                $("iframe").contents().find("#voice_control").removeClass("btn-primary").removeClass("btn-success").addClass("btn-primary");
            } else {
                $("iframe").contents().find("#voice_control").removeClass("btn-primary").removeClass("btn-success").addClass("btn-success");
            }
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

        }
    }

    $.connection.presentationToolAppHub.client.receiveAllSectionsInfo = function (sections) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.net.app["PresentationTool"].currentSlideSection = [];
            for (var i = 0; i < sections.length; i++) {
                for (var j = 0; j < sections[i].length; j++) {
                    gdo.net.app["PresentationTool"].currentSlideSection.push(sections[i][j]);
                }
            }
  
            for (var i = 0; i < gdo.net.app["PresentationTool"].currentSlide; i++) {
                gdo.net.app["PresentationTool"].currentPlayingIndex += sections[i].length;
            }

        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

        }
    }

    $.connection.presentationToolAppHub.client.receiveSectionList = function (sections) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.net.app["PresentationTool"].currentSlideSection = [];
            for (var i = 0; i < sections.length; i++) {
                for (var j = 0; j < sections[i].length; j++) {
                    gdo.net.app["PresentationTool"].currentSlideSection.push(sections[i][j]);
                }
            }
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

        }
    }


});

// Roate and zoom
gdo.net.app["PresentationTool"].rotateImage = function (instanceId) {
    gdo.consoleOut('.PresentationTool', 1, 'Rotate image on instance' + (instanceId));
    var instance = gdo.net.instance[instanceId];
    if (instance === null || !instance.exists) return;
    if (instance.appName === "Images") {
        gdo.net.app["Images"].server.requestRotateImage(instanceId, 90);
    }

}

gdo.net.app["PresentationTool"].zoomImage = function (instanceId, i) {
    var instance = gdo.net.instance[instanceId];
    if (instance === null || !instance.exists) return;
    if (i == 36) {
        //gdo.net.app["Images"].server.requestZoomToImage(instanceId, 1);
        return;
    }
    gdo.net.app["Images"].server.requestZoomImage(instanceId, 0.05);
    setTimeout(function () {
        gdo.net.app["PresentationTool"].zoomImage(instanceId, ++i);
    }, 2);
}

gdo.net.app["PresentationTool"].shiftSlide = function (instanceId, style, direction, imageName, mode) {
    var instance = gdo.net.instance[instanceId];
    if (instance === null || !instance.exists) return;
    if (instance.appName === "Images") {
        gdo.net.app["Images"].server.requestShiftImage(instanceId, style, direction, imageName, mode);
    }
}

// swap
gdo.net.app["PresentationTool"].swapSrc = function (sections, i) {

    if (i == sections.length) {
        return;
    }
    gdo.net.app["Images"].server.showImage(sections[i].realInstanceId, sections[i].src.replace(/^.*[\\\/]/, ''), 2);
    gdo.net.app["PresentationTool"].swapSrc(sections, ++i);
}

// Button control
gdo.net.app["PresentationTool"].previousSlide = function () {
    gdo.consoleOut('.PresentationTool', 1, 'Previous slide');
    var style = "animate";
    if (gdo.net.app["PresentationTool"].template === 1) {
        style = "animate";
    } else if (gdo.net.app["PresentationTool"].template === 2) {
        style = "fadeOut";
    }
    var numOfApps = 0;
    var numOfSections = gdo.net.app["PresentationTool"].section.length;
    for (var i = 2; i < numOfSections; i++) {
        var section = gdo.net.app["PresentationTool"].section[i];
        if (section.appInstanceId > 0 && section.appInstanceId !== gdo.controlId) {
            numOfApps++;
        }
    }
    $("iframe").contents().find("#currentPlayingIndex").html(gdo.net.app["PresentationTool"].currentPlayingIndex);
    if (gdo.net.app["PresentationTool"].currentPlayingIndex <= 0) {
        $("iframe").contents().find("#message_from_server").html("Cannot play previous slides");
        return;
    }
    gdo.net.app["PresentationTool"].currentPlayingIndex--;
    gdo.net.app["PresentationTool"].server.changePlayingIndex(gdo.controlId, gdo.net.app["PresentationTool"].currentPlayingIndex);
    var index = gdo.net.app["PresentationTool"].currentPlayingIndex;
    var k = 0;
    for (var i = 2; i < numOfSections; i++) {
        var section = gdo.net.app["PresentationTool"].section[i];
        if (section.appInstanceId > 0 && section.appInstanceId !== gdo.controlId) {
            numOfApps--;
            var targetSection = JSON.parse(gdo.net.app["PresentationTool"].currentSlideSection[index]);
            gdo.net.app["PresentationTool"].shiftSlide(section.realInstanceId, style, 1, targetSection.Src.replace(/^.*[\\\/]/, ''), 2);
            gdo.net.app["PresentationTool"].server.changeSection(gdo.controlId, section.id, targetSection.Src, targetSection.AppName);
            gdo.net.app["PresentationTool"].processSection(gdo.net.app["PresentationTool"].isPlaying, true, section.id, gdo.net.app["PresentationTool"].currentSlideSection[index]);
            k++;
            index++;;
        }
    }
    gdo.updateDisplayCanvas();
}

gdo.net.app["PresentationTool"].nextSlide = function () {
    gdo.consoleOut('.PresentationTool', 1, 'Next slide');
    var style = "animate";
    if (gdo.net.app["PresentationTool"].template === 1) {
        style = "animate";
    } else if (gdo.net.app["PresentationTool"].template === 2) {
        style = "fadeOut";
    }
    // Check if can play
    var numOfApps = 0;
    var numOfSections = gdo.net.app["PresentationTool"].section.length;
    for (var i = 2; i < numOfSections; i++) {
        var section = gdo.net.app["PresentationTool"].section[i];
        if (section.appInstanceId > 0 && section.appInstanceId !== gdo.controlId) {
            numOfApps++;
        }
    }
    $("iframe").contents().find("#currentPlayingIndex").html(gdo.net.app["PresentationTool"].currentPlayingIndex);
    if ((gdo.net.app["PresentationTool"].currentSlideSection.length - gdo.net.app["PresentationTool"].currentPlayingIndex - 1) < numOfApps) {
        $("iframe").contents().find("#message_from_server").html("Cannot play next slides");
        return;
    }
    if (gdo.net.app["PresentationTool"].currentPlayingIndex + 1 >= gdo.net.app["PresentationTool"].currentSlideSection.length) {
        $("iframe").contents().find("#message_from_server").html("Cannot play next slides");
        return;
    }

    gdo.net.app["PresentationTool"].currentPlayingIndex++;
    gdo.net.app["PresentationTool"].server.changePlayingIndex(gdo.controlId, gdo.net.app["PresentationTool"].currentPlayingIndex);
    var index = gdo.net.app["PresentationTool"].currentPlayingIndex;

    var k = 0;
    for (var i = 2; i < numOfSections; i++) {
        var section = gdo.net.app["PresentationTool"].section[i];
        if (section.appInstanceId > 0 && section.appInstanceId !== gdo.controlId) {
            numOfApps--;        
            var targetSection = JSON.parse(gdo.net.app["PresentationTool"].currentSlideSection[index]);
            gdo.net.app["PresentationTool"].shiftSlide(section.realInstanceId, style, -1, targetSection.Src.replace(/^.*[\\\/]/, ''), 2);
            gdo.net.app["PresentationTool"].server.changeSection(gdo.controlId, section.id, targetSection.Src, targetSection.AppName);
            gdo.net.app["PresentationTool"].processSection(gdo.net.app["PresentationTool"].isPlaying, true, section.id, gdo.net.app["PresentationTool"].currentSlideSection[index]);
            k++;
            index++;
        }
    }
    gdo.updateDisplayCanvas();
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

gdo.net.app["PresentationTool"].updateDisplayCanvas = function () {
    gdo.updateDisplayCanvas();
}

gdo.net.app["PresentationTool"].clearAllOtherApp = function () {
    gdo.net.app["PresentationTool"].initialElements();
    gdo.net.app["PresentationTool"].addElement('gdo.net.app.PresentationTool.server', 'clearCave', [gdo.controlId], 0, false);
    // undeploy apps
    var length = gdo.net.instance.length;
    for (var i = 0; i < length; i++) {
        var instance = gdo.net.instance[i];
        if (instance != null && instance.exists && instance.appName !== "PresentationTool") {
            gdo.net.app["PresentationTool"].addElement('gdo.net.server', 'closeApp', [instance.id], 0, false);
            //gdo.net.app["PresentationTool"].addElement('gdo.net.server', 'closeSection', [instance.sectionId], 0, false);
        }
    }

    // close sections
    length = gdo.net.section.length;
    for (var i = 1; i < length; i++) {
        var section = gdo.net.section[i];
        if (section != null && section.exists) {
            gdo.net.app["PresentationTool"].addElement('gdo.net.server', 'closeSection', [section.id], 0, false);
        }
    }

    gdo.net.app["PresentationTool"].addElement('gdo.net.app.PresentationTool', 'updateDisplayCanvas', [], 0, false);
    gdo.net.app["PresentationTool"].readyToExcute();
    gdo.net.app["PresentationTool"].executeElement(gdo.net.app["PresentationTool"].Elements[gdo.net.app["PresentationTool"].CurrentElement]);
}

// Load Template
gdo.net.app["PresentationTool"].loadTemplate = function () {
    gdo.consoleOut('.PresentationTool', 1, 'Load template ' + gdo.net.app["PresentationTool"].template);
    gdo.net.app["PresentationTool"].initialElements();
    gdo.net.app["PresentationTool"].addElement('gdo.net.app.PresentationTool.server', 'clearCave', [gdo.controlId], 0, false);
    // undeploy apps
    var length = gdo.net.instance.length;
    for (var i = 0; i < length; i++) {
        var instance = gdo.net.instance[i];
        if (instance != null && instance.exists && instance.appName !== "PresentationTool") {
            gdo.net.app["PresentationTool"].addElement('gdo.net.server', 'closeApp', [instance.id], 0, false);
            gdo.net.app["PresentationTool"].addElement('gdo.net.server', 'closeSection', [instance.sectionId], 0, false);
        }
    }
    length = gdo.net.app["PresentationTool"].allFiles.length;
    switch (gdo.net.app["PresentationTool"].template) {
        case 1:
            // node availability check
            for (var i = 0; i <= 14; i++) {
                for (var j = 0; j <= 3; j++) {
                    var parentNode = gdo.net.node[gdo.net.getNodeId(i, j)];
                    if (parentNode.sectionId !== 0 && parentNode.id !== 64) {
                        $("iframe").contents().find("#Message").text("Some Nodes are not free!");
                        return;
                    }
                }
            }
            var slides = length / 4 + 1;
            var count = 0;
            for (var i = 0; i < slides; i++) {
                for (var j = 0; j < 5; j++) {
                    if (count === length) break;
                    gdo.net.app["PresentationTool"].addElement('gdo.net.app.PresentationTool.server', 'createSection', [gdo.controlId, j * 3, 0, j * 3 + 2, 3], 0, false);
                    gdo.net.app["PresentationTool"].addElement('gdo.net.app.PresentationTool.server', 'deployResource', [gdo.controlId, j + 2, '"' + gdo.net.app["PresentationTool"].allFiles[count] + '"', '"' + "Images" + '"'], 0.1, false);
                    count++;
                }
                if (count == length) break;
                gdo.net.app["PresentationTool"].addElement('gdo.net.app.PresentationTool.server', 'requestCreateNewSlide', [gdo.controlId], 0.1, false);
            }
            gdo.net.app["PresentationTool"].readyToExcute();
            gdo.net.app["PresentationTool"].executeElement(gdo.net.app["PresentationTool"].Elements[gdo.net.app["PresentationTool"].CurrentElement]);
            break;
        case 2:
            // node availability check
            for (var i = 0; i <= 13; i++) {
                for (var j = 0; j <= 3; j++) {
                    var parentNode = gdo.net.node[gdo.net.getNodeId(i, j)];
                    if (parentNode.sectionId !== 0 && parentNode.id !== 64) {
                        $("iframe").contents().find("#Message").text("Some Nodes are not free!");
                        return;
                    }
                }
            }
            var slides = (length / 14) + 1;
            var count = 0;
            for (var i = 0; i < slides; i++) {
                for (var j = 0; j < 14; j++) {
                    if (count === length) break;
                    var m = (j % 2 == 0) ? j : j - 1;
                    var n = (j % 2 == 0) ? 0 : 2;
                    gdo.net.app["PresentationTool"].addElement('gdo.net.app.PresentationTool.server', 'createSection', [gdo.controlId, m, n, m + 1, n + 1], 0, false);
                    gdo.net.app["PresentationTool"].addElement('gdo.net.app.PresentationTool.server', 'deployResource', [gdo.controlId, j + 2, '"' + gdo.net.app["PresentationTool"].allFiles[count] + '"', '"' + "Images" + '"'], 0.1, false);
                    count++;
                }
                if (count == length) break;
                gdo.net.app["PresentationTool"].addElement('gdo.net.app.PresentationTool.server', 'requestCreateNewSlide', [gdo.controlId], 0.1, false);
            }
            gdo.net.app["PresentationTool"].readyToExcute();
            gdo.net.app["PresentationTool"].executeElement(gdo.net.app["PresentationTool"].Elements[gdo.net.app["PresentationTool"].CurrentElement]);
            break;
    }
}

// Play control
gdo.net.app["PresentationTool"].loadCurrentSlide = function (firstPlay) {
    gdo.consoleOut('.PresentationTool', 1, 'Load current slide ' + gdo.net.app["PresentationTool"].currentSlide);
    $("iframe").contents().find("#message_from_server").html('Load current slide ' + gdo.net.app["PresentationTool"].currentSlide);

    // Check section 
    gdo.net.app["PresentationTool"].initialElements();

    // deploy app on sections
    var numOfSections = gdo.net.app["PresentationTool"].section.length;
    var reDeploy = false;

    // check if need redeploy apps
    for (var i = 1; i <= gdo.net.cols * gdo.net.rows; i++) {
        var parentNode = gdo.net.node[i];
        var parentSection = gdo.net.section[parentNode.sectionId];
        var node = gdo.net.app["PresentationTool"].node[i];
        var section = gdo.net.app["PresentationTool"].section[node.sectionId];
        if (parentNode.appInstanceId < 0 && section.appInstanceId > 0
            || parentNode.appInstanceId > 0 && section.appInstanceId < 0) {
            reDeploy = true;
            break;
        }
        if (parentSection.appInstanceId > 0) {
            if (gdo.net.instance[parentSection.appInstanceId].appName != section.appName) {
                reDeploy = true;
                break;
            }

        }
    }

    // undeploy apps
    if (reDeploy) {
        var length = gdo.net.instance.length;
        for (var i = 0; i < length; i++) {
            var instance = gdo.net.instance[i];
            if (instance != null && instance.exists && instance.appName !== "PresentationTool") {
                gdo.net.app["PresentationTool"].addElement('gdo.net.server', 'closeApp', [instance.id], 0, false);
                //gdo.net.app["PresentationTool"].addElement('gdo.net.server', 'closeSection', [instance.sectionId], 0, false);
            }
        }
        length = gdo.net.section.length;
        for (var i = 1; i < length; i++) {
            var section = gdo.net.section[i];
            if (section != null && section.exists) {
                gdo.net.app["PresentationTool"].addElement('gdo.net.server', 'closeSection', [section.id], 0, false);
            }
        }
    }

    var numOfApps = 0;
    // start from section 2
    for (var i = 2; i < numOfSections; i++) {
        var section = gdo.net.app["PresentationTool"].section[i];
        if (section.appInstanceId > 0 && section.appInstanceId !== gdo.controlId) {
            numOfApps++;
            section.realSectionId = numOfApps + 1;
            section.realInstanceId = numOfApps;
            gdo.net.app["PresentationTool"].addElement('gdo.net.app.PresentationTool.server', 'updateSectionInfo', [gdo.controlId, section.id, section.realSectionId, section.realInstanceId], 0, false);
            if (reDeploy) {
                gdo.net.app["PresentationTool"].addElement('gdo.net.server', 'createSection', [section.col, section.row, section.col + section.cols - 1, section.row + section.rows - 1], 0, false);
            }

            if (section.appName === "YoutubeWall") {
                if (reDeploy) {
                    gdo.net.app["PresentationTool"].addElement('gdo.net.server', 'deployBaseApp', [section.realSectionId, '"' + section.appName + '"', '"Imperial"'], 0.1, false);
                }

            } else if (section.appName === "Youtube") {
                if (reDeploy) {
                    gdo.net.app["PresentationTool"].addElement('gdo.net.server', 'deployBaseApp', [section.realSectionId, '"' + section.appName + '"', '"Default"'], 0.1, false);
                }

            } else if (section.appName === "Images") {
                if (reDeploy) {
                    gdo.net.app["PresentationTool"].addElement('gdo.net.server', 'deployBaseApp', [section.realSectionId, '"' + section.appName + '"', '"Default"'], 0.1, false);
                }
                gdo.net.app["PresentationTool"].addElement('gdo.net.app.Images.server', 'showImage', [section.realInstanceId, '"' + section.src.replace(/^.*[\\\/]/, '') + '"', 2], 0.1, false);
            }
        }
    }
    if (firstPlay) {
        gdo.net.app["PresentationTool"].addElement('gdo.net.app.PresentationTool.server', 'requestAllSectionsInfo', [gdo.controlId], 0, false);
    }
    //gdo.net.app["PresentationTool"].addElement('gdo.net.app.PresentationTool', 'playCurrentSlide', [], 0, false);
    gdo.net.app["PresentationTool"].readyToExcute();
    gdo.net.app["PresentationTool"].executeElement(gdo.net.app["PresentationTool"].Elements[gdo.net.app["PresentationTool"].CurrentElement]);
}

// Play specific instance
gdo.net.app["PresentationTool"].playInstance = function (instanceId) {
    var instance = gdo.net.instance[instanceId];
    if (instance === null || !instance.exists) return;

    if (instance.appName === "Images") {
        gdo.net.app["Images"].server.displayImageWithMode(instanceId, 2);
        return;
    } 
    var appPage = window.location.origin + "/Web/Instances.cshtml?id=" + (instanceId);
    $("iframe").contents().find("#hidden_app_iframe").css({ "display": "block" });
    $("iframe").contents().find("#hidden_app_iframe").unbind().attr('src', appPage);

    $("iframe").contents().find("#hidden_app_iframe").on('load', function () {
        $(this).contents().find("iframe").on('load', function () {

            if (instance.appName === "YoutubeWall") {
                setTimeout(function () {
                    $("iframe").contents().find("#hidden_app_iframe").contents().find("iframe").contents().find("#search_mode").click();
                    $("iframe").contents().find("#hidden_app_iframe").contents().find("iframe").contents().find("#new_keyword").val(gdo.net.app["PresentationTool"].section[instance.id].src);
                    $("iframe").contents().find("#hidden_app_iframe").contents().find("iframe").contents().find("#update_keyword_submit").click();
                    $("iframe").contents().find("#message_from_server").html("Play Video on instance " + (instanceId));
                }, 200);
            } else if (instance.appName === "Youtube") {
                setTimeout(function () {
                    $("iframe").contents().find("#hidden_app_iframe").contents().find("iframe").contents().find("#url_input").val(gdo.net.app["PresentationTool"].section[instance.id].src);
                    $("iframe").contents().find("#hidden_app_iframe").contents().find("iframe").contents().find("#url_submit").click();
                    $("iframe").contents().find("#hidden_app_iframe").contents().find("iframe").contents().find("#youtube_title").bind('DOMSubtreeModified', function () {
                        $("iframe").contents().find("#youtube_title").text($("iframe").contents().find("#hidden_app_iframe").contents().find("iframe").contents().find("#youtube_title").text());
                    });
                    $("iframe").contents().find("#hidden_app_iframe").contents().find("iframe").contents().find("#youtube_duration").bind('DOMSubtreeModified', function () {
                        $("iframe").contents().find("#youtube_duration").text($("iframe").contents().find("#hidden_app_iframe").contents().find("iframe").contents().find("#youtube_duration").text());
                    });
                    $("iframe").contents().find("#video_play").click(function () {
                        if (gdo.net.app["PresentationTool"].isPlaying === 0) return;
                        $("iframe").contents().find("#hidden_app_iframe").contents().find("iframe").contents().find("#playButton").click();
                    });
                    $("iframe").contents().find("#video_pause").click(function () {
                        if (gdo.net.app["PresentationTool"].isPlaying === 0) return;
                        $("iframe").contents().find("#hidden_app_iframe").contents().find("iframe").contents().find("#pauseButton").click();
                    });
                    $("iframe").contents().find("#message_from_server").html("Play Video on instance " + (instanceId));
                }, 1000);
            }
        });
    });
}

gdo.net.app["PresentationTool"].playCurrentSlide = function () {
    gdo.net.app["PresentationTool"].imagesWidth = [];
    gdo.net.app["PresentationTool"].loadImagesAppIframe(1);
}

gdo.net.app["PresentationTool"].loadImagesAppIframe = function (i) {

    var numOfSections = gdo.net.app["PresentationTool"].section.length;

    if (i == numOfSections) {
        $("iframe").contents().find("#hidden_app_iframe").css({ "display": "none" });
        $("iframe").contents().find("#hidden_app_iframe").unbind().attr('src', '');
        gdo.net.app["PresentationTool"].server.updateImagesWidth(gdo.controlId, gdo.net.app["PresentationTool"].imagesWidth);
        return;
    };

    var section = gdo.net.app["PresentationTool"].section[i];
    if (section != null && section.src !== null && section.appName === "Images") {
        var appPage = window.location.origin + "/Web/Instances.cshtml?id=" + (section.realInstanceId);
        $("iframe").contents().find("#hidden_app_iframe").css({ "display": "block" });
        // Load hidden iframe
        $("iframe").contents().find("#hidden_app_iframe").unbind().attr('src', appPage);
        $("iframe").contents().find("#hidden_app_iframe").on('load', function () {
            $(this).contents().find("iframe").on('load', function () {
                if (section.appName === "Images") {
                    $(this).contents().find("#thumbnail_control > img").on('load', function () {
                        setTimeout(function () {
                            $("iframe").contents().find("#hidden_app_iframe").contents().find("iframe").contents().find("#active_control").click();
                            $("iframe").contents().find("#hidden_app_iframe").contents().find("iframe").contents().find("#center_mode").click();
                            var width = parseInt($("iframe").contents().find("#hidden_app_iframe").contents().find("iframe").contents().find("#cropbox_data_width").html());
                            gdo.net.app["PresentationTool"].imagesWidth.push(width);
                            $("iframe").contents().find("#message_from_server").html("Play Image on instance " + (section.realInstanceId));
                            gdo.net.app["PresentationTool"].loadImagesAppIframe(++i);
                        }, 200);
                    });
                }
            }); return;
        });

    } else {
        gdo.net.app["PresentationTool"].loadImagesAppIframe(++i);
    }

}



// Excute elements
gdo.net.app["PresentationTool"].initialElements = function () {
    gdo.consoleOut('.PresentationTool', 1, 'Initializing excuting elements');
    gdo.net.app["PresentationTool"].Elements = [];
    gdo.net.app["PresentationTool"].isExcuting = false;
    gdo.net.app["PresentationTool"].CurrentElement = -1;
    gdo.net.app["PresentationTool"].timeoutInterval = 200;
    gdo.net.app["PresentationTool"].ELEMENT_STATUS = {
        NEW: 0,
        DEFAULT: 1,
        SUCCESS: 2,
        CURRENT: 3,
        FAILED: 4
    };
}

gdo.net.app["PresentationTool"].readyToExcute = function () {
    gdo.consoleOut('.PresentationTool', 1, 'Elements ready to excute');
    gdo.net.app["PresentationTool"].isExcuting = true;
    if (gdo.net.app["PresentationTool"].CurrentElement < 0) {
        gdo.net.app["PresentationTool"].CurrentElement = 0;
    }
}

gdo.net.app["PresentationTool"].addElement = function (mod, func, params, wait, isLoop) {
    var element = {};
    element.Mod = mod;
    element.Func = func;
    element.Params = params;
    element.DefaultWait = 0;
    element.Wait = wait;
    element.IsLoop = isLoop;
    element.Id = gdo.net.app["PresentationTool"].Elements.length;
    element.Status = gdo.net.app["PresentationTool"].ELEMENT_STATUS.NEW;
    gdo.net.app["PresentationTool"].Elements.push(element);
}

gdo.net.app["PresentationTool"].executeElement = function (element) {
    if (typeof element != 'undefined') {
        if (element.Wait > 0) {
            if (element.Wait == element.DefaultWait) {
                gdo.net.app["PresentationTool"].isExcuting = true;
            }
            if (gdo.net.app["PresentationTool"].isExcuting) {
                element.Wait = parseFloat(element.Wait - 0.1).toFixed(1);
                setTimeout(function () { gdo.net.app["PresentationTool"].executeElement(element); }, 100);
            }
        } else {
            try {
                if (gdo.net.app["PresentationTool"].CurrentElement <= gdo.net.app["PresentationTool"].Elements.length) {
                    gdo.consoleOut(".PresentationTool", 2, "Executing: " + element.Mod + "." + element.Func + "(" + element.Params + ");");
                    var res;
                    if (element.Mod == "") {
                        res = eval(element.Func + "(" + element.Params + ");");

                    } else {
                        res = eval(element.Mod + "." + element.Func + "(" + element.Params + ");");
                    }
                    gdo.consoleOut(".PresentationTool", 2, "Result: " + res);
                    if (gdo.net.app["PresentationTool"].Elements[element.Id + 1] != null && gdo.net.app["PresentationTool"].Elements[element.Id + 1].Wait == -1) {
                        gdo.net.app["PresentationTool"].isExcuting = false;
                    }
                    gdo.net.app["PresentationTool"].Elements[element.Id].Status = gdo.net.app["PresentationTool"].ELEMENT_STATUS.SUCCESS;
                    if (element.Id + 1 >= gdo.net.app["PresentationTool"].Elements.length) {
                        gdo.net.app["PresentationTool"].CurrentElement = -1;
                    } else {
                        gdo.net.app["PresentationTool"].Elements[element.Id + 1].Status = gdo.net.app["PresentationTool"].ELEMENT_STATUS.CURRENT;
                        gdo.net.app["PresentationTool"].CurrentElement++;
                        if (gdo.net.app["PresentationTool"].CurrentElement == gdo.net.app["PresentationTool"].Elements.length) {
                            gdo.management.scenarios.isExcuting = false;
                        }
                    }
                    if (gdo.net.app["PresentationTool"].isExcuting) {
                        setTimeout(function () { gdo.net.app["PresentationTool"].executeElement(gdo.net.app["PresentationTool"].Elements[element.Id + 1]); }, 100);
                    }
                } else {
                    gdo.net.app["PresentationTool"].isExcuting = false;
                }
            } catch (e) {
                gdo.net.app["PresentationTool"].CurrentElement++;
                gdo.net.app["PresentationTool"].Elements[element.Id].Status = gdo.net.app["PresentationTool"].ELEMENT_STATUS.FAILED;
                gdo.net.app["PresentationTool"].isExcuting = false;
                gdo.consoleOut(".PresentationTool", 5, "Encountered an error executing last command");
            }
        }
    }
}

// File Managment
gdo.net.app["PresentationTool"].updateFileManagementList = function () {
    $("iframe").contents().find("#file_selection").empty();
    var length = gdo.net.app["PresentationTool"].allFiles.length;
    for (var i = 0; i < length; i++) {
        $("iframe").contents().find("#file_selection")
            .append("<option class='list-group-item'>" + gdo.net.app["PresentationTool"].allFiles[i] + "</option>");
    }
}

// Slide tabs
gdo.net.app["PresentationTool"].updateSlideTab = function (currentSlide, totalSlide) {
    $("iframe").contents().find("#slide_tab").empty();
    for (var i = 0; i < totalSlide; i++) {
        if (i === currentSlide) {
            $("iframe").contents().find('ul.nav-pills li.active').removeClass('active');
            $("iframe").contents().find("#slide_tab")
               .append('<li class="active"><a href="#slide_table" data-toggle="tab"><b>' + i + '</b></a></li>');
        } else {
            $("iframe").contents().find("#slide_tab")
               .append('<li><a href="#slide_table" data-toggle="tab"><b>' + i + '</b></a></li>');
        }
    }

    $("iframe").contents().find('#slide_tab a').click(function (e) {
        e.preventDefault();
        if (gdo.net.app["PresentationTool"].isPlaying === 1)
            return false;
        gdo.net.app["PresentationTool"].server.requestSlideTable(gdo.controlId, parseInt($(e.target).text()));
    });
}

// Initial and terminate
gdo.net.app["PresentationTool"].initClient = function () {
    gdo.consoleOut('.PresentationTool', 1, 'Initializing PresentationTool App Client at Node ' + gdo.clientId);
}

gdo.net.app["PresentationTool"].initControl = function () {
    gdo.controlId = parseInt(getUrlVar("controlId"));
    gdo.consoleOut('.PresentationTool', 1, 'Initializing PresentationTool App Control at Instance ' + gdo.controlId);
    // load script
    gdo.loadScript('ui', 'PresentationTool', gdo.SCRIPT_TYPE.APP);
    gdo.loadScript('cropper.min', 'PresentationTool', gdo.SCRIPT_TYPE.EXTERNAL);
    // draw ui
    gdo.net.app["PresentationTool"].initialize(64);
    gdo.net.app["PresentationTool"].server.requestSectionList(gdo.controlId);
    gdo.net.app["PresentationTool"].server.requestAppUpdate(gdo.controlId);
    gdo.net.app["PresentationTool"].server.updateFileList(gdo.controlId);
    gdo.net.app["PresentationTool"].server.restoreVoiceControlStatus(gdo.controlId);
    gdo.net.app["PresentationTool"].server.requestVoiceInfo(gdo.controlId, "Say 'Hello there' to start voice control", 1);
}

gdo.net.app["PresentationTool"].terminateClient = function () {
    gdo.consoleOut('.PresentationTool', 1, 'Terminating PresentationTool App Client at Node ' + clientId);
}

gdo.net.app["PresentationTool"].ternminateControl = function () {
    gdo.consoleOut('.PresentationTool', 1, 'Terminating PresentationTool App Control at Instance ' + gdo.controlId);
}