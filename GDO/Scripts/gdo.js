gdo.CLIENT_MODE = {
    NODE: 1,
    CONTROL: 2
};

gdo.SCRIPT_TYPE = {
    CORE: 1,
    MODULE: 2,
    APP: 3,
    EXTERNAL: 4
};

$(function () {
    /// <summary>
    /// Registering Event Handlers on load
    gdo.loadScript('utilities', 'utilities', gdo.SCRIPT_TYPE.CORE);
    /// </summary>
    /// <returns></returns>
});
gdo.initGDO = function (clientMode) {
    /// <summary>
    /// Initializes the gdo.
    /// </summary>
    /// <returns></returns>
    gdo.consoleOut('', 1, 'Initializing GDO');
    gdo.loadScript('net', 'net', gdo.SCRIPT_TYPE.CORE);
    gdo.clientMode = clientMode;
    gdo.updateInterval = 7700;
    gdo.functions = {};
    gdo.functions.array = {};
    gdo.functions.array.mods = [];
    gdo.functions.array.funcs = [];
    gdo.functions.list = [];
    if (gdo.management == null) {
        gdo.management = {};
    }
    gdo.management.isActive = false;
    if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
        gdo.nodeId = 1;
        gdo.loadScript('management', 'management', gdo.SCRIPT_TYPE.CORE);
    } else {
        $("title").append("" + gdo.clientId);
        gdo.loadScript('node', 'node', gdo.SCRIPT_TYPE.CORE);
        gdo.loadScript('base', 'node', gdo.SCRIPT_TYPE.CORE);
        gdo.loadScript('maintenance', 'maintenance', gdo.SCRIPT_TYPE.CORE);
    }
    if (gdo.clientId > 0) {
        $.connection.hub.start().done(function () {
            gdo.consoleOut('', 0, 'Hub Started');
            gdo.net.initNet(clientMode);
            if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
                waitForResponse(initApp, gdo.net.isNodeInitialized, 500, 20, 'Node Failed to Initialize');
                setTimeout(function() { setInterval(gdo.net.uploadNodeInfo, gdo.updateInterval); }, Math.random() * gdo.updateInterval);
            } else if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
                waitForResponse(initApp, gdo.net.isNodeInitialized, 50, 20, 'Node Failed to Initialize');
                setTimeout(function() { gdo.populateFunctions("gdo", eval("gdo"),0); }, 700 );
            }

            //set intervl and 
            //gdo.net.server.requestAppList();
        });
    }
    //TODO node close connections
    //TODO node send data to peer directly
    //TODO send data to through server
    // send data (data, mode)
}

gdo.consoleOut = function (module, type, msg) {
    /// <summary>
    /// JS Console Output.
    /// </summary>
    /// <param name="module">The module.</param>
    /// <param name="type">The type.</param>
    /// <param name="msg">The MSG.</param>
    /// <returns></returns>
    var moduleBrowser = module;
    var moduleConsole = module;
    if (module.length < 14) {
        for (var i = module.length; i < 14; i++) {
            moduleBrowser = moduleBrowser + "&nbsp;";
            moduleConsole = moduleConsole + " ";
        }
    }
    if ($("#console_area").text().length > 1000000) {
        $("#console_area").empty();
    }
    if (type == 0) {
        if ($("#console_area").length > 0) {
            $("#console_area").append('<div style="color:#77B200; font-size:10; font-family: monospace;">' + gdo.timeStamp() + ' - GDO' + moduleBrowser + '- SUCCESS&nbsp;&nbsp;&nbsp;: ' + msg + "&#10;</div>").scrollTop($("#console_area")[0].scrollHeight);
        }
        console.log(gdo.timeStamp() + ' - GDO' + moduleConsole + ': ' + msg);
    } if (type == 1) {
        if ($("#console_area").length > 0) {
            $("#console_area").append('<div style="color:#4CBFF8; font-size:10; font-family: monospace;">' + gdo.timeStamp() + ' - GDO' + moduleBrowser + '- IMPORTANT&nbsp;: ' + msg + "&#10;</div>").scrollTop($("#console_area")[0].scrollHeight);
        }
        console.log(gdo.timeStamp() + ' - GDO' + moduleConsole + ': ' + msg);
    } if (type == 2) {
        if ($("#console_area").length > 0) {
            $("#console_area").append('<div style="color:#FFF; font-size:10; font-family: monospace;">' + gdo.timeStamp() + ' - GDO' + moduleBrowser + '- INFO&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: ' + msg + "&#10;</div>").scrollTop($("#console_area")[0].scrollHeight);
        }
        console.log(gdo.timeStamp() + ' - GDO' + moduleConsole + ': ' + msg);
    } if (type == 3) {
        if ($("#console_area").length > 0) {
            $("#console_area").append('<div style="color:gray; font-size:10; font-family: monospace;">' + gdo.timeStamp() + ' - GDO' + moduleBrowser + '- MSG&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: ' + msg + "&#10;</div>").scrollTop($("#console_area")[0].scrollHeight);
        }
        console.log(gdo.timeStamp() + ' - GDO' + moduleConsole + ': ' + msg);
    } else if (type == 4) {
        if ($("#console_area").length > 0) {
            $("#console_area").append('<div style="color:#FF9900; font-size:10; font-family: monospace;">' + gdo.timeStamp() + ' - GDO' + moduleBrowser + '- WARN&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: ' + msg + "&#10;</div>").scrollTop($("#console_area")[0].scrollHeight);
        }
        console.warn(gdo.timeStamp() + ' - GDO' + moduleConsole + ': ' + msg);
    } else if (type == 5) {
        if ($("#console_area").length > 0) {
            $("#console_area").append('<div style="color:#FF2200; font-size:10; font-family: monospace;">' + gdo.timeStamp() + ' - GDO' + moduleBrowser + '- ERROR&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: ' + msg + "&#10;</div>").scrollTop($("#console_area")[0].scrollHeight);
        }
        console.error(gdo.timeStamp() + ' - GDO' + moduleConsole + ': ' + msg);
    }
}

