$(function () {
    gdo.consoleOut('.EyeTracking', 1, 'Loaded EyeTracking JS');
    $(document).ready(function () {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            $("#nav_buttons tr:first").prepend("<td><button type='button' id='qrButton' class='btn btn-primary'><i class='fa  fa-qrcode fa-fw'></i>&nbsp;<font color='#fff'>QR Codes</font></button></td>");
        }
    });

    $.connection.eyeTrackingModuleHub.client.updateQRCodeMode = function (mode) {
        gdo.consoleOut('.EyeTracking', 1, 'QRCode Mode: ' + mode);
        gdo.net.module["EyeTracking"].qrCodeMode = mode;
        gdo.net.module["EyeTracking"].updateButtons();
    }
});



gdo.net.module["EyeTracking"].initModule = function () {
    gdo.consoleOut('.EyeTracking', 1, 'Initializing EyeTracking Module');
    gdo.net.module["EyeTracking"].server.requestQRCodeMode();
}

gdo.net.module["EyeTracking"].initControl = function () {
    gdo.consoleOut('.EyeTracking', 1, 'Initializing EyeTracking Module Control');

}

gdo.net.module["EyeTracking"].ternminateControl = function () {
    gdo.consoleOut('.EyeTracking', 1, 'Terminating EyeTracking Module Control');
}

gdo.net.module["EyeTracking"].updateButtons = function () {
    if (gdo.net.module["EyeTracking"].qrCodeMode) {
        $("#qrButton")
            .empty()
            .removeClass("btn-primary")
            .removeClass("btn-danger")
            .addClass("btn-success")
            .append("<i class='fa  fa-qrcode fa-fw'></i>&nbsp;QR Codes ON");
    } else {
        $("#qrButton")
            .empty()
            .removeClass("btn-primary")
            .removeClass("btn-success")
            .addClass("btn-danger")
            .append("<i class='fa  fa-qrcode fa-fw'></i>&nbsp;QR Codes OFF");
    }
    $("#qrButton")
        .unbind()
        .click(function () {
            if (gdo.net.module["EyeTracking"].qrCodeMode) {
                gdo.net.module["EyeTracking"].qrCodeMode = false;
            } else {
                gdo.net.module["EyeTracking"].qrCodeMode = true;
            }
            gdo.updateDisplayCanvas();
            gdo.net.module["EyeTracking"].server.setQRCodeMode(gdo.net.module["EyeTracking"].qrCodeMode);
        });
}