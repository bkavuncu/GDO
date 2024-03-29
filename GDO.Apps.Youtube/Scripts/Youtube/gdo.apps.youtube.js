﻿gdo.net.app["Youtube"].lastState = -1;
gdo.net.app["Youtube"].bufferSeconds = 100;

$(function () {
    gdo.consoleOut('.Youtube', 1, 'Loaded Youtube JS');

    $.connection.youtubeAppHub.client.receiveURL = function (instanceId, url) {
        $("iframe").contents().find("#youtube_player").hide();
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.consoleOut('.Youtube', 1, 'Instance - ' + instanceId + ": Received URL : " + url);
            // This is to let the system load the default URL instead of
            // replacing it with this blank URL.
            if (url != 'https://www.youtube.com/watch?v=') {
                $("iframe").contents().find('#url_input').val(url);
            }
            $("iframe").contents().find("#control_buttons").hide();
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.Youtube', 1, 'Instance - ' + instanceId + ": Received URL : " + url);
            $("iframe").contents().find("#wrapper")
                .css("width", gdo.net.section[gdo.net.instance[instanceId].sectionId].width / gdo.net.section[gdo.net.instance[instanceId].sectionId].cols + "px")
                .css("height", gdo.net.section[gdo.net.instance[instanceId].sectionId].height / gdo.net.section[gdo.net.instance[instanceId].sectionId].rows + "px");

            var scale;
            var offsetX;
            var offsetY;
            var origin;
            var width;
            var height;

            if (gdo.net.section[gdo.net.instance[instanceId].sectionId].cols > 1) {
                scale = "scale(" + gdo.net.section[gdo.net.instance[instanceId].sectionId].cols + ")";
            } else {
                scale = "scale(1.01)";
            }

            if (gdo.net.section[gdo.net.instance[instanceId].sectionId].cols > gdo.net.section[gdo.net.instance[instanceId].sectionId].rows) {

                offsetX = gdo.net.node[gdo.clientId].sectionCol * (100 / (gdo.net.section[gdo.net.instance[instanceId].sectionId].cols - 1));
                offsetY = gdo.net.node[gdo.clientId].sectionRow * (100 / (gdo.net.section[gdo.net.instance[instanceId].sectionId].rows + (gdo.net.section[gdo.net.instance[instanceId].sectionId].cols - gdo.net.section[gdo.net.instance[instanceId].sectionId].rows) - 1));
                origin = offsetX + "% " + offsetY + "%";
                width = gdo.net.section[gdo.net.instance[instanceId].sectionId].width / gdo.net.section[gdo.net.instance[instanceId].sectionId].cols;
                height = gdo.net.section[gdo.net.instance[instanceId].sectionId].height / gdo.net.section[gdo.net.instance[instanceId].sectionId].rows;

            } else if (gdo.net.section[gdo.net.instance[instanceId].sectionId].cols < gdo.net.section[gdo.net.instance[instanceId].sectionId].rows) {

                if (gdo.net.section[gdo.net.instance[instanceId].sectionId].cols == 1) {
                    offsetX = gdo.net.node[gdo.clientId].sectionCol * (100 / (gdo.net.section[gdo.net.instance[instanceId].sectionId].cols));
                    offsetY = 100 * gdo.net.node[gdo.clientId].sectionRow * (100 / (gdo.net.section[gdo.net.instance[instanceId].sectionId].rows * (gdo.net.section[gdo.net.instance[instanceId].sectionId].cols)));
                } else {
                    offsetX = gdo.net.node[gdo.clientId].sectionCol * (100 / (gdo.net.section[gdo.net.instance[instanceId].sectionId].cols - 1));
                    offsetY = gdo.net.node[gdo.clientId].sectionRow * (100 / (gdo.net.section[gdo.net.instance[instanceId].sectionId].rows * (gdo.net.section[gdo.net.instance[instanceId].sectionId].cols - 1)));
                }
                origin = offsetX + "% " + offsetY + "%";
                vwidth = gdo.net.section[gdo.net.instance[instanceId].sectionId].width / gdo.net.section[gdo.net.instance[instanceId].sectionId].cols;
                height = gdo.net.section[gdo.net.instance[instanceId].sectionId].height;

            } else {

                offsetX = gdo.net.node[gdo.clientId].sectionCol * (100 / (gdo.net.section[gdo.net.instance[instanceId].sectionId].cols - 1));
                offsetY = gdo.net.node[gdo.clientId].sectionRow * (100 / (gdo.net.section[gdo.net.instance[instanceId].sectionId].rows - 1));
                origin = offsetX + "% " + offsetY + "%";
                width = gdo.net.section[gdo.net.instance[instanceId].sectionId].width / gdo.net.section[gdo.net.instance[instanceId].sectionId].cols;
                height = gdo.net.section[gdo.net.instance[instanceId].sectionId].height / gdo.net.section[gdo.net.instance[instanceId].sectionId].rows;
            }
            gdo.consoleOut('.Youtube', 4, origin);
            $("iframe").contents().find("#youtube_player")
                .css("zoom", 1)
                .css("-moz-transform", scale)
                .css("-moz-transform-origin", origin)
                .css("-o-transform", scale)
                .css("-o-transform-origin", origin)
                .css("-webkit-transform", scale)
                .css("-webkit-transform-origin", origin)
                .css("width", width + "px")
                .css("height", height + "px");
        }
        // $("iframe").contents().find("#youtube_player").attr("src", "http://www.youtube.com/embed/" + url.substring(32, 100) + "?autoplay=0&showinfo=0&controls=0");
        gdo.net.instance[instanceId].youtubePlayer.loadVideoByUrl("http://www.youtube.com/embed/" + url.substring(32, 100), 0, "highres");
        $("iframe").contents().find("#youtube_overlay").css("display", "block");
        setTimeout(function () {
            //gdo.net.app["Youtube"].server.stopVideo(instanceId);
            gdo.net.instance[instanceId].youtubePlayer.setPlaybackQuality(instanceId, "highres");
            var rates = gdo.net.instance[instanceId].youtubePlayer.getAvailablePlaybackRates();
            var rate = 1;
            for (var i = 0, len = rates.length; i < len; i++) {
                if (rates[i] > rate) {
                    rate = rates[i];
                }
            }
            gdo.net.instance[instanceId].youtubePlayer.setPlaybackRate(rate);
            gdo.consoleOut('.Youtube', 0, 'Loaded URL:' + url + " with title " + gdo.net.instance[instanceId].youtubePlayer.getVideoData().title);
        }, 500);
        gdo.net.app["Youtube"].refresh(instanceId);

    }
    $.connection.youtubeAppHub.client.playVideo = function (instanceId, time) {
        gdo.consoleOut('.Youtube', 0, "Play Command Received " + time);
        // if (gdo.net.instance[instanceId].youtubePlayer.getPlayerState() == 3) {
        //gdo.net.app["Youtube"].server.seekTo(instanceId, gdo.net.instance[instanceId].youtubePlayer.getCurrentTime(), true);
        //    gdo.net.instance[instanceId].youtubePlayer.playVideo();
        //} else {
        gdo.net.setTimeout(function () { gdo.net.instance[instanceId].youtubePlayer.playVideo(); }, time);
        gdo.net.app["Youtube"].refresh(instanceId);
        //}
    }

    $.connection.youtubeAppHub.client.seekTo = function (instanceId, seconds, allowSeekAhead, time) {
        gdo.consoleOut('.Youtube', 0, "Seek Command Received " + seconds);
        if (seconds == 0) {
            seconds = 0.01;
        }
        gdo.net.setTimeout(function () { gdo.net.instance[instanceId].youtubePlayer.seekTo(seconds, allowSeekAhead); }, time);
        gdo.net.app["Youtube"].refresh(instanceId);
        //gdo.net.instance[instanceId].youtubePlayer.seekTo(seconds, allowSeekAhead);
    }

    $.connection.youtubeAppHub.client.pauseVideo = function (instanceId, time) {
        gdo.consoleOut('.Youtube', 4, "Pause Command Received");
        gdo.net.setTimeout(function () { gdo.net.instance[instanceId].youtubePlayer.pauseVideo(); }, time);
        gdo.net.app["Youtube"].refresh(instanceId);
    }

    $.connection.youtubeAppHub.client.stopVideo = function (instanceId) {
        gdo.consoleOut('.Youtube', 5, "Stop Command Received");
        gdo.net.instance[instanceId].youtubePlayer.stopVideo();
        gdo.net.app["Youtube"].refresh(instanceId);
    }

    $.connection.youtubeAppHub.client.setPlaybackQuality = function (instanceId, quality) {
        gdo.consoleOut('.Youtube', 1, "Setting Playback Quality to " + quality);
        gdo.net.instance[instanceId].youtubePlayer.setPlaybackQuality(quality);
        gdo.net.app["Youtube"].refresh(instanceId);
    }

    $.connection.youtubeAppHub.client.bufferComplete = function (instanceId) {
        gdo.net.instance[instanceId].youtubePlayer.stopVideo();
        gdo.net.instance[instanceId].youtubePlayer.setPlaybackRate(1);
        $("iframe").contents().find("#youtube_player").show();
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            $("iframe").contents().find("#control_buttons").show();
        }
        gdo.net.app["Youtube"].refresh(instanceId);
    }
});

