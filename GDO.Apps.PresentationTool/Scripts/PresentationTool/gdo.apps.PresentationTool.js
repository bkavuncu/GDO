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

    // app status update
    $.connection.presentationToolAppHub.client.receiveAppUpdate = function (isPlaying, currentPage) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {

            gdo.net.app["PresentationTool"].isPlaying = isPlaying;
            gdo.net.app["PresentationTool"].currentPage = currentPage;
            gdo.net.app["PresentationTool"].server.setPage(gdo.controlId, gdo.net.app["PresentationTool"].currentPage);

        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            //do nothing
        }
    }

    $.connection.presentationToolAppHub.client.receiveSectionUpdate = function (slides) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {

            // clear section
            for (var i = 0; i < gdo.net.section.length; i++) {
                gdo.net.section[i].src = null;
                gdo.net.section[i].appName = null;
            }

            // update current page
            for (var i = 0; i < slides.length; i++) {
                if (slides[i] != null) {
                    var slide = JSON.parse(slides[i]);
                    gdo.net.section[slide.Id].src = slide.Src;
                    gdo.net.section[slide.Id].appName = slide.AppName;
                }
            }

            gdo.updateDisplayCanvas();

        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            //do nothing
        }
    }

    $.connection.presentationToolAppHub.client.receivePageUpdate = function (currentPage, totalPage) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {

            gdo.consoleOut('.PresentationTool', 1, 'Receive page update at page: ' + currentPage);

            // clear previous states
            gdo.management.sections.selectedSection = -1;

            // update page tab
            $("iframe").contents().find("#page_tab").empty();
            for (var i = 0; i < totalPage; i++) {
                if (i === currentPage) {
                    $("iframe").contents().find('ul.nav-pills li.active').removeClass('active');
                    $("iframe").contents().find("#page_tab")
                       .append('<li class="active"><a href="#page_table" data-toggle="tab"><b>' + i + '</b></a></li>');
                } else {
                    $("iframe").contents().find("#page_tab")
                       .append('<li><a href="#page_table" data-toggle="tab"><b>' + i + '</b></a></li>');
                }
            }

            $("iframe").contents().find('#page_tab a').click(function (e) {
                e.preventDefault();
                if (gdo.net.app["PresentationTool"].isPlaying === 1)
                    return false;
                gdo.net.app["PresentationTool"].server.setPage(gdo.controlId, parseInt($(e.target).text()));
            });


            gdo.updateDisplayCanvas(); return;

        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            //do nothing
        }
    }

    $.connection.presentationToolAppHub.client.loadTemplate = function (templateId) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.net.app["PresentationTool"].initialElements();


        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            //do nothing
        }
    }

    $.connection.presentationToolAppHub.client.receiveFileNames = function (ppts, images) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.net.app["PresentationTool"].fileNames = [];
            $("iframe").contents().find("#item_ppts").empty();

            for (var i = 0; i < ppts.length; i++) {
                $("iframe").contents().find("#item_ppts")
                    .append("<li><a href='#' class='list-group-item'>" + ppts[i].replace(/^.*[\\\/]/, '') + "</a></li>");
                gdo.net.app["PresentationTool"].fileNames.push(ppts[i]);
            }
            $("iframe").contents().find("#item_images").empty();

            for (var i = 0; i < images.length; i++) {
                $("iframe").contents().find("#item_images")
                    .append("<li><a href='#' class='list-group-item'>" + images[i].replace(/^.*[\\\/]/, '') + "</a></li>");
                gdo.net.app["PresentationTool"].fileNames.push(images[i]);
            }

            // file management
            $("iframe").contents().find("#file_selection").empty();
            var length = gdo.net.app["PresentationTool"].fileNames.length;
            for (var i = 0; i < length; i++) {
                $("iframe").contents().find("#file_selection")
                    .append("<option class='list-group-item'>" + gdo.net.app["PresentationTool"].fileNames[i].replace(/^.*[\\\/]/, '') + "</option>");
            }

        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            //do nothing
        }
    }

    $.connection.presentationToolAppHub.client.receiveSavePresentation = function (serializedPages) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            var blob = new Blob([serializedPages], { type: "application/json" });
            var url = URL.createObjectURL(blob);
            $("iframe").contents().find("#slide_link").attr({ 'download': "slide.json", 'href': url });
            $("iframe").contents().find("#slide_link")[0].click();
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            //do nothing
        }
    }
    $.connection.presentationToolAppHub.client.receiveOpenPresentation = function () {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {

        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            //do nothing
        }
    }

    $.connection.presentationToolAppHub.client.receiveVoiceInfo = function (info, type) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {

        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.PresentationTool', 1, 'Set voice control information: ' + info);
            if (gdo.net.node[gdo.clientId].sectionCol == 0 && gdo.net.node[gdo.clientId].sectionRow == 0) {
                $("iframe")[0].contentWindow.setVoiceInfo(info, type, true);
            } else {
                $("iframe")[0].contentWindow.setVoiceInfo(info, type, false);
            }
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

    $.connection.presentationToolAppHub.client.createSection = function (colStart, rowStart, colEnd, rowEnd) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.net.server.createSection(colStart, rowStart, colEnd, rowEnd);
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

        }
    }

    $.connection.presentationToolAppHub.client.closeSection = function (sectionId) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.net.server.closeSection(sectionId);
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

        }
    }

    $.connection.presentationToolAppHub.client.BroadcastSectionUpdate = function (sectionId) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.net.server.broadcastSectionUpdate(sectionId);
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

        }
    }
});


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

