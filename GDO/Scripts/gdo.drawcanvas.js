(function() {
    /* Setup canvas */
    gdo.drawcanvas = {};
    gdo.drawcanvas.canvas = document.getElementById('drawcanvas');
    gdo.drawcanvas.ctx = gdo.drawcanvas.canvas.getContext('2d');

    gdo.drawcanvas.canvas.width = Math.min(document.documentElement.clientWidth, window.innerWidth || 300);
    gdo.drawcanvas.canvas.height = Math.min(document.documentElement.clientHeight, window.innerHeight || 300);

    gdo.drawcanvas.ctx.lineCap = gdo.drawcanvas.ctx.lineJoin = 'round';
    gdo.drawcanvas.ctx.save();

    /* Draw on canvas */
    function drawOnCanvas(color, lineWidth, plots) {
        gdo.drawcanvas.ctx.strokeStyle = color;
        gdo.drawcanvas.ctx.lineWidth = lineWidth;
        gdo.drawcanvas.ctx.beginPath();
        // find the first plot on this screen
        var i = 0;
        while (plots[i].screen != gdo.clientId) {
            i++;
            if (i == plots.length) return;
        }
        gdo.drawcanvas.ctx.moveTo(plots[i].x, plots[i].y);

        for(var j = i + 1; j < plots.length; j++) {
            if (plots[j].screen == gdo.clientId) {
                // if this plot is on this screen
                if (plots[j - 1].screen == gdo.clientId) {
                    // if the previous plot was also on this screen
                    gdo.drawcanvas.ctx.lineTo(plots[j].x, plots[j].y);
                } else {
                    gdo.drawcanvas.ctx.moveTo(plots[j].x, plots[j].y);
                }
            }
        }
        gdo.drawcanvas.ctx.stroke();
    }

    function drawFromStream(message) {
        if (message) {
            gdo.drawcanvas.ctx.restore();
            if (message.mode == 'cluster' && message.plots && message.plots.length >= 1) {
                drawOnCanvas(message.color, message.lineWidth, message.plots);
                message.plots.splice(message.plots.length - 1, 1);
                drawFromStream(message); // recursive redraw required in order to ensure the same thickness is obtained as source
            } else if (message.erase && message.erase.length == 0) {
                gdo.drawcanvas.ctx.clearRect(0, 0, gdo.drawcanvas.canvas.width, gdo.drawcanvas.canvas.height);
            } else if (message.mode == 'cluster' && message.text && message.text.length >= 1) {
                gdo.drawcanvas.ctx.fillStyle = message.color;
                gdo.drawcanvas.ctx.font = message.fontSize + 'px Georgia';
                for (var i = 0; i < message.text.length; i++) {
                    if (message.text[i].screen == screen) {
                        gdo.drawcanvas.ctx.fillText(message.text[i].string, message.text[i].x, message.text[i].y);
                        break;
                    }
                }
        }
    }

    /* Socket event listeners */
    socket.on('draw', function(data) {drawFromStream(JSON.parse(data).message);});
    socket.on('connect', function(data) {socket.emit('join', '[Cluster Node ' + gdo.clientId + ']: connected');});
})();