gdo.net.app["Youtube"].refresh = function (instanceId) {
    gdo.checkpoint(instanceId);
    if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
        var scale;
        if (gdo.net.section[gdo.net.instance[instanceId].sectionId].cols > 1) {
            scale = "scale(" + gdo.net.section[gdo.net.instance[instanceId].sectionId].cols + ")";
        } else {
            scale = "scale(1.001)";
        }
        var dscale;
        if (gdo.net.section[gdo.net.instance[instanceId].sectionId].cols > 1) {
            dscale = "scale(" + (gdo.net.section[gdo.net.instance[instanceId].sectionId].cols - 0.001) + ")";
        } else {
            dscale = "scale(1.00)";
        }
        $("iframe").contents().find("#youtube_player")
            .css("zoom", 1)
            .css("-moz-transform", dscale)
            .css("-o-transform", dscale)
            .css("-webkit-transform", dscale);
        setTimeout(function () {
            $("iframe").contents().find("#youtube_player")
                .css("zoom", 1)
                .css("-moz-transform", scale)
                .css("-o-transform", scale)
                .css("-webkit-transform", scale);
        }, 1000);
    }
}

gdo.net.app["Youtube"].initClient = function () {
    gdo.consoleOut('.Youtube', 1, 'Initializing Youtube App Client at Node ' + gdo.clientId);
    setTimeout(function () { gdo.net.app["Youtube"].server.requestURL(gdo.net.node[gdo.clientId].appInstanceId); }, 700);
    gdo.net.app["Youtube"].updateBufferStatus(gdo.net.node[gdo.clientId].appInstanceId);
}

