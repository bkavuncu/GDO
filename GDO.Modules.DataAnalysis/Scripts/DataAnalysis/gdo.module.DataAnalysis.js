// This code was written by Senaka Fernando
//

$(function () {
    gdo.consoleOut('.DataAnalysis', 1, 'Loaded DataAnalysis JS');
});

gdo.net.module["DataAnalysis"].initModule = function () {
    gdo.consoleOut('.DataAnalysis', 1, 'Initializing DataAnalysis Module');
}

gdo.net.module["DataAnalysis"].initControl = function () {
    gdo.consoleOut('.DataAnalysis', 1, 'Initializing DataAnalysis Module Control');
}

gdo.net.module["DataAnalysis"].terminateControl = function () {
    gdo.consoleOut('.DataAnalysis', 1, 'Terminating DataAnalysis Module Control');
}