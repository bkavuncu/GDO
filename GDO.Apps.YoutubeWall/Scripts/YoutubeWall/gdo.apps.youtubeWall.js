
$(function() {
    gdo.consoleOut('.YoutubeWall', 1, 'Loaded Youtube JS');
    $.connection.youtubeWallAppHub.client.updateKeywords = function (message) {
        gdo.consoleOut('.YoutubeWall', 1, 'Current Channel Name: ' + message);
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            $("iframe").contents().find("#current_keyword").html(message);
            gdo.consoleOut('.YoutubeWall', 1, 'Getting videos from Youtube');
            if (gdo.net.app["YoutubeWall"].searchMode == 0) {
                gdo.net.app["YoutubeWall"].server.getNextVideos(gdo.controlId);
            } else if (gdo.net.app["YoutubeWall"].searchMode == 1) {
                gdo.net.app["YoutubeWall"].server.getNextVideosByKeywords(gdo.controlId);
            }
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            // do nothing
        }
    }
    $.connection.youtubeWallAppHub.client.setKeywords = function (message) {
        gdo.consoleOut('.YoutubeWall', 1, 'Default Input Channel Name: ' + message);
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            $("iframe").contents().find("#new_keyword").val(message);
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            // do nothing
        }
    }
    $.connection.youtubeWallAppHub.client.setMessage = function(message) {
        gdo.consoleOut('.YoutubeWall', 1, 'Message from server: ' + message);
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            $("iframe").contents().find("#message_from_server").html(message);
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            // do nothing
        }
    }
    $.connection.youtubeWallAppHub.client.videoReady = function (first) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            if (first === 1) {
                gdo.consoleOut('.YoutubeWall', 1, 'Getting videos from Youtube');
                if (gdo.net.app["YoutubeWall"].searchMode == 0) {
                    gdo.net.app["YoutubeWall"].server.getNextVideos(gdo.controlId);
                } else if (gdo.net.app["YoutubeWall"].searchMode == 1) {
                    gdo.net.app["YoutubeWall"].server.getNextVideosByKeywords(gdo.controlId);
                }
            } else {
                gdo.consoleOut('.YoutubeWall', 1, 'Videos are ready and Clients are requesting from server');
                gdo.net.app["YoutubeWall"].server.requestVideoName(gdo.controlId);
                $("iframe").contents().find("#get_next_videos").prop("disabled", false);
            }
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE &&　first == 0) {
            gdo.consoleOut('.YoutubeWall', 1, 'Fetching video ');
            gdo.net.app["YoutubeWall"].server.requestVideoUrls(gdo.net.node[gdo.clientId].appInstanceId,
                                                           gdo.net.node[gdo.clientId].sectionCol,
                                                           gdo.net.node[gdo.clientId].sectionRow);
        }
    }
    $.connection.youtubeWallAppHub.client.updateVideo = function (videoUrl) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            // do nothing
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.YoutubeWall', 1, 'Update video url ');
            //$("iframe").contents().find("#ytplayer").attr("src", videoUrl);  //old code

            //load new video and mute it
            var player = gdo.net.node[gdo.clientId].player;
            player.loadVideoByUrl(videoUrl);  
            player.mute();
        }
    }
    $.connection.youtubeWallAppHub.client.updateVideoList = function (videoName, instanceId) {
        var instance = gdo.net.section[gdo.net.instance[instanceId].sectionId];
        
        videoName = JSON.parse(videoName);
        $("iframe").contents().find("#video_table tr").remove();
        $("iframe").contents().find("#video_table").append('' +
            '<tr id="video_table_title">' +
                '<td><font size="3"><b>Rank</b></font></td>' +
                '<td><font size="3"><b>Screen</b></font></td>' +
                '<td><font size="3"><b>Current Videos</b></font></td>' +
                '<td><font size="3"><b>Next Videos</b></font></td>' +
            '</tr>');
        for (var i = 0; i < videoName.length; i++) {
            var screenNumber = instance.nodeMap[i % instance.cols][Math.floor(i / instance.cols)];
            $("iframe").contents().find("#video_table").append('' +
                '<tr class="video_table_content">' +
                    '<td><font size="3">' + (i + 1) + '</font></td>' +
                    '<td class="screenSelector"><font size="3">' + screenNumber + '</font></td>' +
                    '<td><font size="3">' + videoName[i]["currentName"] + '</font></td>' +
                    '<td><font size="3">' + videoName[i]["nextName"] + '</font></td>' +
                '</tr>');
        }
    }
    $.connection.youtubeWallAppHub.client.toggleMute = function (screen) {
        if (screen == gdo.clientId) {
            var player = gdo.net.node[gdo.clientId].player;
            player.isMuted() ? player.unMute() : player.mute();
        }
    }
    $.connection.youtubeWallAppHub.client.updateSearchMode = function(search_mode) {
        gdo.net.app["YoutubeWall"].searchMode = search_mode;
        $("iframe").contents().find("#search_mode").val(search_mode);
        if (search_mode == 1) {
            $("iframe").contents().find("#update_keyword_title").empty().append("<h6><i class='fa  fa-youtube fa-fw'></i>&nbsp;Update Keywords</h6>");
            $("iframe").contents().find("#update_keyword_label").empty().append("<h6>Keywords:</h6>");
            $("iframe").contents().find("#search_mode").empty().append("<i class='fa  fa-power-off fa-fw'></i>&nbsp;Activate Channel Mode");
        } else if (search_mode == 0) {
            $("iframe").contents().find("#update_keyword_title").empty().append("<h6><i class='fa  fa-youtube fa-fw'></i>&nbsp;Update Channel</h6>");
            $("iframe").contents().find("#update_keyword_label").empty().append("<h6>Channel:</h6>");
            $("iframe").contents().find("#search_mode").empty().append("<i class='fa  fa-power-off fa-fw'></i>&nbsp;Activate Keywords Mode");
        }
    }
});

gdo.net.app["YoutubeWall"].searchMode = 0;

gdo.net.app["YoutubeWall"].initClient = function () {
    gdo.consoleOut('.YoutubeWall', 1, 'Initializing YoutubeWall App Client at Node ' + gdo.clientId);
    gdo.net.app["YoutubeWall"].server.requestVideoUrls(gdo.net.node[gdo.clientId].appInstanceId,
                                                   gdo.net.node[gdo.clientId].sectionCol,
                                                   gdo.net.node[gdo.clientId].sectionRow);
}

gdo.net.app["YoutubeWall"].initControl = function () {
    gdo.controlId = parseInt(getUrlVar("controlId"));
    $("iframe").contents().find("#get_next_videos").prop("disabled", true);
    gdo.consoleOut('.YoutubeWall', 1, 'Initializing YoutubeWall App Control at Instance ' + gdo.controlId);
    gdo.net.app["YoutubeWall"].server.requestSearchMode(gdo.controlId);
    gdo.net.app["YoutubeWall"].server.requestVideoName(gdo.controlId);
}

gdo.net.app["YoutubeWall"].terminateClient = function () {
    gdo.consoleOut('.YoutubeWall', 1, 'Terminating YoutubeWall App Client at Node ' + gdo.clientId);
}

gdo.net.app["YoutubeWall"].ternminateControl = function () {
    gdo.consoleOut('.YoutubeWall', 1, 'Terminating YoutubeWall App Control at Instance ' + gdo.controlId);
}

