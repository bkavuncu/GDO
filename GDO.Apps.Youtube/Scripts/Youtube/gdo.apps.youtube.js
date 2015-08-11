
$(function() {
    gdo.consoleOut('.Youtube', 1, 'Loaded Image Tiles JS');
    $.connection.youtubeAppHub.client.updateChannelNameResult = function (message) {
        gdo.consoleOut('.Youtube', 1, 'Current Channel Name: ' + message);
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            $("iframe").contents().find("#current_channel_name").html(message);
            gdo.consoleOut('.Youtube', 1, 'Getting videos');
            gdo.net.app["Youtube"].server.getNextVideos(gdo.controlId, 1);
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            // do nothing
        }
    }
    $.connection.youtubeAppHub.client.videoReady = function (first) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            if (first == 1) {
                gdo.consoleOut('.Youtube', 1, 'Getting videos');
                gdo.net.app["Youtube"].server.getNextVideos(gdo.controlId, 0);
            } else {
                gdo.consoleOut('.Youtube', 1, 'Clients are fetching videos');
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
    $.connection.youtubeAppHub.client.updateVideoList = function(videoName) {
        videoName = JSON.parse(videoName);
        $("#video_table > tr").remove();
        $("#video_table").append('<tr id="video_table_title">' +
                                      '<td>Current Videos</td>' +
                                      '<td>Next Videos</td>' +
                                 '</tr>')
        for (i = 0; i < videoName.length; i++) {
            $("#video_table").append('<tr class="video_table_content">' +
                                          '<td>' + videoName["currentName"] + '</td>' +
                                          '<td>' + videoName["nextName"] + '</td>' +
                                     '</tr>')
        }
    }
});

gdo.net.app["Youtube"].initClient = function () {
    gdo.consoleOut('.Youtube', 1, 'Initializing Image Tiles App Client at Node ' + gdo.clientId);
    gdo.net.app["Youtube"].server.requestVideo(gdo.net.node[gdo.clientId].appInstanceId,
                                               gdo.net.node[gdo.clientId].sectionCol,
                                               gdo.net.node[gdo.clientId].sectionRow);
}

gdo.net.app["Youtube"].initControl = function () {
    gdo.controlId = getUrlVar("controlId");
    //gdo.net.app["Youtube"].server.requestImageName(gdo.controlId);
    gdo.consoleOut('.Youtube', 1, 'Initializing Youtube App Control at Instance ' + gdo.controlId);
}

gdo.net.app["Youtube"].terminateClient = function () {
    gdo.consoleOut('.Youtube', 1, 'Terminating Youtube App Client at Node ' + gdo.clientId);
}

gdo.net.app["Youtube"].ternminateControl = function () {
    gdo.consoleOut('.Youtube', 1, 'Terminating Youtube App Control at Instance ' + gdo.controlId);
}