// Play current page
gdo.net.app["PresentationTool"].playCurrentPage = function () {

    gdo.consoleOut('.PresentationTool', 1, 'Play current page ' + gdo.net.app["PresentationTool"].currentPage);
    $("iframe").contents().find("#message_from_server").html('Play current page ' + gdo.net.app["PresentationTool"].currentPage);

    for (var i = 0; i < gdo.net.section.length; i++) {
        var section = gdo.net.section[i];
        if (section.src !== null) {
            gdo.net.server.deployBaseApp(section.id, "Images", "Default");
            setTimeout(function () {
                console.log(section.appInstanceId);
                if (section.appName === "Images") {
                  
                    gdo.net.app["Images"].server.displayImage(section.appInstanceId, section.src.replace(/^.*[\\\/]/, ''), 2, $("iframe")[0].contentWindow.width, $("iframe")[0].contentWindow.height);
                } else if (section === "Youtube") {

                }
            }, 2000);
            return;

        }
    }
}

// Play selected slide
gdo.net.app["PresentationTool"].playSelectedSlide = function (sectionId) {
    var section = gdo.net.section[sectionId];
    if (section.appInstanceId < 0 || section.appInstanceId === gdo.controlId) return;

    if (section.appName === "Images") {
        gdo.net.app["Images"].server.displayImage(section.appInstanceId, section.src.replace(/^.*[\\\/]/, ''), 2);
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


// Initial and terminate
gdo.net.app["PresentationTool"].initClient = function () {
    gdo.consoleOut('.PresentationTool', 1, 'Initializing PresentationTool App Client at Node ' + gdo.clientId);
}

gdo.net.app["PresentationTool"].initControl = function () {
    gdo.controlId = parseInt(getUrlVar("controlId"));
    gdo.consoleOut('.PresentationTool', 1, 'Initializing PresentationTool App Control at Instance ' + gdo.controlId);

    // Parameters
    gdo.net.app["PresentationTool"].template = 0;
    gdo.net.app["PresentationTool"].numOfPPTs = 0;
    gdo.net.app["PresentationTool"].numOfImgs = 0;
    gdo.net.app["PresentationTool"].fileNames = [];

    gdo.net.app["PresentationTool"].img_control_status = 0;
    gdo.net.app["PresentationTool"].img_control_enable = 0;
    gdo.net.app["PresentationTool"].video_control_status = 0;
    gdo.net.app["PresentationTool"].video_control_enable = 0;

    gdo.net.app["PresentationTool"].isPlaying = 0;



    gdo.net.app["PresentationTool"].currentSlideSection = [];
    gdo.net.app["PresentationTool"].currentPlayingIndex = 0;

    gdo.net.app["PresentationTool"].selectedResource = null;
    gdo.net.app["PresentationTool"].selectedAppName = null;

    gdo.net.app["PresentationTool"].currentPage = 0;
    gdo.net.app["PresentationTool"].totalPage = 0;

    gdo.management.sections.selectedSection = -1;

    for (var i = 0; i < gdo.net.section.length; i++) {
        gdo.net.section[i].src = null;
        gdo.net.section[i].appName = null;
    }

    // load script
    gdo.loadScript('ui', 'PresentationTool', gdo.SCRIPT_TYPE.APP);
    gdo.loadScript('cropper.min', 'PresentationTool', gdo.SCRIPT_TYPE.EXTERNAL);


    gdo.net.app["PresentationTool"].server.requestAppUpdate(gdo.controlId);
    gdo.net.app["PresentationTool"].server.updateFileList(gdo.controlId);
    gdo.net.app["PresentationTool"].server.restoreVoiceControlStatus(gdo.controlId);
    gdo.net.app["PresentationTool"].server.updateVoiceInfo(gdo.controlId, "Say 'Hello there' to start voice control", 1);
}

gdo.net.app["PresentationTool"].terminateClient = function () {
    gdo.consoleOut('.PresentationTool', 1, 'Terminating PresentationTool App Client at Node ' + clientId);
}

gdo.net.app["PresentationTool"].ternminateControl = function () {
    gdo.consoleOut('.PresentationTool', 1, 'Terminating PresentationTool App Control at Instance ' + gdo.controlId);
}