gdo.updateDisplayCanvas = function () {
    gdo.net.app["PresentationTool"].drawSectionTable();
    gdo.net.app["PresentationTool"].drawButtonTable();
}

//template list click
$("iframe").contents().find('#template_list').on('click', 'li', function () {
    gdo.net.app["PresentationTool"].template = $(this).index() + 1;
})

// keywords submit click 
$("iframe").contents().find('#update_url_submit').on('click', function () {
    gdo.net.app["PresentationTool"].selectedResource = $("iframe").contents().find('#new_url').val();
    gdo.net.app["PresentationTool"].selectedAppName = "Youtube";
    gdo.updateDisplayCanvas();
}).on('blur', function (e) {
    if ($(e.relatedTarget).attr('id') == 'deploy-app-button')
        return;
    gdo.net.app["PresentationTool"].selectedResource = null;
    gdo.net.app["PresentationTool"].selectedAppName = null;
    gdo.updateDisplayCanvas();
});

//file ppt list click
$("iframe").contents().find('#item_ppts').on('click', 'li', function () {
    gdo.net.app["PresentationTool"].selectedResource = "Files/PPTs/" + $(this).text();
    gdo.net.app["PresentationTool"].selectedAppName = "Images";
    $("iframe").contents().find('#img_preview')
        .empty()
        .append("<img style= 'height: 100%; width: 100%' src='" + gdo.net.app["PresentationTool"].selectedResource + "'/>");
    gdo.updateDisplayCanvas();
}).on('blur', function (e) {
    if ($(e.relatedTarget).attr('id') == 'deploy-app-button')
        return;
    gdo.net.app["PresentationTool"].selectedResource = null;
    gdo.net.app["PresentationTool"].selectedAppName = null;
    gdo.updateDisplayCanvas();
});
    
//file image list click
$("iframe").contents().find('#item_images').on('click', 'li', function () {
    gdo.net.app["PresentationTool"].selectedResource = "Files/Images/" + $(this).text();
    gdo.net.app["PresentationTool"].selectedAppName = "Images";
    $("iframe").contents().find('#img_preview')
        .empty()
        .append("<img style= 'height: 100%; width: 100%' src='" + gdo.net.app["PresentationTool"].selectedResource + "'/>");
    gdo.updateDisplayCanvas();
}).on('blur', function (e) {
    if ($(e.relatedTarget).attr('id') == 'deploy-app-button')
        return;
    gdo.net.app["PresentationTool"].selectedResource = null;
    gdo.net.app["PresentationTool"].selectedAppName = null;
    gdo.updateDisplayCanvas();
});


//Image Control
if (gdo.management.sections.selectedSection !== -1 && gdo.net.section[gdo.management.sections.selectedSection].appName === "Images") {
    gdo.net.app["PresentationTool"].img_control_enable = 1;
    gdo.net.app["PresentationTool"].img_control_status = 0;
    $("iframe").contents().find('#img_preview')
        .empty()
        .append("<img style= 'height: 100%; width: 100%' src='" + gdo.net.section[gdo.management.sections.selectedSection].src + "'/>");
    $("iframe").contents().find("#img_control").removeClass("btn-primary").removeClass("btn-success").addClass("btn-primary");
} else {
    gdo.net.app["PresentationTool"].img_control_enable = 0;
    if (gdo.net.app["PresentationTool"].selectedResource === null) {
        $("iframe").contents().find('#img_preview').empty();
    }
    $("iframe").contents().find("#img_control").removeClass("btn-primary").removeClass("btn-success").addClass("btn-primary");
}

$("iframe").contents().find("#img_restore").unbind().click(function () {
    if (gdo.net.app["PresentationTool"].isPlaying === 0) return;
    if (gdo.net.app["PresentationTool"].img_control_status === 1 && gdo.net.app["PresentationTool"].img_control_enable === 1) {
        var instanceId = gdo.net.app["PresentationTool"].section[gdo.management.sections.selectedSection].appInstanceId;
        var realInstanceId = gdo.net.app["PresentationTool"].section[gdo.management.sections.selectedSection].realInstanceId;
        $("iframe").contents().find("#img_control").click();
        $("iframe").contents().find("#img_control").click();
        gdo.net.app["PresentationTool"].playInstance(realInstanceId);
    }
});
    
// Video control
if (gdo.management.sections.selectedSection !== -1 && gdo.net.app["PresentationTool"].section[gdo.management.sections.selectedSection].appName === "Youtube") {
    gdo.net.app["PresentationTool"].video_control_enable = 1;
    gdo.net.app["PresentationTool"].video_control_status = 0;
    $("iframe").contents().find("#video_control").removeClass("btn-primary").removeClass("btn-success").addClass("btn-primary");
} else {
    gdo.net.app["PresentationTool"].video_control_enable = 0;
    $("iframe").contents().find("#video_control").removeClass("btn-primary").removeClass("btn-success").addClass("btn-primary");
}
$("iframe").contents().find("#video_control").unbind().click(function () {
    if (gdo.net.app["PresentationTool"].isPlaying === 0) return;
    if (gdo.net.app["PresentationTool"].video_control_enable === 0) return;
    gdo.net.app["PresentationTool"].video_control_status = 1 - gdo.net.app["PresentationTool"].video_control_status;
    if (gdo.net.app["PresentationTool"].video_control_status === 0) {
        $(this).removeClass("btn-primary").removeClass("btn-success").addClass("btn-primary");
        $("#hidden_app_iframe").attr('src', '');
        return;
    }
    $(this).removeClass("btn-primary").removeClass("btn-success").addClass("btn-success");
    if (gdo.net.app["PresentationTool"].video_control_status === 1 && gdo.net.app["PresentationTool"].video_control_enable === 1) {
        var instanceId = gdo.net.section[gdo.management.sections.selectedSection].appInstanceId;
        var realInstanceId = gdo.net.section[gdo.management.sections.selectedSection].realInstanceId;
        gdo.net.app["PresentationTool"].playInstance(realInstanceId);
    }
});

// Playbutton
if (gdo.net.app["PresentationTool"].isPlaying === 0) {
    gdo.net.app["PresentationTool"].currentSlideSection = [];
    gdo.net.app["PresentationTool"].currentPlayingIndex = 0;
    $("iframe").contents().find("#play_slide").removeClass("btn-primary").removeClass("btn-success").addClass("btn-primary");
    $("iframe").contents().find("#next_slide").removeClass("btn-primary").removeClass("btn-success").addClass("btn-primary");
    $("iframe").contents().find("#previous_slide").removeClass("btn-primary").removeClass("btn-success").addClass("btn-primary");
} else {
    $("iframe").contents().find("#play_slide").removeClass("btn-primary").removeClass("btn-success").addClass("btn-success");
    $("iframe").contents().find("#next_slide").removeClass("btn-primary").removeClass("btn-success").addClass("btn-success");
    $("iframe").contents().find("#previous_slide").removeClass("btn-primary").removeClass("btn-success").addClass("btn-success");
}



