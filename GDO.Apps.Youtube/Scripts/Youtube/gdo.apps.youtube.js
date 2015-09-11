
$(function() {
    gdo.consoleOut('.Youtube', 1, 'Loaded Image Tiles JS');
    $.connection.youtubeAppHub.client.updateKeywords = function (message) {
        gdo.consoleOut('.Youtube', 1, 'Current Channel Name: ' + message);
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            $("iframe").contents().find("#current_keyword").html(message);
            gdo.consoleOut('.Youtube', 1, 'Getting videos from Youtube');
            if (gdo.net.app["Youtube"].searchMode == 0) {
                gdo.net.app["Youtube"].server.getNextVideos(gdo.controlId);
            } else if (gdo.net.app["Youtube"].searchMode == 1) {
                gdo.net.app["Youtube"].server.getNextVideosByKeywords(gdo.controlId);
            }
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            // do nothing
        }
    }
    $.connection.youtubeAppHub.client.setKeywords = function (message) {
        gdo.consoleOut('.Youtube', 1, 'Default Input Channel Name: ' + message);
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            $("iframe").contents().find("#new_keyword").val(message);
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            // do nothing
        }
    }
    $.connection.youtubeAppHub.client.setMessage = function(message) {
        gdo.consoleOut('.Youtube', 1, 'Message from server: ' + message);
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            $("iframe").contents().find("#message_from_server").html(message);
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            // do nothing
        }
    }
    $.connection.youtubeAppHub.client.videoReady = function (first) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            if (first === 1) {
                gdo.consoleOut('.Youtube', 1, 'Getting videos from Youtube');
                if (gdo.net.app["Youtube"].searchMode == 0) {
                    gdo.net.app["Youtube"].server.getNextVideos(gdo.controlId);
                } else if (gdo.net.app["Youtube"].searchMode == 1) {
                    gdo.net.app["Youtube"].server.getNextVideosByKeywords(gdo.controlId);
                }
            } else {
                gdo.consoleOut('.Youtube', 1, 'Videos are ready and Clients are requesting from server');
                gdo.net.app["Youtube"].server.requestVideoName(gdo.controlId);
                $("iframe").contents().find("#get_next_videos").prop("disabled", false);
            }
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE &&　first == 0) {
            gdo.consoleOut('.Youtube', 1, 'Fetching video ');
            gdo.net.app["Youtube"].server.requestVideoUrls(gdo.net.node[gdo.clientId].appInstanceId,
                                                           gdo.net.node[gdo.clientId].sectionCol,
                                                           gdo.net.node[gdo.clientId].sectionRow);
        }
    }
    $.connection.youtubeAppHub.client.updateVideo = function (videoUrl) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            // do nothing
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.Youtube', 1, 'Update video url ');
            $("iframe").contents().find("#ytplayer").attr("src", videoUrl);
        }
    }
    $.connection.youtubeAppHub.client.updateVideoList = function (videoName) {
        videoName = JSON.parse(videoName);
        $("iframe").contents().find("#video_table tr").remove();
        $("iframe").contents().find("#video_table").append('' +
            '<tr id="video_table_title">' +
                '<td><font size="3"><b>Rank</b></font></td>' +
                '<td><font size="3"><b>Current Videos</b></font></td>' +
                '<td><font size="3"><b>Next Videos</b></font></td>' +
            '</tr>');
        for (var i = 0; i < videoName.length; i++) {
            $("iframe").contents().find("#video_table").append('' +
                '<tr class="video_table_content">' +
                    '<td><font size="3">' + (i + 1) + '</font></td>' +
                    '<td><font size="3">' + videoName[i]["currentName"] + '</font></td>' +
                    '<td><font size="3">' + videoName[i]["nextName"] + '</font></td>' +
                '</tr>');
        }
    }
    $.connection.youtubeAppHub.client.updateSearchMode = function(search_mode) {
        gdo.net.app["Youtube"].searchMode = search_mode;
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

gdo.net.app["Youtube"].searchMode = 0;

gdo.net.app["Youtube"].initClient = function () {
    gdo.consoleOut('.Youtube', 1, 'Initializing Image Tiles App Client at Node ' + gdo.clientId);
    gdo.net.app["Youtube"].server.requestVideoUrls(gdo.net.node[gdo.clientId].appInstanceId,
                                                   gdo.net.node[gdo.clientId].sectionCol,
                                                   gdo.net.node[gdo.clientId].sectionRow);
}

gdo.net.app["Youtube"].initControl = function () {
    gdo.controlId = getUrlVar("controlId");
    $("iframe").contents().find("#get_next_videos").prop("disabled", true);
    gdo.consoleOut('.Youtube', 1, 'Initializing Youtube App Control at Instance ' + gdo.controlId);
    gdo.net.app["Youtube"].server.requestSearchMode(gdo.controlId);
    gdo.net.app["Youtube"].server.requestVideoName(gdo.controlId);
}

gdo.net.app["Youtube"].terminateClient = function () {
    gdo.consoleOut('.Youtube', 1, 'Terminating Youtube App Client at Node ' + gdo.clientId);
}

gdo.net.app["Youtube"].ternminateControl = function () {
    gdo.consoleOut('.Youtube', 1, 'Terminating Youtube App Control at Instance ' + gdo.controlId);
}

