$(function () {
    // Voice control
    var gdo = parent.gdo;
    gdo.net.app["PresentationTool"].artyom = artyom;
    var curr_section = 0;
    var database = [];
    var length = 65;
    for (var i = 0; i < 65; i++) {
        database.push(i);
    }
    var voiceInitialized = false;
    artyom.addCommands([
        {
            indexes: ["Hello there"],
            action: function (i) {
                artyom.say("Hey there !");
                artyom.say("You could say following commands");
                voiceInitialized = true;
                gdo.net.app["PresentationTool"].server.updateVoiceInfo(gdo.controlId, "Hey there! You could say: Next, previous, play", 1);

            }
        },
        {
            indexes: ["Next"],
            action: function (i) {
                if (!voiceInitialized) return;
                artyom.say("Receive command");
                gdo.net.app["PresentationTool"].server.updateVoiceInfo(gdo.controlId, "Playing next slide", 1);
                $("#next_slide").click();
            }
        },
        {
            indexes: ["Previous"],
            action: function (i) {
                if (!voiceInitialized) return;
                artyom.say("Receive command");
                gdo.net.app["PresentationTool"].server.updateVoiceInfo(gdo.controlId, "Playing previous slide", 1);
                $("#previous_slide").click();
            }
        },
        {
            indexes: ["Play"],
            action: function (i) {
                if (!voiceInitialized) return;
                artyom.say("Receive command");
                gdo.net.app["PresentationTool"].server.updateVoiceInfo(gdo.controlId, "Playing current page", 1);
                $("#play_slide").click();
            }
        },

        {
            indexes: ["Section *"],
            smart: true,
            action: function (i, wildcard, sentence) {
                if (!voiceInitialized) return;
                artyom.say("Receive command");
                if (database.indexOf(parseInt(wildcard.trim()))) {
                    curr_section = parseInt(wildcard.trim());
                    gdo.net.app["PresentationTool"].server.updateVoiceInfo(gdo.controlId, "Section " + curr_section, 1);
                }
            }
        },

        {
            indexes: ["Zoom"],
            action: function (i) {
                if (!voiceInitialized) return;
                artyom.say("Receive command");
                if (curr_section !== 0) {
                    gdo.net.app["PresentationTool"].server.updateVoiceInfo(gdo.controlId, "Zoom in Image on Section " + (curr_section), 1);
                    gdo.net.app["Images"].server.requestZoomImage(gdo.net.app["PresentationTool"].section[curr_section + 1].realInstanceId, 0.5);
                }
            }
        }

    ]);
})