gdo.net.app["Youtube"].initControl = function (controlId) {
    gdo.net.app["Youtube"].server.requestURL(controlId);

    gdo.consoleOut('.Youtube', 1, 'Initializing Youtube App Control at Instance ' + controlId);
    gdo.net.app["Youtube"].server.joinGroup(controlId);
    gdo.net.app["Youtube"].updateTitle(controlId);


    $("iframe").contents().find("#url_submit")
    .unbind()
    .click(function () {
        gdo.consoleOut('.Youtube', 1, 'Sending URL to Clients :' + $("iframe").contents().find('#url_input').val());
        gdo.net.app["Youtube"].server.setURL(gdo.controlId, $("iframe").contents().find('#url_input').val());
    });
    $("iframe").contents().find("#playButton").unbind().click(function () {
        gdo.consoleOut('.Youtube', 0, "Sending Play Command");
        //gdo.net.app["Youtube"].server.seekTo(gdo.controlId, gdo.net.instance[gdo.controlId].youtubePlayer.getCurrentTime(), true, gdo.net.time.getTime() + 350);
        //gdo.net.app["Youtube"].server.playVideo(gdo.controlId, gdo.net.time.getTime() + 700);
        var amount = gdo.net.instance[gdo.controlId].youtubePlayer.getCurrentTime() + gdo.net.instance[gdo.controlId].youtubePlayer.getDuration() / 100;
        //gdo.consoleOut('.Youtube', 0, "Sending Forward Command with " + amount);
        gdo.net.app["Youtube"].server.playVideo(gdo.controlId, gdo.net.time.getTime() + 350);
        setTimeout(function () { gdo.net.app["Youtube"].server.seekTo(gdo.controlId, amount, true, gdo.net.time.getTime() + 350); }, 700);
    });

    $("iframe").contents().find("#pauseButton").unbind().click(function () {
        gdo.consoleOut('.Youtube', 4, "Sending Pause Command");
        gdo.net.app["Youtube"].server.pauseVideo(gdo.controlId, gdo.net.time.getTime() + 350);
    });

    $("iframe").contents().find("#stopButton").unbind().click(function () {
        gdo.consoleOut('.Youtube', 5, "Sending Stop Command");
        gdo.net.app["Youtube"].server.stopVideo(gdo.controlId);
    });

    $("iframe").contents().find("#backwardButton").unbind().click(function () {
        var amount = gdo.net.instance[gdo.controlId].youtubePlayer.getCurrentTime() - gdo.net.instance[gdo.controlId].youtubePlayer.getDuration() / 100;
        gdo.consoleOut('.Youtube', 0, "Sending Backward Command with " + amount);
        gdo.net.app["Youtube"].server.seekTo(gdo.controlId, amount, true, gdo.net.time.getTime() + 350);
    });

    $("iframe").contents().find("#forwardButton").unbind().click(function () {
        var amount = gdo.net.instance[gdo.controlId].youtubePlayer.getCurrentTime() + gdo.net.instance[gdo.controlId].youtubePlayer.getDuration() / 100;
        gdo.consoleOut('.Youtube', 0, "Sending Forward Command with " + amount);
        gdo.net.app["Youtube"].server.seekTo(gdo.controlId, amount, true, gdo.net.time.getTime() + 350);
    });

    $("iframe").contents().find("#fastBackwardButton").unbind().click(function () {
        var amount = gdo.net.instance[gdo.controlId].youtubePlayer.getCurrentTime() - gdo.net.instance[gdo.controlId].youtubePlayer.getDuration() / 10;
        gdo.consoleOut('.Youtube', 0, "Sending Fast Backward Command with " + amount);
        gdo.net.app["Youtube"].server.seekTo(gdo.controlId, amount, true, gdo.net.time.getTime() + 350);
    });

    $("iframe").contents().find("#fastForwardButton").unbind().click(function () {
        var amount = gdo.net.instance[gdo.controlId].youtubePlayer.getCurrentTime() + gdo.net.instance[gdo.controlId].youtubePlayer.getDuration() / 10;
        gdo.consoleOut('.Youtube', 0, "Sending Fast Forward Command with " + amount);
        gdo.net.app["Youtube"].server.seekTo(gdo.controlId, amount, true, gdo.net.time.getTime() + 350);
    });

}
gdo.net.app["Youtube"].updateBufferStatus = function (instanceId) {
    setTimeout(function () {
        try {
            if (gdo.net.instance[instanceId].youtubePlayer != null && gdo.net.instance[instanceId].youtubePlayer.getDuration() > 0) {
                //var bufferPercentage = gdo.net.app["Youtube"].bufferSeconds / gdo.net.instance[instanceId].youtubePlayer.getDuration();
                var loadPercentage = (gdo.net.instance[instanceId].youtubePlayer.getVideoBytesLoaded() * 100) / gdo.net.instance[instanceId].youtubePlayer.getVideoBytesTotal();
                gdo.net.app["Youtube"].server.registerBufferStatus(instanceId, parseInt(loadPercentage), gdo.net.node[gdo.clientId].sectionCol, gdo.net.node[gdo.clientId].sectionRow);
            }
        } catch (err) {

        }
        gdo.net.app["Youtube"].updateBufferStatus(instanceId);
    }, 700);
}