gdo.checkpoint = function(number) {
    if ($("#console_area").length > 0) {
        $("#console_area").append('<div style="color:#cc00cc; font-size:10; font-family: monospace;">CHECKPOINT: '+number+'&#10;</div>').scrollTop($("#console_area")[0].scrollHeight);
    }
    console.error("CHECKPOINT: " + number);
}

gdo.loadScript = function (subscript, script, scriptType) {
    /// <summary>
    /// Loads the JS script.
    /// </summary>
    /// <param name="js">The js.</param>
    /// <returns></returns>
    var $head = $('head');
    //gdo.window[js] = {};
    //eval("gdo." + js + " = {}");
    if (scriptType == gdo.SCRIPT_TYPE.CORE) {

        if (subscript == script) {
            gdo.consoleOut('', 1, 'Loading core script ' + script + ' at ' + '../scripts/gdo.' + script + '.js\'');
            $head.append('<script type=\'text/javascript\' src=\'../scripts/gdo.' + script + '.js\'></script>');
        } else {
            gdo.consoleOut('', 1, 'Loading core subscript ' + subscript + ' at of ' + script + ' at ../scripts/gdo.' + script + '.' + subscript + '.js\'');
            $head.append('<script type=\'text/javascript\' src=\'../scripts/gdo.' + script + '.' + subscript + '.js\'></script>');
        }
    } else if (scriptType == gdo.SCRIPT_TYPE.MODULE) {
        if (subscript == script) {
            gdo.consoleOut('', 1, 'Loading module script ' + script + ' at ' + '../scripts/' + script + '/gdo.module.' + script + '.js\'');
            $head.append('<script type=\'text/javascript\' src=\'../scripts/' + script + '/gdo.module.' + script + '.js\'></script>');
        } else {
            gdo.consoleOut('', 1, 'Loading module subscript ' + subscript + ' at of ' + script + ' ../scripts/' + script + '/gdo.module.' + script + '.' + subscript + '.js\'');
            $head.append('<script type=\'text/javascript\' src=\'../scripts/' + script + '/gdo.module.' + script + '.' + subscript + '.js\'></script>');
        }
    } else if (scriptType == gdo.SCRIPT_TYPE.APP) {
        if (subscript == script) {
            gdo.consoleOut('', 1, 'Loading app script ' + script + ' at ' + '../scripts/' + script + '/gdo.app.' + script + '.js\'');
            $head.append('<script type=\'text/javascript\' src=\'../scripts/' + script + '/gdo.apps.' + script + '.js\'></script>');
        } else {
            gdo.consoleOut('', 1, 'Loading app subscript ' + subscript + ' at of ' + script + ' ../scripts/' + script + '/gdo.app.' + script + '.' + subscript + '.js\'');
            $head.append('<script type=\'text/javascript\' src=\'../scripts/' + script + '/gdo.apps.' + script + '.' + subscript + '.js\'></script>');
        }
    } else if (scriptType == gdo.SCRIPT_TYPE.EXTERNAL) {
        gdo.consoleOut('', 1, 'Loading external app script ' + script + ' at ' + '../scripts/' + script + '/' + subscript + '.js\'');
        $head.append('<script type=\'text/javascript\' src=\'../scripts/' + script + '/' + subscript + '.js\'></script>');
    } else {
        gdo.consoleOut('', 5, 'Failed Loading app script ' + script + ', subscript ' + subscript + ', scriptType ' + scriptType);
    }
}

gdo.timeStamp = function() {
    var now = new Date();
    var date = [now.getMonth() + 1, now.getDate(), now.getFullYear()];
    var time = [now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds()];
    var suffix = (time[0] < 12) ? "AM" : "PM";
    time[0] = (time[0] < 12) ? time[0] : time[0] - 12;
    time[0] = time[0] || 12;
    for (var i = 1; i < 3; i++) {
        if (time[i] < 10) {
            time[i] = "0" + time[i];
        }
    }
    if (time[3] < 10) {
        time[3] = "00" + time[3];
    }else if (time[3] < 100) {
        time[3] = "0" + time[3];
    }
    return date.join("/") + " " + time.join(":") + " " + suffix;
}

gdo.populateFunctions = function (root, object, depth) {
    if (depth < 14) {
        for (var property in object) {
            if (object.hasOwnProperty(property)) {
                if (typeof object[property] == "object" && object != gdo.net.instance) {
                    gdo.populateFunctions("" + root + "." + property, object[property], depth + 1);
                }
                else if (typeof object[property] == "function") {
                    if (!contains(gdo.functions.array.mods, root)) {
                        gdo.functions.array.mods.push(root);
                    }
                    if (gdo.functions.array.funcs[root] == null) {
                        gdo.functions.array.funcs[root] = [];
                    }
                    gdo.functions.array.funcs[root].push(property);
                    gdo.functions.list.push(root + "." + property + "(" + getParamNames(object[property]) + ")");
                }
            }
        }
    }
}
