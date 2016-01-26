$(function () {
    gdo.consoleOut('.EyeTracking', 1, 'Loaded EyeTracking JS');
});


gdo.net.app["EyeTracking"].initControl = function () {
    gdo.consoleOut('.EyeTracking', 1, 'Initializing EyeTracking Module Control');
}

gdo.net.app["EyeTracking"].ternminateControl = function () {
    gdo.consoleOut('.EyeTracking', 1, 'Terminating EyeTracking Module Control');
}