gdo.net.app["Youtube"].updateTitle = function (instanceId) {
    setTimeout(function () {
        try {
            if (gdo.net.instance[instanceId].youtubePlayer != null && gdo.net.instance[instanceId].youtubePlayer.getDuration() > 0) {
                if ($("iframe").contents().find("#youtube_player").is(":visible")) {
                    $("iframe").contents().find("#youtube_duration").empty().append("<h6>&nbsp;" + parseInt(gdo.net.instance[instanceId].youtubePlayer.getCurrentTime()) + "/" + parseInt(gdo.net.instance[instanceId].youtubePlayer.getDuration()) + " seconds</h6>");
                } else {
                    $("iframe").contents().find("#youtube_duration").empty().append("<h6>&nbsp;Buffering " + parseInt((gdo.net.instance[instanceId].youtubePlayer.getVideoBytesLoaded() * 100) / gdo.net.instance[instanceId].youtubePlayer.getVideoBytesTotal()) + "%</h6>");
                }
                $("iframe").contents().find("#youtube_title").empty().append("<h6><i class='fa  fa-youtube  fa-fw'></i>&nbsp;" + gdo.net.instance[instanceId].youtubePlayer.getVideoData().title + "</h6>");

            }
        } catch (err) {

        }
        gdo.net.app["Youtube"].updateTitle(instanceId);
    }, 700);
}

gdo.net.app["Youtube"].stateChange = function (event) {
    var instanceId;
    if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
        instanceId = gdo.controlId;
    } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
        instanceId = gdo.net.node[gdo.clientId].appInstanceId;
    }
    switch (event.data) {
        case -1:
            gdo.consoleOut('.Youtube', 2, 'State Changed to Unstarted');
            break;
        case 0:
            gdo.consoleOut('.Youtube', 2, 'State Changed to Ended');
            break;
        case 1:
            gdo.consoleOut('.Youtube', 2, 'State Changed to Playing');
            if (gdo.net.app["Youtube"].lastState == 3) {
                //gdo.net.app["Youtube"].server.seekTo(instanceId, gdo.net.instance[instanceId].youtubePlayer.getCurrentTime(), true);
                //gdo.net.app["Youtube"].lastState = 1;
            }
            break;
        case 2:
            gdo.consoleOut('.Youtube', 2, 'State Changed to Paused');
            break;
        case 3:
            gdo.consoleOut('.Youtube', 2, 'State Changed to Buffering');
            //gdo.net.app["Youtube"].server.seekTo(instanceId, gdo.net.instance[instanceId].youtubePlayer.getCurrentTime(), true);
            //gdo.net.app["Youtube"].lastState = 3;
            //gdo.net.app["Youtube"].server.seekTo(instanceId, gdo.net.instance[instanceId].youtubePlayer.getCurrentTime(), true);
            break;
        case 5:
            gdo.consoleOut('.Youtube', 2, 'State Changed to Video Cued');
            break;
        default:
            //
            break;
    }
}

gdo.net.app["Youtube"].terminateClient = function () {
    gdo.consoleOut('.Youtube', 1, 'Terminating Youtube App Client at Node ' + clientId);
}

gdo.net.app["Youtube"].ternminateControl = function () {
    gdo.consoleOut('.Youtube', 1, 'Terminating Youtube App Control at Instance ' + gdo.controlId);
}

gdo.net.app["Youtube"].playVideo = function () {
    var instanceId;
    if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
        instanceId = gdo.controlId;
    } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
        instanceId = gdo.net.node[gdo.clientId].appInstanceId;
    }
    gdo.net.instance[instanceId].youtubePlayer.playVideo();
}
