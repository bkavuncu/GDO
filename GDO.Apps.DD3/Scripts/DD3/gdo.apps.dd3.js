/**
*   Version 0.0.1
*   dd3 - v0.0.2
*   Commentary Glossary:
*   TODO: code or function to be refactored
*   TODEL: code that doesn't appear to serve any purpose and should be deleted after validation
*   APIDOC: to be included in dd3 documentation
*   INFO: so you don't have to google it
*/

// ==== IF THIS NODE IS AN APP ====
var d3;

var temporary_store;//TODO v4: delete

var initDD3App = function () {

    //Retrieve the d3 library element
    d3 = document.getElementById('app_frame_content').contentWindow.d3;

    /**
     * Common JS utility function. 
     */
    var utils = (function () {
        return {
            /**
             *get the value of an url variable if it exist, false else
             */
            getUrlVar: function (variable) {
                var query = window.location.search.substring(1);
                var vars = query.split("&");
                for (var i = 0; i < vars.length; i++) {
                    var pair = vars[i].split("=");
                    if (pair[0] === variable) { return pair[1]; }
                }
                return false;
            },
            
            /**Clamp a value between a min and a max */

            clamp: function (value, min, max) {
                return value < min ? min : value > max ? max : value;
            },

            // p to true try to parse numbers in k
            d: function (k, p) {
                return function (d) { return ((p && +d[k]) || d[k]); };
            },

            // Basic extend: concatenate the base map with the extensions map
            // warning: do not use with arrays as it uses index to concatenate
            extend: function (base, extension) {
                if (arguments.length > 2) {
                    [].forEach.call(arguments, function (extension) {
                        utils.extend(base, extension);
                    });
                } else {
                    for (var k in extension)
                        base[k] = extension[k];
                }
                return base;
            },

            // Basic utils.clone
            //Clone the Array or Object
            clone: function (source) {
                var destination;
                if (source instanceof Array) {
                    destination = [];
                } else {
                    destination = {};
                }

                for (var property in source) {
                    if (typeof source[property] === "object" && source[property] !== null) {
                        destination[property] = utils.clone(source[property]);
                    } else {
                        destination[property] = source[property];
                    }
                }
                return destination;
            },

            //log a message to the console  with metainformation
            log: function (message, sev) {
                var sevMessage = ["Debug", "Info", "Warning", "Error", "Critical"];
                var consoleFunction = ["debug", "log", "warn", "warn", "error"];
                utils.log.sev = typeof utils.log.sev === "undefined" ? 0 : utils.log.sev;
                arr = (dd3 && dd3.browser) ? [dd3.browser.row, dd3.browser.column] : [];

                sev = utils.clamp(sev || 0, 0, 4);
                if (utils.log.sev <= sev) {
                    console[consoleFunction[sev]]("(" + sevMessage[sev] + ")  [" + arr + "] " + message);
                }
            },

            //return the attributes of a JS object
            getAttr: function (el) {
                var obj = el.attributes, objf = {};
                for (var key in obj) {
                    if (obj.hasOwnProperty(key) && typeof obj[key].nodeName !== "undefined") {
                        objf[obj[key].nodeName] = obj[key].nodeValue;
                    }
                }
                return objf;
            },

            //return name of a function
            getFnName: function (fn) {
                var f = typeof fn == 'function';
                var s = f && ((fn.name && ['', fn.name]) || fn.toString().match(/function ([^\(]+)/));
                return (!f && 'not a function') || (s && s[1] || 'anonymous');
            },

            // Following functions : Keeped for memory for now, will probably be deleted as not needed
            //Warning: still used. Replace before delete
            //Return the containing group of a SVG element.
            //Reminder: The less group there are, the better the performance is
            getContainingGroup: function (el) {
                var container;
                while (!container && (el = el.parentNode)) {
                    if (el.nodeName.toLowerCase() === 'g')
                        container = el;
                }
                return container;
            }


        };
    })();

    //API functions to simulate the GDO backend
    //TODEL: This is actually NEVER used
    //DD3Q: why does this even exist
    var api = function () {
        var api = {};
        var uid = 0;

        api.dataPoints = {};
        //Test data sets
        api.dataPoints.scatterplotCos = d3.range(0, 26, 0.8).map(function (d) { return { id: uid++, x: d, y: Math.cos(d) }; });
        api.dataPoints.scatterplotParabole = d3.range(-10, 15, 0.5).map(function (d) { return { id: uid++, x: d, y: d * d }; });
        api.dataPoints.testSet = [{ x: 1, y: 2 }, { x: 4.5, y: 3.3 }, { x: 1, y: 5 }, { x: 8, y: 2 }];
        api.dataPoints.barData = [{ country: "USA", gdp: "17.4" }, { country: "China", gdp: "10.3" }, { country: "England", gdp: "2.9" }, { country: "France", gdp: "2.8" }, { country: "Germany", gdp: "3.8" }, { country: "Japan", gdp: "4.6" }];
        api.dataPoints.scatterplot4000 = d3.range(0, 200, 0.05).map(function (d) { return { id: uid++, x: d, y: Math.cos(d) * 3 }; });

        //Sort by ascending order given an index if it is a numerical value
        var sorter = function (_) {
            return function (a, b) {
                a[_] = +a[_] ? +a[_] : a[_];
                b[_] = +b[_] ? +b[_] : b[_];
                return a[_] > b[_] ? 1 : a[_] < b[_] ? -1 : 0;
            };
        };

        //Retrieve data dimensions of data set given by a data id
        api.getDataDimensions = function (dataId) {
            var dimensions = {},
                prop = [],
                data = api.dataPoints[dataId];

            for (var p in data[0])
                if (data[0].hasOwnProperty(p))
                    prop.push(p);

            prop.forEach(function (p) {
                dimensions[p] = {};
                dimensions[p].min = d3.min(data, utils.d(p, true));
                dimensions[p].max = d3.max(data, utils.d(p, true));
            });

            dimensions.length = data.length;

            // Simulate api response time
            //DD3Q: the timeout is not optimal (ex: connection problem). It would be best to send a request with a callback
            setTimeout(function () {
                dd3Server.client.dd3Receive("receiveDimensions", dataId, JSON.stringify(dimensions));
            }, 500);
        };

        api.getData = function (dataName, dataId) {
            // Simulate api response time
            setTimeout(function () {
                dd3Server.client.dd3Receive("receiveData", dataName, api.dataPoints[dataId]);
            }, 500);
        };

        //Not perfect ... need the case x = xmax
        api.getPointData = function (request) {
            var data = api.dataPoints[request.dataId],
                limit = request.limit,
                xKey = request.xKey,
                yKey = request.yKey;

            var requestedData = data.filter(function (d) { return d[xKey] >= limit.xmin && d[xKey] < limit.xmax && d[yKey] >= limit.ymin && d[yKey] < limit.ymax; })
                .map(function (d) {
                    var obj = {};

                    if (request._keys !== null) {
                        if (!(request._keys instanceof Array)) utils.log("V4 Error: request._keys is a Map and handled as an array",4);
                        request._keys.forEach(function (k) {
                            obj[k] = d[k];
                        });
                    } else {
                        for (var k in d) {
                            if (d.hasOwnProperty(k))
                                obj[k] = d[k];
                        }
                    }

                    return obj;
                });

            // Simulate api response time
            setTimeout(function () {
                dd3Server.client.dd3Receive("receiveData", request.dataName, request.dataId, JSON.stringify(requestedData));
            }, 500);
        };

        //Simulate get bar data
        api.getBarData = function (request) {
            var data = api.dataPoints[request.dataId],
                limit = request.limit,
                sortOnKey = request.orderingKey;

            data.sort(sorter(sortOnKey || "id"))
                .forEach(function (d, i) { d.order = i; });

            var requestedData = data.filter(function (d, i) { return i >= limit.min && i < limit.max; })
                .map(function (d) {
                    var obj = {};

                    if (request._keys !== null) {
                        request._keys.forEach(function (k) {
                            obj[k] = d[k];
                        });
                    } else {
                        for (var k in d) {
                            if (d.hasOwnProperty(k))
                                obj[k] = d[k];
                        }
                    }

                    return obj;
                });

            // Simulate api response time
            setTimeout(function () {
                dd3Server.client.dd3Receive("receiveData", request.dataName, request.dataId, JSON.stringify(requestedData));
            }, 500);
        };

        //Simulate get path data
        api.getPathData = function (request) {
            var data = api.dataPoints[request.dataId],
                approx = request.approximation,
                limit = request.limit,
                xKey = request.xKey,
                yKey = request.yKey;

            var pts = [], counter = approx;

            var isIn = function (d) {
                return (d[xKey] >= limit.xmin && d[xKey] < limit.xmax && d[yKey] >= limit.ymin && d[yKey] < limit.ymax);
            };

            for (var i = 0, l = data.length; i < l; i++) {

                if (isIn(data[i])) {
                    var d = utils.clamp(approx - counter, -approx, 0);

                    for (var j = Math.max(i + d, 0); j <= i; j++) {
                        pts.push(data[j]);
                    }

                    counter = 0;
                } else {
                    if (counter < approx) {
                        pts.push(data[i]);
                    }

                    /*
                    // For possible later improvement
                    // Doing this could possibly improve drawing with a low value for approx => but need to define the method "defined" to pass to the line function...
                    else if (counter == approx) {
                        pts.push(undefined);
                    }
                    */
                    counter++;
                }

            }

            var requestedData = pts.map(function (d) {
                var obj = {};

                if (request._keys !== null) {
                    request._keys.forEach(function (k) {
                        obj[k] = d[k];
                    });
                } else {
                    for (var k in d) {
                        if (d.hasOwnProperty(k))
                            obj[k] = d[k];
                    }
                }

                return obj;
            });

            // Simulate api response time
            setTimeout(function () {
                dd3Server.client.dd3Receive("receiveData", request.dataName, request.dataId, JSON.stringify(requestedData));
            }, 500);
        };

        return api;
    };

    //var peerObject = { key: 'q35ylav1jljo47vi', debug: 0 };
    //  var peerObject = { host: "dsigdoprod.doc.ic.ac.uk", port: 55555 };
    // var peerObject = { host: "146.169.32.109", port: 55555 };
    var peerObject = { host: "146.169.32.109", port: 55555 };
    //{ host: "localhost", port: 55555 };

    //dd3 object containing the core fo DD3 functions
    var dd3 = (function () {
        "use strict";//In strict mode, the JS engine is more regarding
        var _dd3 = Object.create(d3);

        var options = {
            //use request to signalr instead of api simulation
            useApi: false,
            //uses clientid in url to definne position. If false, use row and colmun in url
            positionByClientId: true,
            //global window margin will be transmitted to cave margin
            margin: {
                top: 20,
                bottom: 20,
                left: 60,
                right: 60
            }
        };

        //Hence API is never used...
        if (options.useApi) api = api();

        //State of the library
        var state = (function () {
            var _state = 'loading';
            return function (newState) {
                if (arguments.length === 0) return _state;

                if (newState === 'connecting') {
                    _state = 'connecting';
                } else if (newState === 'ready') {
                    _state = 'ready';
                    utils.log('DD3 is ready !', 1);
                } else if (newState === 'fatal') {
                    _state = 'fatal';
                } else {
                    return false;
                }

                if (!(callbackListener[newState] instanceof Array)) utils.log("V4 Error: callbackListener[newState]  is a Map and handled as an array",4);
                callbackListener[newState].forEach(function (f) { f(); });
                return true;
            };
        })();
        //Listener on state change. Will be added to d3 object
        var callbackListener = {
            connecting: [],
            ready: [],
            fatal: []
        };

        var dd3_data = {}, // Storing functions
            data = {}; // Storing data
        //Represent signalr connection
        var signalR = {
            server: null,
            client: null,
            syncCallback: function () { },
            receiveSynchronize: function () {
                signalR.syncCallback();
            }
        };
        //Represent peerjs connection
        var peer = {
            id: null,
            peers: [],
            connections: [],
            buffers: [],

            init: function () { },
            connect: function () { },
            receive: function () { },
            sendTo: function () { },
            flush: function () { }
        };

        //Represents Cave
        var cave = {
            width: 0,
            height: 0,
            margin: {
                top: 0,
                bottom: 0,
                left: 0,
                right: 0
            }
        };

        //Represents Browser
        var browser = {
            number: null,
            width: /*1280 / 4, /*/$(window).width(),
            height:/* 720 / 2 / 1, /*/$(window).height(),
            margin: {
                top: 0,
                bottom: 0,
                left: 0,
                right: 0
            }
        };

        //Timestamp of last synchronisation
        var syncTime;

        //Initializer function for dd3 library
        var initializer = (function () {
            /*
                Connect to peer server => Get peerId
                Connect to signalR server => Send browser information, receive configuration
            */

            //check if all librairies were loaded and if so set browser configuration (signalr) and connect to peer server (peerjs)
            var init = function () {
                if (!init.checkLibraries()) {
                    state("fatal");
                    return;
                }

                state('connecting');
                init.setBrowserConfiguration();
                init.connectToPeerServer();
            };

            //Check peerjs, d3, jquery, and signalr are loaded
            init.checkLibraries = function () {
                var toCheck = ['d3', 'Peer', 'jQuery', ['jQuery', 'signalR']];

                var check = toCheck.some(function (lib, i) {
                    var ok = false;
                    if (typeof lib === 'string' && typeof window[lib] === "undefined") {
                        utils.log("Initialization failed : " + lib + " was not found", 4);
                        ok = true;
                    } else if (typeof lib === 'object') {
                        var path = window;
                        ok = lib.some(function (l) {
                            if (!(path = path[l])) {
                                utils.log("Initialization failed : " + l + " was not found", 4);
                                return true;
                            }
                            return false;
                        });
                        toCheck[i] = lib.join('.');
                    }
                    return ok;
                });

                if (check)
                    return false;

                utils.log("All Libraries successfully loaded\n[" + toCheck.join(', ') + ']', 1);
                return true;
            };

            //define the row and clomun of the browser. NO information from the server is used. It merely uses the the url
            init.setBrowserConfiguration = function () {
                if (options.positionByClientId) {
                    browser.number = +utils.getUrlVar('clientId');
                    browser.initColumn = (browser.number - 1) % 16;
                    browser.initRow = 3 - ~~((browser.number - 1) / 16);
                } else {
                    browser.initColumn = +utils.getUrlVar('column');
                    browser.initRow = +utils.getUrlVar('row');
                    browser.number = (3 - browser.initRow) * 16 + (browser.initColumn + 1);
                }
                utils.log("Browser Configuration Set", 1);
            };

            //connect to the peer server (and actually call the signalr connection initialisation)
            init.connectToPeerServer = function () {

                var p = peer.peer = new Peer(peerObject);

                p.on('open', function (id) {
                    utils.log('Connected to peer server - id : ' + id, 1);
                    peer.id = id;

                    p.on('connection', function (conn) {
                        // Previous loss of data : the buffering in peer.js seems not to work,
                        // and data have to be sent only when connection is opened (connection != open)
                        //Row and columun form the browser which connects to this one
                        var r = +conn.metadata.initiator[0],
                            c = +conn.metadata.initiator[1];

                        // If there is already a connection, we allow only one connection to remain active
                        // The priority is given to higher row browsers, and if equal then higher colmun
                        if (peer.connections[r][c]) {
                            var priority = r > browser.row || (r === browser.row && c > browser.column);

                            if (!priority) {
                                conn.on("open", conn.close);
                                return;
                            }


                            if (peer.connections[r][c].open) {
                                peer.connections[r][c].close();
                            } else {
                                peer.connections[r][c].removeAllListeners().on("open", peer.connections[r][c].close);
                            }
                        }

                        peer.connections[r][c] = conn;
                        peer.buffers[r][c] = peer.buffers[r][c] || [];
                        conn.on("open", peer.init.bind(null, conn, r, c));
                    });

                    init.connectToSignalRServer();
                });

                p.on("error", function (e) {
                    utils.log("[Peer] " + e, 3);
                });
                //Destroy the connection as soon as the window has changed or is destroyed
                window.onunload = window.onbeforeunload = function (e) {
                    if (!!peer.peer && !peer.peer.destroyed) {
                        peer.peer.destroy();
                    }
                    //signalR && signalR.connection && (signalR.connection.state === 1) && signalR.server && signalR.server.removeClient(signalR.sid);
                };
                utils.log("Connection to peer server established", 1);
            };

            //Connect to the signalR server and send the info

            init.connectToSignalRServer = function () {
                //dd3Server contains the connection to AppHub
                signalR.server = dd3Server.server;
                signalR.client = dd3Server.client;
                signalR.sid = dd3Server.instanceId;


                // Define server interaction functions
                signalR_callback.receiveConfiguration = init.getCaveConfiguration;
                signalR_callback.receiveSynchronize = signalR.receiveSynchronize;

                utils.log("Connected to signalR server", 1);
                utils.log("Waiting for everyone to connect", 1);

                var thisInfo = {
                    browserNum: browser.number,
                    peerId: peer.id,
                    row: browser.initRow,
                    col: browser.initColumn,
                    height: browser.height,
                    width: browser.width
                };

                signalR.server.updateInformation(signalR.sid, thisInfo);
                utils.log("Connection to SignalR server established", 1);
            };

            //Receive the configuration of the whole cave from the backend
            init.getCaveConfiguration = function (obj) {
                utils.log("Receiving connected browsers' ids from signalR server", 1);

                //obj contains info about all browsers
                syncTime = Date.now();
                var peersInfo = JSON.parse(obj);
                var maxCol, minCol, maxRow, minRow;

                //define the mine and max row and columns
                minCol = d3.min(peersInfo, utils.d('col', true));
                maxCol = d3.max(peersInfo, utils.d('col', true));
                minRow = d3.min(peersInfo, utils.d('row', true));
                maxRow = d3.max(peersInfo, utils.d('row', true));

                //nb of rows and column
                cave.rows = maxRow - minRow + 1;
                cave.columns = maxCol - minCol + 1;

                //Offset the column,row coordinate of this browser with minimal row and column
                browser.column = browser.initColumn - minCol;
                browser.row = browser.initRow - minRow;

                //Initialize the peerjs connection
                peersInfo.forEach(function (p) {
                    p.initColumn = +p.col;
                    p.initRow = +p.row;
                    p.col = p.initColumn - minCol;
                    p.row = p.initRow - minRow;
                });

                peer.peers = peersInfo;
                //peer.connections are the peerjs connections matained between this node and others
                peer.connections = d3.range(0, cave.rows).map(function () { return []; });
                //peer.buffers is the buffer of the data sent from this node to another one
                peer.buffers = d3.range(0, cave.rows).map(function () { return []; });

                //Initialize cave property
                cave.margin = options.margin;
                cave.width = cave.columns * browser.width;
                cave.height = cave.rows * browser.height;
                cave.svgWidth = cave.width - cave.margin.left - cave.margin.right;
                cave.svgHeight = cave.height - cave.margin.top - cave.margin.bottom;

                //Define browser content position in the context of the cave geometrical referral
                browser.margin = {
                    top: Math.max(cave.margin.top - browser.row * browser.height, 0),
                    left: Math.max(cave.margin.left - browser.column * browser.width, 0),
                    bottom: Math.max(cave.margin.bottom - (cave.rows - browser.row - 1) * browser.height, 0),
                    right: Math.max(cave.margin.right - (cave.columns - browser.column - 1) * browser.width, 0)
                };

                //Size of the svg element in the browser
                browser.svgWidth = Math.max(browser.width - browser.margin.left - browser.margin.right, 0);
                browser.svgHeight = Math.max(browser.height - browser.margin.top - browser.margin.bottom, 0);

                defineDD3Functions();
            };


            return init;

        })();

        // Create all dd3 functions	
        var defineDD3Functions = function () {

            /**
             * dd3.position
             */

            //this returns a function which offsets any input by a given value in a given direction
            function sumWith(s, sign) {
                return function (x) { return x + sign * s; };
            }

            /*APIDOC: used to translate coordinates between global and local referential
                        * context1: output referential
                        * range1: output containing element
                        * context2: input referential
                        * range2: input element
                        * this returns p.left and p.top, two functions which translates each 2D coordinates from the input referential to the output referential
                        * ex: ("svg", "local", "svg", "global") => I want to know the position in the svg element according to the local referential based on the position in the svg element according to the global referential
                        */
            _dd3.position = function (context1, range1, context2, range2) {
                var p = {};
                var f, sign, g;
                if (context1 === context2) {
                    f = dd3.position[(context1 === 'html') ? 'html' : 'svg'];
                    sign = (range1 == range2) ? 0 : (range1 == 'local') ? 1 : -1;
                    p.left = sumWith(f.left, sign);
                    p.top = sumWith(f.top, sign);
                } else if (range1 === range2) {
                    f = ((range1 === 'local') ? browser : cave).margin;
                    sign = (context1 === 'html') ? -1 : 1;
                    p.left = sumWith(f.left, sign);
                    p.top = sumWith(f.top, sign);
                } else {
                    f = _dd3.position(context1, range1, context1, range2);
                    g = _dd3.position(context1, range2, context2, range2);
                    p.left = function (x) { return g.left(f.left(x)); };
                    p.top = function (x) { return g.top(f.top(x)); };
                }
                return p;
            };

            //position of the svg element in the cave referential
            _dd3.position.svg = {
                left: browser.column * browser.width - cave.margin.left + browser.margin.left,
                top: browser.row * browser.height - cave.margin.top + browser.margin.top
            };

            //position of the html element in the cave referential
            _dd3.position.html = {
                left: browser.column * browser.width,
                top: browser.row * browser.height
            };

            // Most used functions already computed ... time saving ! - 
            //TODEL:...and never used ...
            var hghl = _dd3.position('html', 'global', 'html', 'local'),
                hlhg = _dd3.position('html', 'local', 'html', 'global'),
                hlsg = _dd3.position('html', 'local', 'svg', 'global'),
                sghg = _dd3.position('svg', 'global', 'html', 'global'),
                slsg = _dd3.position('svg', 'local', 'svg', 'global');


            /**
             * DATA REQUEST AND RECEPTION FROM SERVER
             */

            //Prefix a string with dd3_ 
            //TODEL: obfuscate the code
            var pr = function (s) {
                return "dd3_" + s;
            };

            dd3_data.data = data;


            //return the bounds of the dataset provided in data[dd3_dataId] according to either the coordinate keys or the datadimenstions
            //used by getPointData and getPathData
            dd3_data.getBounds = function (dataId, scaleX, scaleY, xKey, yKey) {

                var d = data[pr(dataId)].dataDimensions;
                if (!d && (!scaleX || !scaleY)) {
                    utils.log("You need to provide scales or to request data dimensions before requesting this type of data", 3);
                    return;
                } else if ((!scaleX && !d[xKey]) || (!scaleY && !d[yKey])) {
                    utils.log("Incorrect key(s) provided", 3);
                    return;
                }

                var p = _dd3.position('svg', 'local', 'svg', 'global');
                var domainX = scaleX ? scaleX.domain().slice() : [d[xKey].min, d[xKey].max],
                    rangeX = scaleX ? scaleX.range().slice() : [0, cave.svgWidth],
                    domainY = scaleY ? scaleY.domain().slice() : [d[yKey].min, d[yKey].max],
                    rangeY = scaleY ? scaleY.range().slice() : [cave.svgHeight, 0];

                var invX = 1, invY = 1;

                if (domainX[0] > domainX[1]) {
                    domainX.reverse();
                    invX *= -1;
                }
                if (rangeX[0] > rangeX[1]) {
                    rangeX.reverse();
                    invX *= -1;
                }
                if (domainY[0] > domainY[1]) {
                    domainY.reverse();
                    invY *= -1;
                }
                if (rangeY[0] > rangeY[1]) {
                    rangeY.reverse();
                    invY *= -1;
                }

                var limit = {};
                var minX = Math.max(p.left(0), rangeX[0]),
                    maxX = Math.min(p.left(browser.svgWidth), rangeX[1]),
                    minY = Math.max(p.top(0), rangeY[0]),
                    maxY = Math.min(p.top(browser.svgHeight), rangeY[1]);

                if (invX > 0) {
                    limit.xmin = domainX[0] + (minX - rangeX[0]) / (rangeX[1] - rangeX[0]) * (domainX[1] - domainX[0]);
                    limit.xmax = domainX[0] + (maxX - rangeX[0]) / (rangeX[1] - rangeX[0]) * (domainX[1] - domainX[0]);
                } else {
                    limit.xmin = domainX[0] + (rangeX[1] - maxX) / (rangeX[1] - rangeX[0]) * (domainX[1] - domainX[0]);
                    limit.xmax = domainX[0] + (rangeX[1] - minX) / (rangeX[1] - rangeX[0]) * (domainX[1] - domainX[0]);
                }

                if (invY > 0) {
                    limit.ymin = domainY[0] + (minY - rangeY[0]) / (rangeY[1] - rangeY[0]) * (domainY[1] - domainY[0]);
                    limit.ymax = domainY[0] + (maxY - rangeY[0]) / (rangeY[1] - rangeY[0]) * (domainY[1] - domainY[0]);
                } else {
                    limit.ymin = domainY[0] + (rangeY[1] - maxY) / (rangeY[1] - rangeY[0]) * (domainY[1] - domainY[0]);
                    limit.ymax = domainY[0] + (rangeY[1] - minY) / (rangeY[1] - rangeY[0]) * (domainY[1] - domainY[0]);
                }

                return limit;
            };

            // Data Request
            //get Dimensions of the dataset

            dd3_data.getDimensions = function (dataId, callback) {
                utils.log("Data dimensions requested for " + dataId, 1);
                data[pr(dataId)] = {};
                data[pr(dataId)].callback_dimensions = callback;
                if (options.useApi)
                    api.getDataDimensions(dataId);
                else
                    signalR.server.getDimensions(signalR.sid, dataId);
            };

            /*APIDOC:get the raw data of the data set according to its name or id. You can filter by key if needed.
                        * dataName: name of the data => Apparently, this isn't used
                        * dataId: id of the dataset
                        * callback: function to call once the data is received
                        * keys: array of the attributes that you want to retrieve
                        * No return as data will be passed to callback
                        */
            dd3_data.getData = function (dataName, dataId, callback, keys) {
                data[pr(dataId)] = data[pr(dataId)] || {};
                data[pr(dataId)][pr(dataName)] = data[pr(dataId)][pr(dataName)] || {};
                data[pr(dataId)][pr(dataName)].callback_data = callback;

                var request = {
                    dataId: dataId,
                    dataName: dataName,
                    limits: [],
                    _keys: keys || null
                };

                if (options.useApi)
                    api.getData(request);
                else
                    signalR.server.getData(signalR.sid, request);

                utils.log("Data requested : " + dataName + " (" + dataId + ")", 1);
            };

            /*APIDOC:get data of the data set according to its name or id. You can filter by key if needed. Tailored for data that will de represented as point
                        * dataName: name of the data => Apparently, this isn't used
                        * dataId: id of the dataset
                        * callback: function to call once the data is received
                        * scaleX: scale of the data to return according to x (cf. D3 scale object) 
                        * scaleY: scale of the data to return according to y (cf. D3 scale object)
                        * xKey: attribute of the data set to use for x axis
                        * yKey: attribute of the data set to use for y axis
                        * keys: array of the attributes that you want to retrieve
                        * limit: bounds of the data to return. If null, will be computed from the scales and keys
                        * No return as data will be passed to callback
                        */
            dd3_data.getPointData = function (dataName, dataId, callback, scaleX, scaleY, xKey, yKey, keys, limit) {

                data[pr(dataId)] = data[pr(dataId)] || {};
                data[pr(dataId)][pr(dataName)] = data[pr(dataId)][pr(dataName)] || {};
                data[pr(dataId)][pr(dataName)].callback_data = callback;

                xKey = xKey || ['x'];
                yKey = yKey || ['y'];
                var limits = limit || dd3_data.getBounds(dataId, scaleX, scaleY, xKey, yKey);
                if (!limits) return;

                var request = {
                    dataId: dataId,
                    dataName: dataName,
                    limit: limits,
                    xKey: xKey,
                    yKey: yKey,
                    _keys: keys || null
                };

                if (options.useApi)
                    api.getPointData(request);
                else
                    signalR.server.getPointData(signalR.sid, request);

                utils.log("Data requested : " + dataName + " (" + dataId + ")", 1);
            };

            /*APIDOC:get data of the data set according to its name or id. You can filter by key if needed. Tailored for data that will be represented as path 
             * dataName: name of the data => Apparently, this isn't used
             * dataId: id of the dataset
             * callback: function to call once the data is received
             * scaleX: scale of the data to return according to x (cf. D3 scale object) 
             * scaleY: scale of the data to return according to y (cf. D3 scale object)
             * xKey: attribute of the data set to use for x axis
             * yKey: attribute of the data set to use for y axis
             * keys: array of the attributes that you want to retrieve
             * approximation: approximation around the min and max
             * limit: bounds of the data to return. If null, will be computed from the scales and keys
             * No return as data will be passed to callback
             */
            dd3_data.getPathData = function (dataName, dataId, callback, scaleX, scaleY, xKey, yKey, keys, approximation, limit) {

                data[pr(dataId)] = data[pr(dataId)] || {};
                data[pr(dataId)][pr(dataName)] = data[pr(dataId)][pr(dataName)] || {};
                data[pr(dataId)][pr(dataName)].callback_data = callback;

                xKey = xKey || ['x'];
                yKey = yKey || ['y'];
                var limits = limit || dd3_data.getBounds(dataId, scaleX, scaleY, xKey, yKey);
                if (!limits) return;

                var request = {
                    dataId: dataId,
                    dataName: dataName,
                    limit: limits,
                    xKey: xKey,
                    yKey: yKey,
                    _keys: keys || null,
                    approximation: approximation || 5
                };

                if (options.useApi)
                    api.getPathData(request);
                else
                    signalR.server.getPathData(signalR.sid, request);

                utils.log("Data requested : " + dataName + " (" + dataId + ")", 1);
            };

            /*APIDOC:get data of the data set according to its name or id. You can filter by key if needed. Tailored for data that will be represented as bar
                        * dataName: name of the data => Apparently, this isn't used
                        * dataId: id of the dataset
                        * callback: function to call once the data is received
                        * orderingKey: which key will be used for ordering
                        * keys: array of the attributes that you want to retrieve
                        * orientation: Orientation for the bar chart (cf d3 orientation)
                        * limit: bounds of the data to return. If null, will be computed from the scales and keys
                        * No return as data will be passed to callback
                        */
            dd3_data.getBarData = function (dataName, dataId, callback, scale, orderingKey, keys, orientation, limit) {

                orientation = orientation || "bottom";


                var r=[],
                    toGlobal = slsg[orientation === "bottom" || orientation === "top" ? 'left' : 'top'],
                    limits = limit || {};
                
                for ( var ky in scale.domain()){
                    r.push(scale(ky));
                }

                data[pr(dataId)] = data[pr(dataId)] || {};
                data[pr(dataId)][pr(dataName)] = data[pr(dataId)][pr(dataName)] || {};
                data[pr(dataId)][pr(dataName)].callback_data = callback;

                utils.log("Data requested : " + dataName + " (" + dataId + ")", 1);

                if (orientation === "bottom" && browser.row === cave.rows - 1 ||
                    orientation === "top" && browser.row === 0 ||
                    orientation === "left" && browser.column === 0 ||
                    orientation === "right" && browser.column === cave.column - 1) {

                    limits.min = limits.min || d3.bisect(r, toGlobal(0) - scale.bandwidth() / 2);
                    limits.max = limits.max || d3.bisect(r, toGlobal(browser[orientation === "bottom" || orientation === "top" ? 'svgWidth' : 'svgHeight']) - scale.bandwidth() / 2);


                    var request = {
                        dataId: dataId,
                        dataName: dataName,
                        limit: limits,
                        orderingKey: orderingKey || null, // Key on which to order the data
                        _keys: keys || null
                    };

                    if (options.useApi)
                        api.getBarData(request);
                    else
                        signalR.server.getBarData(signalR.sid, request);
                } else {
                    dd3_data.receiveData(dataName, dataId, "[]");
                }
            };


            /*APIDOC:get data of the data set according to its name or id. You can filter by key if needed. Tailored for data that will be represented as pie
                        * dataName: name of the data => Apparently, this isn't used
                        * dataId: id of the dataset
                        * callback: function to call once the data is received
                        * centerX: X coordinate of the center
                        * centerY: Y coordinate of the center
                        * No return as data will be passed to callback
                        */
            dd3_data.getPieData = function (dataName, dataId, callback, centerX, centerY) {
                data[pr(dataId)] = data[pr(dataId)] || {};
                data[pr(dataId)][pr(dataName)] = data[pr(dataId)][pr(dataName)] || {};
                data[pr(dataId)][pr(dataName)].callback_data = callback;

                var sgsl = _dd3.position('svg', 'global', 'svg', 'local');
                if (sgsl.left(centerX) >= 0 && sgsl.left(centerX) < browser.width)
                    if (sgsl.top(centerY) >= 0 && sgsl.top(centerY) < browser.height)
                        return api.getData(dataName, dataId);
                return dd3_data.receiveData(dataName, dataId, "[]");
            };

            /*APIDOC:get data from a remote source
                        * dataId: id of the dataset
                        * address: Address of the remote data source
                        * callback: function to call once the data is received
                        * toArray, toObjects, toValues, useNames : DD3Q: wut?
                        * No return as data will be passed to callback
                        */
            dd3_data.requestRemoteData = function (dataId, address, callback, toArray, toObject, toValues, useNames) {
                data[pr(dataId)] = data[pr(dataId)] || {};
                data[pr(dataId)].callback_remoteDataReady = callback;

                if (!address) { utils.log("Server address not specified - Aborting", 2); return; }

                toArray = toArray || [];
                toObject = toObject || [];
                toValues = toValues || [[]];
                useNames = useNames || [];

                var request = {
                    dataId: dataId,
                    server: address,
                    toArray: toArray,
                    toObject: toObject,
                    toValues: toValues,
                    useNames: useNames
                };

                signalR.server.requestFromRemote(signalR.sid, request);
            };

            // Data Reception

            //Callback upon data dimensions reception => store it and call the next callback
            dd3_data.receiveDimensions = function (dataId, dimensions) {
                utils.log("Data dimensions received for " + dataId, 1);
                dimensions = JSON.parse(dimensions);
                if (dimensions.error) {
                    utils.log("Error requesting dimensions : " + dimensions.error, 3);
                }
                data[pr(dataId)].dataDimensions = dimensions;
                if (data[pr(dataId)].callback_dimensions) {
                    data[pr(dataId)].callback_dimensions(dimensions);
                }
            };

            //Callback upon data reception => store it and call the next callback
            dd3_data.receiveData = function (dataName, dataId, dataPoints) {
                utils.log("Data received : " + dataName + " (" + dataId + ")", 1);
                dataPoints = JSON.parse(dataPoints);
                if (dataPoints.error) {
                    utils.log("Error requesting data : " + dataPoints.error, 3);
                }
                data[pr(dataId)][pr(dataName)].dataPoints = dataPoints;
                if (data[pr(dataId)][pr(dataName)].callback_data) {
                    data[pr(dataId)][pr(dataName)].callback_data(dataPoints);
                }
            };

            //Callback upon remote data readiness reception
            dd3_data.receiveRemoteDataReady = function (dataId, result) {
                utils.log("Received result of remote server request : " + dataId, 1);
                result = JSON.parse(result);
                if (data[pr(dataId)].callback_remoteDataReady) {
                    data[pr(dataId)].callback_remoteDataReady(result);
                }
            };

            //Link this callback with signalr
            signalR_callback.receiveDimensions = dd3_data.receiveDimensions;
            signalR_callback.receiveData = dd3_data.receiveData;
            signalR_callback.receiveRemoteDataReady = dd3_data.receiveRemoteDataReady;

            /**
             * PEER FUNCTIONS
             * Data reception handling
             */

            //Methods of the peer object: callback when a peer is created and opened
            //Will log the connection, link to the behaviour upon data reception and call peer.flush
            peer.init = function (conn, r, c) {
                utils.log("Connection established with Peer (" + [r, c] + "): " + conn.peer, 0);
                conn.on("data", peer.receive);
                peer.flush(r, c);
            };

            //Open the connection to row, column peer
            //Empty the buffers for the connection to ths peer
            //TODO: unobfuscate the code 
            peer.connect = function (r, c) {
                r = +r;
                c = +c;

                // Try to find peer with r and c as row and column - use Array.some to stop when found
                // if the row, column pair is not the same as those of the connections, return false
                return peer.peers.some(function (p) {
                    if (+p.row !== r || +p.col !== c)
                        return false;

                    var conn = peer.peer.connect(p.peerId, { reliable: true, metadata: { initiator: [browser.row, browser.column] } });
                    conn.on("open", peer.init.bind(null, conn, r, c));
                    peer.connections[r][c] = conn;
                    peer.buffers[r][c] = [];
                    return true;
                });
            };


            //If buffer is set to true, Put data in the buffer of the connection to the node at row r and column c
            //If buffer is set to false, send the data directly
            //returns false if no connection exists 
            peer.sendTo = function (r, c, data, buffer) {
                if (typeof peer.connections[r][c] === "undefined" && !peer.connect(r, c)) {
                    // If there is no such peer
                    return false;
                }

                // If connection is being established or we asked to buffer, we buffer - else we send
                if (!peer.connections[r][c].open || buffer) {
                    peer.buffers[r][c].push(data);
                } else {
                    peer.connections[r][c].send(data);
                }

                return true;
            };

            //flush the peer: i.e. SEND the data in the buffer of the connection the node (r,c) AND EMPTY the buffer
            peer.flush = function (r, c) {

                var buff = peer.buffers[r][c],
                    conn = peer.connections[r][c];
                if (buff && buff.length > 0 && conn && conn.open) {

                    conn.send(buff);

                    peer.buffers[r][c] = [];
                    return true;
                }

                return false;
            };

            //Callback when data is received from another peer. Will call different functions depending on the nature of the data (shape, property, remove, transition, endTransition)
            //Return false if the data.type is unrecognised.
            //If data is an array: peer.reveive will be called recursively on each elements of the array.
            peer.receive = function (data) {
                if (data instanceof Array) {
                    data.forEach(peer.receive);
                    return;
                }

                switch (data.type) {
                    case 'shape':
                        utils.log("Receiving a new shape...");
                        _dd3_shapeHandler(data);
                        break;

                    case 'property':
                        utils.log("Receiving a property [" + data.function + (data.property ? (":" + data.property) : "") + "] update...");
                        _dd3_propertyHandler(data);
                        break;

                    case 'remove':
                        utils.log("Receiving an exiting shape...");
                        _dd3_removeHandler(data);
                        break;

                    case 'transition':
                        utils.log("Receiving a transition... ");
                        _dd3_transitionHandler(data);
                        break;

                    case 'endTransition':
                        utils.log("Receiving a end transition event...");
                        _dd3_endTransitionHandler(data);
                        break;

                    default:
                        utils.log("Receiving an unsupported data : Aborting !", 2);
                        utils.log(data, 2);
                        return false;
                }

            };

            /* Functions handling data reception  */
            //INFO: d3.map() is an implementation of Map according to ES6 specification. Nothing to do with d3 data visualization function.
            //TODEL: Never used...
            var _dd3_timeoutStartReceivedTransition = d3.map();
            //TODEL: Never used...
            var _dd3_timeoutEndReceivedTransition = d3.map();

            // Returun the next HTML element in an ordered group. Used solely for shape handling
            // g: Current element in the ordered group.
            // order: current 'position' of in the ordered group
            //TODO v4: the selector can't find the order. Is that a problem?
            var getOrderFollower = function (g, order) {
                var s = order.split("_");
                var elems = g.selectAll_("#" + g.node().id + " > [order^='" + s[0] + "']"),//TODO document this CSS selector query
                    follower,
                    o;

                if (!elems.empty()) {
                    s[1] = +s[1];
                    //TODO v4: use selection.nodes() to return an array
                    
                    elems = elems.nodes();
                    

                    elems.some(function (a) {
                        o = +a.getAttribute('order').split("_")[1];
                        if (o > s[1]) {
                            follower = a;
                            return true;
                        }
                        return false;
                    });

                    if (!follower) {

                        follower = elems[elems.length - 1].nextElementSibling;
                    }

                } else {
                    elems = g.selectAll_("#" + g.node().id + " > [order]");
                    
                    elems = elems.nodes();
                    

                    elems.some(function (a) {
                        var o = a.getAttribute('order');
                        if (o > order) {//TODO: What if order is NaN as suggested by the first line of the function
                            follower = a;
                            return true;
                        }
                        return false;
                    });
                }

                return follower;
            };

            //Handler to be called upon the reception of a shape from peerjs.
            // Create the element from the data received (data.sendId), add it to the group (data.containers) in the proper ordering.
            var _dd3_shapeHandler = function (data) {
                var mainId = data.containers.shift(),
                    obj = d3.select("#" + data.sendId),
                    g1 = d3.select("#" + mainId), g2,
                    c = false; // Whether the object was changed of group since last time
                

                if (g1.empty()) {
                    utils.log("The group with id '" + mainId + "' received doesn't exist in the dom - A group with an id must exist in every browsers !", 2);
                    return;
                }

                if (!(data.containers instanceof Array)) utils.log("V4 Error: data.containers is a Map and handled as an array",4);
                data.containers.forEach(function (o) {
                    g2 = g1.select_("#" + o.id);
                    if (g2.empty()) {
                        c = true;

                        g1.insert_('g', function () { return getOrderFollower(g1, o.order); });
                    } else {
                        g1 = g2;
                    }
                    //g1 = g2.empty() ? (c = true, g1.insert_('g', function () { return getOrderFollower(g1, o.order); })) : g2;
                    g1.attr_(o);//TODO v4: does this actually work
                    if (!g1) utils.log('Warning!!! attr_ in _dd3_shapeHandler has failed', 4);

                    if (o.transition)
                        peer.receive(o.transition);
                });

                // Here we create an absolute ordering in one group
                if (obj.empty() || c) {
                    obj.remove_();
                    obj = g1.insert_(data.name, function () { return getOrderFollower(g1, data.attr.order); });
                }

                if (data.name === "image") {
                    obj.attr_("xlink:href", data.attr.href); 
                    delete data.attr.href;
                }

                for (var a in data.attr) {
                    if (data.attr[a]) obj.attr_(a, data.attr[a]);
                }

<<<<<<< HEAD
                obj.attr_(data.attr)
                   .html_(data.html)
                   .classed_('dd3_received', true)
                   .attr_("id", data.sendId); // Here because attr can contain id

               var img = obj.node();
                if (img && img.getAttribute('isSound') == "true") {
                    var audio = null;
                    var prev_audio = obj.select("audio").node();

                    if (d3.select("#sound_" + data.sendId).node()) { //Exists
                        audio = d3.select("#sound_" + data.sendId).node();
                    }
                    else { //Create audio
                        audio = new Audio();
                        audio.loop = true;
                        audio.autoplay = true;
                        audio.src = prev_audio.getAttribute("src");
                        audio.id = "sound_" + data.sendId;
                    }
                    img.removeChild(prev_audio);
                    img.appendChild(audio);
                    audio.muted = false;
                    audio.play();
                }
=======
                obj.html_(data.html)
                    .classed_('dd3_received', true)
                    .attr_("id", data.sendId); // Here because attr can contain id

>>>>>>> origin/integrating-d3v4
            };

            //Handler to be called upon the reception of a remove request from peerjs.
            // removes the corresponding element (data.sendId) and all its children from the DOM
            var _dd3_removeHandler = function (data) {
                var el = d3.select('#' + data.sendId).node();
                while (el && _dd3_isReceived(el.parentElement) && el.parentElement.childElementCount == 1)
                    el = el.parentElement;

                //Handle sound
                console.log(d3.select("#" + data.sendId));
                var img = d3.select("#" + data.sendId)[0][0];
                if (img.getAttribute('isSound') == "true") {
                    console.log("Stop sound here");
                
                }

                //Remove from dom
                d3.select(el).remove();
            };

            //Handler to be called upon the reception of a property from peerjs.
            //find the object and set the properties to their values
            var _dd3_propertyHandler = function (data) {
                var obj = d3.select("#" + data.sendId);
                if (!obj.empty()) {
                    var args = typeof data.property !== "undefined" ? [data.property, data.value] : [data.value];
                    obj[data.function].apply(obj, args)
                        .classed_('dd3_received', true)
                        .attr_("id", data.sendId);
                }
            };


            
            //Handler to be called upon the reception of a transition from peerjs.
            //TODO: v4: d3.ease implementation changed radically
            var _dd3_transitionHandler = function (data) {
                
                //TODO v4: reread to handle all edge cases
                var launchTransition = function (data) {

                    var obj = d3.select("#" + data.sendId);
                    //interrupt any ongoing animation
                    obj.interrupt(data.name);
                    var trst = _dd3_hook_selection_transition.call(obj, data.name);
                    
                    //utils.log("Delay taken: " + (data.delay + (syncTime + data.elapsed - Date.now())), 0);
                    utils.log("Transition on " + data.sendId + ". To be plot between " + data.min + " and " + data.max + ". (" + (data.max - data.min) / 1000 + "s)");
                    
                    for (var a in data.start.attr) {
                        if (data.start.attr[a]) obj.attr_(a, data.start.attr[a]);
                    }
                    
                    for (var a in data.start.style) {
                        if (data.start.style[a]) obj.style_(a, data.start.style[a]);
                    }

                    
                     for (var a in data.end.attr) {
                        if (data.end.attr[a]) trst.attr(a, data.end.attr[a]);
                    }
                    
                    for (var a in data.end.style) {
                        if (data.end.style[a]) trst.style(b, data.end.style[a]);
                    }   

                    trst.duration(data.duration);
                                        
                    if (data.tweens) {
                        data.tweens.forEach(function (o) {//v4
                            if (_dd3_tweens[o.value]) {
                                trst.tween(o.key, _dd3_tweens[o.value]);
                            }
                        });
                    }

                    //TODO v4: should be fixed to ignore attr
                    
                    /*
                    if (data.attrTweens) {
                        data.attrTweens.forEach(function (o) {
                            if(_dd3_tweens["dd3_"+o.key+"_std_value"]){
                                trst.attr(o.key, _dd3_tweens["dd3_"+o.key+"_std_value"]);
                            } else if(_dd3_tweens["dd3_"+o.key+"_std_function"]){
                                trst.attr(o.key, _dd3_tweens["dd3_"+o.key+"_std_function"]);
                            }else if (_dd3_tweens[o.value]) {
                                trst.attrTween(o.key, _dd3_tweens[o.value]);
                            }
                        });
                    }
                    */
                    
                    
                    if (data.styleTweens) {
                        data.styleTweens.forEach(function (o) {
                            var args = typeof o.value[1] !== "undefined" ? [o.key, _dd3_tweens[o.value[0]], o.value[1]] : [o.key, _dd3_tweens[o.value[0]]];
                            if (_dd3_tweens[o.value[0]]) {
                                trst.styleTween.apply(trst, args);
                            }
                        });
                    }
                    
                    
                    
                    if (_dd3_timeTransitionRelative) {
                        trst.delay(data.delay + (syncTime + data.elapsed - Date.now()));
                    } else {
                        var tmp = data.delay + (data.elapsed - Date.now());
                        
                        trst.delay((tmp <= 0) ? 0 : tmp);
                        //trst.delay(-tmp);
                    }
                    
                    if (data.ease) {
                        if (typeof data.ease === "string" && _dd3_eases[data.ease]) {
                            trst.ease(_dd3_eases[data.ease]);
                        } else if (typeof data.ease === "string" && _dd3_eases["dd3_" + data.ease]) {
                            trst.ease(_dd3_eases["dd3_" + data.ease]);
                        } else if (typeof data.ease === "string" && d3[data.ease]) {
                            trst.ease(d3[data.ease]);
                        } else if (typeof data.ease === "function" && _dd3_eases[utils.getFnName(data.ease)]) {//v4
                            trst.ease(_dd3_eases[utils.getFnName(data.ease)]);//v4
                        } else {
                            utils.log("Warning! ease not found",4);
                            trst.ease(d3.easeLinear);//TODO v4: change the parsing of the easing
                        }
                    }

                    
                };


                launchTransition(data);

                /*
                if (data.min < Date.now())
                    launchTransition(data);
                else if (data.max > Date.now()) {
                    clearTimeout(_dd3_timeoutStartReceivedTransition.get(data.sendId + data.name));
                    _dd3_timeoutStartReceivedTransition.set(data.sendId + data.name, setTimeout(launchTransition.bind(null, data), data.min - Date.now()));
                }
                clearTimeout(_dd3_timeoutEndReceivedTransition.get(data.sendId + data.name));
                _dd3_timeoutEndReceivedTransition.set(data.sendId + data.name, setTimeout(_dd3_endTransitionHandler.bind(null, {sendId : data.sendId, name: data.name, remove : false}), data.max - Date.now()));
                */
            };

            //Handler to be called upon the reception of an end transition from peerjs.
            //Interrupt the transition and remove element if data.remove is true.
            var _dd3_endTransitionHandler = function (data) {
                var obj = d3.select("#" + data.sendId);
                obj.interrupt(data.name);
                if (data.remove)
                    _dd3_removeHandler(data);
            };

            /**
             *  Hook helper functions for d3
             */

            //TODEL: used once by a function which is never used
            var _dd3_hook_d3 = function (hook, newObj) {
                var a = function () {
                    if (!arguments.length) return hook();
                    hook.apply(this, arguments);
                    return newObj;
                };
                return a;
            };

            //TODEL: used once by a function which is never used
            var _dd3_hook_basic = function (hook) {
                var a = function () {
                    return hook.apply(this, arguments);
                };
                return a;
            };

            //TODEL: Never used
            var _dd3_hookD3Object = function (oldObj, newObj) {
                for (var func in oldObj) {
                    if (oldObj.hasOwnProperty(func)) {
                        newObj[func] = _dd3_hook_d3(oldObj[func], newObj);
                    }
                }
            };

            //TODEL: Never used
            var _dd3_hookObject = function (oldObj, newObj) {
                for (var func in oldObj) {
                    if (oldObj.hasOwnProperty(func)) {
                        newObj[func] = _dd3_hook_basic(oldObj[func]);
                    }
                }
            };

            //TODEL: Never user
            var _dd3_default = function (value, def) {
                return typeof value === "undefined" ? def : value;
            };

            /**
             *  dd3.synchronize
             */

            // Send a message to server to synchronize after the optionnal timeout,
            // the callback is then triggered by the server on every browsers approximately simultaneously
            _dd3.synchronize = (function () {
                var nop = function () { };

                return function (_, t) {
                    _ = typeof _ === "function" ? _ : nop;
                    signalR.syncCallback = function () {
                        syncTime = Date.now();
                        utils.log("Synchronized !", 0);
                        _();
                    };
                    setTimeout(function () {
                        signalR.server.synchronize(signalR.sid);
                    }, t || 0);
                };
            })();

            /**
            *  dd3.selection
            */


            /*APIDOC: see d3.selection */
            _dd3.selection = d3.selection;


            //Create the watcher function for a given prototype
            //IN: prototype of the object to watch for 
            //OUT: the watcher function:  
            var _dd3_factory = function (path) {
                //append the original function with functionName suffixed with a _ to the input prototype.
                // and then call watcher with arguments as its first argument.
                return function (watcher, original, funcName) {
                    //add a function to the prototype specified in the second arguments.
                    path[funcName + '_'] = original;

                    //INFO: difference between apply and call: apply lets you specify arguments as an array.
                    //Call the watcher function with no context and the argument 1 in an array 

                    return watcher.apply(null, [].slice.call(arguments, 1));
                };
            };


            //Function to add a watcher function on a change function call to selection. Function in _dd3.selection.prototype
            var _dd3_watchFactory = _dd3_factory(_dd3.selection.prototype);

            //Function to add a watcher function on a enter funtion call to selection. Function in _dd3.selection.prototype.enter.prototype 
            var _dd3_watchEnterFactory = _dd3_factory(_dd3.selection.prototype.enter.prototype);

            //Function to add a watcher function on selection function. Function in _dd3
            var _dd3_watchSelectFactory = _dd3_factory(_dd3);

            //Called on a change to the DOM structure

            var _dd3_watchChange = function (original, funcName, expectedArg) {
                return function () {
                    if (arguments.length < expectedArg && typeof arguments[0] !== 'object')
                        return original.apply(this, arguments);
                    
                    original.apply(this, arguments);

                    //e is the property  of changes that have yet to be received and that we are watching for
                    var e = _dd3_selection_createProperties(_dd3_selection_filterWatched(this));

                    //If there are properties to change on watched and unreceived, send them
                    if (!e.empty())
                        _dd3_selection_send.call(e, 'property', { 'function': funcName, 'property': arguments[0] });

                    return this;
                };
            };


            //Called when a DOM element is added to the DOM structure
            var _dd3_watchAdd = function (original, funcName) {
                return function (what, beforeWhat) {
                    if (funcName === 'append') {
                        beforeWhat = function () {

                            var a = _dd3_selection_filterUnreceived(d3.selectAll(this.childNodes));
                            return (a[0] && a[0][a[0].length - 1] && a[0][a[0].length - 1].nextElementSibling);//TO v4 added one additionnal condition which shouldn't trigger
                        };
                    }



                    return _dd3.selection.prototype.insert_.call(this, what, beforeWhat).each(function () {
                        _dd3_createProperties.call(this);
                        if (this.parentNode.__unwatch__)
                            _dd3_unwatch.call(this);
                    });
                };
            };


            //Called when a DOM element is selected
            var _dd3_watchSelect = function (original) {
                return function (selector) {
                    if (typeof selector !== "string") return original.apply(this, arguments);// if the selector is not a string, nothing to do
                    selector += ':not(.dd3_received)';
                    //else, we don't want to select elements that have yet to be received.
                    return original.call(this, selector);
                };
            };


            //Called when no operation is performer ... or an insert call in some remote circumstances
            var _dd3_watchNoOperation = function (original) {

                return function () {
                    return original.apply(this, arguments);
                };
            };

            //watchFactory since D3 functions under d3.selection.prototype
            //first arg is the watcher, second is the d3 function to watch for, third is the name of the new function and fourth is the number of expected arguments for this function.

            _dd3.selection.prototype.attr = _dd3_watchFactory(_dd3_watchChange, d3.selection.prototype.attr, 'attr', 2);

            _dd3.selection.prototype.style = _dd3_watchFactory(_dd3_watchChange, d3.selection.prototype.style, 'style', 2);

            _dd3.selection.prototype.html = _dd3_watchFactory(_dd3_watchChange, d3.selection.prototype.html, 'html', 1);

            _dd3.selection.prototype.text = _dd3_watchFactory(_dd3_watchChange, d3.selection.prototype.text, 'text', 1);

            _dd3.selection.prototype.classed = _dd3_watchFactory(_dd3_watchChange, d3.selection.prototype.classed, 'classed', 2);

            _dd3.selection.prototype.property = _dd3_watchFactory(_dd3_watchChange, d3.selection.prototype.property, 'property', 2);

            _dd3.selection.prototype.remove = _dd3_watchFactory(_dd3_watchChange, d3.selection.prototype.remove, 'remove', 0);


            //_dd3.selection.enter={};
            //_dd3.selection.enter.prototype={};
            //_dd3.selection.enter.prototype.insert = _dd3_watchEnterFactory(_dd3_watchNoOperation, d3.selection.enter.prototype.insert, 'insert');
            _dd3.selection.prototype.enter.prototype.insert = _dd3_watchEnterFactory(_dd3_watchAdd, d3.selection.prototype.insert, 'insert');//warning: used to be d3.selection.prototype.enter.prototype.insert
            //PREVIOUSLY: _dd3.selection.enter.prototype.insert = _dd3_watchEnterFactory(_dd3_watchNop, d3.selection.enter.prototype.insert, 'insert');

            _dd3.selection.prototype.insert = _dd3_watchFactory(_dd3_watchAdd, d3.selection.prototype.insert, 'insert');

            _dd3.selection.prototype.enter.prototype.append = _dd3_watchEnterFactory(_dd3_watchAdd, d3.selection.prototype.append, 'append');

            _dd3.selection.prototype.append = _dd3_watchFactory(_dd3_watchAdd, d3.selection.prototype.append, 'append');//v4

            _dd3.selection.prototype.selectAll = _dd3_watchFactory(_dd3_watchSelect, d3.selection.prototype.selectAll, 'selectAll');

            _dd3.selection.prototype.select = _dd3_watchFactory(_dd3_watchSelect, d3.selection.prototype.select, 'select');

            //watchFactory since D3 functions under d3

            _dd3.selectAll = _dd3_watchSelectFactory(_dd3_watchSelect, d3.selectAll, 'selectAll');

            _dd3.select = _dd3_watchSelectFactory(_dd3_watchSelect, d3.select, 'select');

            utils.log('All selection functions added', 1);


            /**
            *  Function for preparing and sending data
            *  newSelection are the recipients
            *  oldSelection are the former recipients
            *  Returns which elements enter, update or exit the new selection 
            */
            var _dd3_getSelections = function (newSelection, oldSelection) {
                var ns = newSelection.slice(),
                    os = oldSelection.slice();

                var enter = [],
                    update = [],
                    exit = [],
                    i;

                var contain = function (a, v) {
                    var r = -1;
                    a.some(function (d, i) {
                        if (d[0] === v[0] && d[1] === v[1]) {
                            r = i;
                            return true;
                        }
                        return false;
                    });
                    return r;
                };

                if (!(ns instanceof Array)) utils.log("V4 Error: ns is a Map and handled as an array",4);
                ns.forEach(function (d) {
                    if ((i = contain(os, d)) >= 0) {
                        os[i].min = d.min;
                        os[i].max = d.max;
                        update.push(os.splice(i, 1)[0]);
                    }
                    else {
                        enter.push(d);
                    }
                });

                exit = os;

                return [enter, update, exit];
            };

            /**  Find all browsers which MAY need to receive the element */
            var _dd3_findRecipients = function (el) {

                if (!el)
                    return [];
                // Take the bounding rectangle and find browsers at the extremities of it (topleft and bottomright are enough)
                // Add as recipients every browsers inside the 2 browsers found above
                // An improvement could be to check if there is an interesection between the shape and a browser
                // Which means between a rectangle and an svg element -> see the 'intersection library' which computes
                // intersection between svg elements. (Be careful - filled elements should be sent to browsers they contain !)

                var rcpt = [];
                var rect = el.getBoundingClientRect(); // Relative to local html

                if ((rect.bottom > browser.height || rect.top < 0 || rect.right > browser.width || rect.left < 0) && (rect.width !== 0 && rect.height !== 0)) {
                    var f = hlhg,
                        topLeft = _dd3_findBrowserAt(f.left(rect.left), f.top(rect.top), 'html'),
                        bottomRight = _dd3_findBrowserAt(f.left(rect.right), f.top(rect.bottom), 'html');

                    for (var i = Math.max(topLeft[0], 0), maxR = Math.min(bottomRight[0], cave.rows - 1); i <= maxR; i++) {
                        for (var j = Math.max(topLeft[1], 0), maxC = Math.min(bottomRight[1], cave.columns - 1); j <= maxC; j++) { // Check to simplify
                            if (i != browser.row || j != browser.column) {
                                rcpt.push([i, j]);
                            }
                        }
                    }
                }
                return rcpt;
            };

            /** Return the browser coordinates adapted to the svg/html context
             */
            var _dd3_findBrowserAt = function (left, top, context) {
                context = context || 'svg';

                if (context === "svg") {
                    left = sghg.left(left);
                    top = sghg.top(top);
                }

                var pos = [];
                pos[0] = ~~(top / browser.height);
                pos[1] = ~~(left / browser.width);

                return pos;
            };

            /** Take the first array of recipients and add to the second one all those which are not already in it */
            var _dd3_mergeRecipientsIn = function (a, b) {
                var chk;

                a.forEach(function (c) {
                    chk = b.some(function (d) {
                        if (c[0] === d[0] && c[1] === d[1]) {
                            d.min = c.min ? Math.min(d.min || c.min, c.min) : d.min;
                            d.max = c.max ? Math.max(d.max || c.max, c.max) : d.max;
                            return true;
                        }
                        return false;
                    });

                    if (!chk) {
                        b.push(utils.clone(c));
                    }
                });
            };

            /** Take the two arrays of recipients, add all those which are not already in it and returned a merged array*/
            var _dd3_mergeRecipients = function (a, b) {
                var c = b.slice();
                _dd3_mergeRecipientsIn(a, c);
                return c;
            };

            /** Behaviour when a shape is sent. Can be used manually.  */
            _dd3.selection.prototype.send = function () {
                _dd3_selection_createProperties(this);
                return _dd3_selection_send.call(this, 'shape');
            };

            /** Sends each elements of an array based on its type.*/
            var _dd3_selection_send = function (type, args) {
                var counter = 0, formerRcpts, rcpt, rcpts = [], objs, selections;

                this.each(function () {
                    if (this.nodeName === 'g')
                        counter += _dd3_sendGroup.call(this, type, args, rcpts);
                    else
                        counter += _dd3_sendElement.call(this, type, args, rcpts);
                });

                // We buffered so we need to flush buffer of recipients !
                rcpts.forEach(function (d) { peer.flush(d[0], d[1]); });


                if (counter > 0)
                    utils.log("Sending " + type + " to " + counter + " recipients...");

                return this;
            };

            /** send an element to its recipients
             * type: can be shape, property, endTransition, transitions and updateContainer
             * args: 
             * rcpts: array of recipients for this send
             */
            
            var _dd3_sendElement = function (type, args, rcpts) {
                var active = this.__dd3_transitions__.size() > 0, rcpt, formerRcpts, selections, objs;
                // Get former recipients list saved in the __recipients__ variable to send them 'exit' message
                formerRcpts = this.__recipients__;
                // Get current recipients

                rcpt = this.__recipients__ = _dd3_findTransitionsRecipients(this);
                // Create (enter,update,exit) selections with the recipients
                selections = _dd3_getSelections(rcpt, formerRcpts);


                if (rcpt.length > 0 || formerRcpts.length > 0) {
                    // Create the object to send
                    objs = _dd3_dataFormatter(this, true, type, selections, args, active);
                    // Send it to all who may have to plot it
                    rcpt = _dd3_dataSender(objs, selections);
                    // Save all recipients to flush buffer for them afterwards
                    _dd3_mergeRecipientsIn(rcpt, rcpts);
                }
                return rcpt.length;
            };

            /** Send group of elements to their recipients */
            var _dd3_sendGroup = function (type, args, rcpts) {

                var active = this.__dd3_transitions__.size() > 0, rcpt, objs;

                // Get current recipients
                rcpt = _dd3_getChildrenRcpts.call(this, []);

                if (this.parentNode) // If the group is still in the dom, we notify children. Otherwise they will be deleted in every previous recipients dom with the group deletion anyway
                    _dd3_notifyChildren.call(this, 'updateContainer');

                rcpt = _dd3_getSelections(_dd3_getChildrenRcpts.call(this, []), rcpt)[1];

                if (rcpt.length > 0) {
                    // Create the object to send
                    objs = _dd3_dataFormatter(this, false, type, [rcpt], args, active);
                    // Send it to all who may have to plot it
                    rcpt = _dd3_dataSender(objs, [rcpt]);
                    // Save all recipients to flush buffer for them afterwards
                    _dd3_mergeRecipientsIn(rcpt, rcpts);
                }

                return rcpt.length;
            };

            /**Format the data before sending it*/
            var _dd3_dataFormatter = (function () {
                var sendId = 1;

                //- Functions for creating objects to be send

                var createShapeObject = function (obj, elem, onSend) {
                    var groups = getParentGroups(elem, onSend);

                    obj.type = 'shape';
                    obj.attr = utils.getAttr(elem);
                    obj.name = elem.nodeName;
                    obj.html = elem.innerHTML;
                    // Remember the container to keep the drawing order (superposition)
                    obj.containers = groups;
                };

                var createPropertiesObject = function (obj, elem, f, props) {
                    var array = [];
                    for (var prop in props) {
                        var objTemp = utils.clone(obj);
                        createPropertyObject(objTemp, elem, f, prop);
                        array.push(objTemp);
                    }
                    return array;
                };

                var createPropertyObject = function (obj, elem, f, p) {
                    if (f !== "remove") {
                        obj.type = 'property';
                        obj.function = f;

                        if (f !== "text" && f !== "html") {
                            obj.value = d3.select(elem)[f + '_'](obj.property = p);
                        } else {
                            obj.value = d3.select(elem)[f + '_']();
                        }
                    }
                };

                var createTransitionsObject = function (obj, elem, onSend) {
                    return [].slice.call(elem.__dd3_transitions__.values().map(function (v) {
                        var objTemp = utils.clone(obj);
                        createTransitionObject(objTemp, v, onSend);
                        return objTemp;
                    }));
                    // Needed for integration into GDO framework as it seems that constructor are different !
                    // And peer.js test equality with constructors to send data !
                };

                var createTransitionObject = function (obj, args, onSend) {
                    obj.type = 'transition';

                    obj.name = args.name;
                    obj.duration = args.duration;
                    obj.delay = args.delay;
                    obj.elapsed = _dd3_timeTransitionRelative ? args.time - syncTime : args.time;
                    obj.ease = args.ease;
                    obj.tweens = args.tweens;
                    obj.attrTweens = args.attrTweens;
                    obj.styleTweens = args.styleTweens;
                    obj.id = args.id;
                    obj.start = { attr: {}, style: {} };
                    obj.end = { attr: {}, style: {} };

                    //TODO v4: it seems oe of the thing we send is a function

                    if (!(args.properties instanceof Array)) utils.log("V4 Error: args.properties  is a Map  and handled as an array",4);
                    args.properties.forEach(function (p, i) {
                        var d = p.split('.');
                        if (d[0] !== "tween") {
                            obj.start[d[0]][d[1]] = args.startValues[i];
                            obj.end[d[0]][d[1]] = args.endValues[i];
                        }
                    });

                    //*
                    onSend.push(function (rcpt) {
                        obj.min = rcpt.min;
                        obj.max = rcpt.max;
                    });
                    //*/
                };

                var createEndTransitionsObject = function (obj, elem, remove) {
                    return [].slice.call(elem.__dd3_transitions__.values().map(function (v) {
                        var objTemp = utils.clone(obj);
                        createEndTransitionObject(objTemp, v.name, remove);
                        return objTemp;
                    }));
                    // Needed for integration into GDO framework as it seems that constructor are different !
                    // And peer.js test equality with constructors to send data !
                };

                var createEndTransitionObject = function (obj, name, remove) {
                    obj.type = 'endTransition';
                    obj.name = name;
                    obj.remove = remove;
                };

                //- Helper functions

                var getParentGroups = function (elem, onSend) {
                    var containers = [], g = elem.parentNode, obj, sdId;

                    do {
                        if (!g.id.startsWith("dd3_")) {
                            sdId = getSendId(g.__sendId__ = g.__sendId__ || sendId++);
                            obj = { 'id': sdId, 'transform': g.getAttribute("transform"), 'class': (g.getAttribute("class") || "") + ' dd3_received', 'order': g.getAttribute('order') };
                            if (g.__dd3_transitions__.size() > 0)
                                obj.transition = createTransitionsObject({ 'sendId': sdId }, g, onSend);
                        } else {
                            obj = g.id;
                        }
                        containers.unshift(obj);
                    } while (!g.id.startsWith("dd3_") && (g = g.parentNode));

                    return containers;
                };

                var getSendId = function (id) {
                    return ("dd3_" + browser.row + '-' + browser.column + "_" + id);
                };

                var formatElem = function (s, i, elem, type, selections, args, active, objs, obj) {
                    if (s.length === 0) {
                        objs.push(false);
                        return;
                    }

                    var objTemp = utils.clone(obj);
                    var onSend = [];

                    switch (i) {
                        case 0:  // If enter, in all cases we send a new shape
                            createShapeObject(objTemp, elem, onSend);

                            if (active) {
                                objTemp = [objTemp, createTransitionsObject(utils.clone(obj), elem, onSend)];
                            }
                            break;

                        case 1: // If update...

                            if (type === 'shape') { // If we want to send the shape...
                                createShapeObject(objTemp, elem, onSend);
                            } else if (type === 'property') { // Otherwise, if we just want to update a property ...
                                if (typeof args.property === 'object') { // If we gave object as { property -> value, ... }
                                    objTemp = createPropertiesObject(objTemp, elem, args.function, args.property);
                                } else {
                                    createPropertyObject(objTemp, elem, args.function, args.property);
                                }
                            } else if (type === "endTransition") {
                                createEndTransitionObject(objTemp, args.name, false);
                            } else if (type === "transitions") {
                                createTransitionObject(objTemp, elem.__dd3_transitions__.get(args.ns), onSend);
                            } else if (type === "updateContainer") {
                                objTemp = false;
                            }

                            break;

                        case 2:

                            if (type === "transitions") {
                                createEndTransitionsObject(objTemp, elem, true);
                            } else if (type === "endTransition") {
                                createEndTransitionObject(objTemp, args.name, true);
                            } else if (active && type === "updateContainer") {
                                createEndTransitionsObject(objTemp, elem, true);
                            }
                            break;
                    }

                    if (objTemp) {
                        objTemp.onSend = onSend;
                    }
                    objs.push(objTemp);
                };

                var formatGroup = function (elem, type, selections, args, active, objs, obj) {
                    var onSend = [];
                    if (type === 'property') {
                        if (typeof args.property === 'object') { // If we gave object as { property -> value, ... }
                            obj = createPropertiesObject(obj, elem, args.function, args.property);
                        } else {
                            createPropertyObject(obj, elem, args.function, args.property);
                        }
                    } else if (type === 'transitions') {
                        var objTemp = utils.clone(obj);
                        obj = createTransitionsObject(objTemp, elem, onSend);
                    } else if (type === 'endTransition') {
                        createEndTransitionObject(obj, args.name, false);
                    } else {
                        objs.push(false);
                        utils.log('Not handling : type is ' + type);
                        return;
                    }
                    if (obj) {
                        obj.onSend = onSend;
                    }
                    objs.push(obj);
                };

                return function (elem, isElem, type, selections, args, active) {

                    // Bound sendId to the sent shape to be able to retrieve it later in recipients' dom
                    elem.__sendId__ = elem.__sendId__ || sendId++;

                    var objs = [],
                        obj = {
                            type: 'remove',
                            sendId: getSendId(elem.__sendId__)
                        };


                    if (!(selections instanceof Array)) utils.log("V4 Error: selections  is a Map and handled as an array",4);
                    selections.forEach(function (s, i) {
                        if (isElem) {
                            formatElem(s, i, elem, type, selections, args, active, objs, obj);
                        } else {
                            formatGroup(elem, type, selections, args, active, objs, obj);
                        }
                    });

                    return objs;
                };

            })();

            var _dd3_dataSender = function (objs, selections) {
                // Allow to do something special for each selection (enter, update, exit) of recipients
                if (!(selections instanceof Array)) utils.log("V4 Error: selections  is a Map and handled as an array",4);
                selections.forEach(function (s, i) {
                    if (objs[i]) {
                        if (!(s instanceof Array)) utils.log("V4 Error: s is a Map and handled as an array",4);
                        s.forEach(function (d) {
                            var obj = objs[i];
                            if (obj.onSend.length > 0) {
                                obj.onSend.forEach(function (f) { f(d); });
                                obj = utils.clone(obj);
                                delete obj.onSend;
                            }
                            peer.sendTo(d[0], d[1], obj, true); // true for buffering 
                        });
                    }
                });

                return d3.merge(selections);
            };


            /**
            *  Watch methods    
            */

            // To go to helpers
            var _dd3_funct = function (f, args) {
                return function () {
                    f.apply(this, args);
                };
            };

            _dd3.selection.prototype.watch = function (spread) {
                spread = typeof spread === "undefined" ? false : spread;

                this.each(_dd3_funct(_dd3_watch, [spread]));
                return this;
            };

            var _dd3_watch = function () {
                if (this.__unwatch__) delete this.__unwatch__;
                if (this.nodeName === 'g')
                    [].forEach.call(this.childNodes, function (_) { _dd3_watch.call(_); });
            };

            _dd3.selection.prototype.unwatch = function () {

                this.each(_dd3_unwatch);
                return this;
            };

            var _dd3_unwatch = function () {
                this.__unwatch__ = true;
                if (this.nodeName === 'g')
                    [].forEach.call(this.childNodes, function (_) { _dd3_unwatch.call(_); });
            };

            /** calls _dd3_createProperties for each element in the input*/
            var _dd3_selection_createProperties = function (elem) {

                elem.each(function () { _dd3_createProperties.call(this); });
                return elem;
            };

            /** Create dd3 specific properties on the object: recipient list, transitions and ordering  */
            var _dd3_createProperties = function () {
                if (!this.__recipients__) {
                    this.__recipients__ = [];
                    this.__dd3_transitions__ = d3.map();
                    this.setAttribute('order', getOrder(this));
                }

                if (this.nodeName === 'g')
                    [].forEach.call(this.childNodes, function (_) { _dd3_createProperties.call(_); });
            };

            //Filter elements from a d3 selection to keep only  
            var _dd3_selection_filterWatched = function (e) {
                return e.filter(function (d, i) {
                    return !this.__unwatch__ && ([].indexOf.call(this.classList, 'dd3_received') < 0);
                });
            };

            var _dd3_selection_filterUnreceived = function (e) {
                return e.filter(function () {
                    return !_dd3_isReceived(this);
                });
            };

            var _dd3_isReceived = function (e) {
                return [].indexOf.call(e.classList || [], 'dd3_received') >= 0;
            };

            var _dd3_selection_filterGroup = function (e) {
                return e.filter(function (d, i) {
                    return (this.nodeName.toLowerCase() === "g");
                });
            };

            var _dd3_selection_filterNonGroup = function (e) {
                return e.filter(function (d, i) {
                    return (this.nodeName.toLowerCase() !== "g");
                });
            };

            var _dd3_notifyChildren = function (name) {
                if (this.__unwatch__ || ([].indexOf.call(this.classList, 'dd3_received') >= 0))
                    return;

                //TODO v4: apparently this thing is supposed to add shape
                if (this.nodeName === 'g')
                    [].forEach.call(this.childNodes, function (_) { _dd3_notifyChildren.call(_, name); });
                else
                    _dd3_selection_send.call(_dd3.select_(this), name);
            };

            var _dd3_getChildrenRcpts = function (array) {
                if (this.nodeName === 'g')
                    return [].forEach.call(this.childNodes, function (_) { _dd3_mergeRecipientsIn(_dd3_getChildrenRcpts.call(_, array), array); }), array;
                else
                    return this.__recipients__ || (log("No recipients"), []);
            };

            var getOrder = function (elem) {
                var s, prev = elem, prevOrder = 0, next = elem, nextOrder, o = browser.row + '-' + browser.column;

                prev = getPreviousElemOrdered(elem);
                if (prev) {
                    s = prev.getAttribute("order").split("_");
                    if (s[0] === o)
                        prevOrder = +s[1];
                }

                next = getNextElemOrdered(elem);
                if (next) {
                    s = next.getAttribute("order").split("_");
                    if (s[0] === o)
                        nextOrder = +s[1];
                }

                o += "_" + (nextOrder ? (prevOrder + nextOrder) / 2 : prevOrder + 1);

                return o;
            };

            var getPreviousElemOrdered = function (elem) {
                elem = elem.previousElementSibling;
                while (elem) {
                    if (elem.getAttribute("order"))
                        return elem;
                    elem = elem.previousElementSibling;
                }
            };

            var getNextElemOrdered = function (elem) {
                elem = elem.nextElementSibling;
                while (elem) {
                    if (elem.getAttribute("order"))
                        return elem;
                    elem = elem.nextElementSibling;
                }
            };

            /**
             *  Transition
             */

            //TODEL: set to false and never changed
            var _dd3_timeTransitionRelative = false;

            var _dd3_precision = 0.01;

            var _dd3_idTransition = 1;

            //Contain tween functions for transitions. Prevents having to send tween funciton definition through peerjs
            var _dd3_tweens = {};

            //Contain tween functions for transitions. Prevents having to send ease function definition through peerjs
            var _dd3_eases = {};

            var _dd3_transitionNamespace = function (name) {
                return !name ? "__transition__" : "__transition_" + name + "__";
            };

            
            var _dd3_findTransitionsRecipients = function (elem) {
                if (!elem || !elem.parentNode) {
                    return [];
                }

                var g = elem.parentNode,
                    containers = [],
                    clones,
                    transitionsInfos,
                    tween,
                    rcpts = [],
                    now = Date.now(),
                    max = now,
                    precision = 1;
                do {
                    
                    containers.unshift(g);
                } while (g.id !== "dd3_rootGroup" && (g = g.parentNode));
                

                var c1 = containers[0], c2;


                while (c1 && c1.__dd3_transitions__.empty()) {//TODO v4: c1.__dd3_transitions__ should be instantiated as long as c1 is

                    c2 = containers.shift();
                    c1 = containers[0];
                }

                c1 = c2; // Both c1 and c2 correspond to the highest parent non transitionning and not included in a transitionning parent
                containers.push(elem);

                clones = containers.map(function (c) {
                    g = c.cloneNode(c.nodeName === "g" ? false : true);
                    c2.appendChild(g); 
                    c2 = g;
                    return g;
                });

                //TODO v4: is it because too many elements in containers
                transitionsInfos = containers.map(function (c) {
                    return c.__dd3_transitions__.values().map(function (v) {
                        var trst = v.transition;
                        var init_time = v.time;
                        //var init_time = (trst.time)? trst.time: Date.now() ;//TODO v4: find another way to get initial time
                        max = (init_time + v.duration + v.delay) > max ? (init_time + v.duration + v.delay) : max;
                        precision = v.precision < precision ? v.precision : precision;
                        //INFO: in v4, v.ease is a function not a string
                        return {
                            tweened: v.tweened,
                            ease: (typeof v.ease === "string") ? v.ease : utils.getFnName(v.ease),//v4
                            time: init_time + v.delay,
                            duration: v.duration
                        };
                    });
                });
                // ! Doesn't take in account order of the transitions !
                var step = precision * (max - now);
                
                //TODO v4: fixing the  other mistake oof no dd3 transitions would be better
                var range = d3.range(now, max, step);
                range.push(max);

                //V4: fine at this point
                range.forEach(function (time) {
                    if (!(transitionsInfos instanceof Array)) utild.log("V4 Error: transitionsInfos is a Map and handled as an array",4);
                    transitionsInfos.forEach(function (c, i) {
                        if (c) {
                            c.forEach(function (obj) {
                                var a = (time - obj.time) / obj.duration;
                                if (a >= 0 && a <= 1) {
                                    var t;
                                    if(_dd3_eases[obj.ease] ){
                                        t = _dd3_eases[obj.ease](a);
                                    }else{
                                        t = d3[obj.ease](a);//V4: why not a function directly
                                    }
                                     //TODO V4: we've got  the interpolator ??? Why not use them instead of the tween
                                    if (!(obj.tweened instanceof Array)) utils.log("V4 Error: obj.tweened  is a Map and handled as an array",4);
                                    obj.tweened.forEach(function (f) {
                                        f.call(clones[i], t);
                                    });

                                }
                            });
                        } else {
                            utils.log("Warning! transition info doesn't exist",4);
                        }
                    });
                    var rcpt = _dd3_findRecipients(g);

                    if (!(rcpt instanceof Array)) utils.log("V4 Error: rcpt  is a Map and handled as an array",4);
                    rcpt.forEach(function (r) {
                        r.min = time - step;
                        r.max = time + step;
                    });
                    _dd3_mergeRecipientsIn(rcpt, rcpts);
                });
                c1.removeChild(clones[0]); //TODO v4: doesn't appear to be used after that.

                //utils.log("Computed in " + (Date.now() - now)/1000 + "s probable recipients: [" + rcpts.join('],[') + ']', 2);
                //utils.log("Computed in " + (Date.now() - now)/1000 + " sec", 2);

                return rcpts;
            };

            var _dd3_retrieveTransitionSettings = function (elem, args) {
                var node = elem.cloneNode(false),
                    group = utils.getContainingGroup(elem),
                    tween = args.transition.tween,
                    tweened = [],
                    properties = [],
                    startValues = [],
                    endValues = [];

                //TODO v4: find how to call tween.each
                
                //TODO v4: refine
                /*var d_transition;
                for(var key in args.transition.node().__transition) d_transition=args.transition.node().__transition[key];*/
                

                /*for (var k in d_transition.value){
                    properties.push(k);
                    tweened.push(d_transition.value[k]);
                }*/
                
                //TODO v4: something in this block prevenrs the transition from running
                tween.forEach(function (obj) {
                    //var type = value.type;
                    
                    //var value = obj.value.call(elem, args.data, args.index);
                    var i = obj.value._value.call(elem, args.data, args.index);
                    //TODO v4: handle if NAMEspace and if style
                    var name = obj.name.split('.')[1];
                    var value = function(t){
                        this.setAttribute(name, i(t));
                    };
                    //The original tween function  is bound to the node it interpolates.
                    
                    if (value) {
                          properties.push(obj.name);
                          tweened.push(value);
                    }
                });
                

                group.appendChild(node);
                

                var d3_node = d3.select(node);
                
                /*
                properties.forEach(function(prop){
                    var ps = prop.split('.'),
                        p0 = ps[0],
                        p1 = typeof ps[1] !== "undefined" ? [ps[1]] : [];
                    //TODO v4: quite weird we have to parse float
                    //startValues.push(parseFloat(d3_node[p0].apply(d3_node, p1)));
                    //endValues.push(args.transition.value[prop]);
                });
*/
                

                //TODO v4: check if we can have start and end values without touching stuff

                if (!(tweened instanceof Array)) utils.log("V4 Error: tweened  is a Map and handled as an array",4);
                tweened.forEach(function (f, j) {
                    var ps = properties[j].split('.'),
                        p0 = ps[0],
                        p1 = typeof ps[1] !== "undefined" ? [ps[1]] : [];

                    if (p0 === "tween") {
                        startValues.push(null);
                        endValues.push(null);
                    } else {
                        
                        //TODO v4: how can I call thos
                        f.call(node, 0);
                        
                        startValues.push(d3_node[p0].apply(d3_node, p1));
                        f.call(node, 1);

                        endValues.push(d3_node[p0].apply(d3_node, p1));
                        //endValues.push(args.transition.value[properties[j]]+"");
                    }
                });

                
                    
                group.removeChild(node);


                args.startValues = startValues;
                args.endValues = endValues;
                args.tweened = tweened;
                args.properties = properties;
            };

            var _dd3_hook_selection_transition = _dd3.selection.prototype.transition_ = d3.selection.prototype.transition;//TODO: v4 still exist?

            var _dd3_hook_transition_transition = d3.transition.prototype.transition; //TODO: v4 still exists?

            _dd3.selection.prototype.transition = function (name) {
                var t = _dd3_selection_createProperties(_dd3_hook_selection_transition.apply(this, arguments)),
                    ns = _dd3_transitionNamespace(name),
                    ease = d3.easeCubicInOut,
                    precision = _dd3_precision;

                var initialize = function (t, ease, precision) {
                    var tweens = d3.map(), attrTweens = d3.map(), styleTweens = d3.map();

                    t.on("start.dd3", function (d, i) {
                        if (!this.parentNode || _dd3_isReceived(this) || this.__unwatch__)
                            return;

                        /*var transition;
                        for(var k in this.__transition){
                            if(this.__transition[i]){
                                transition=this.__transition[i];
                                break;
                            }
                        }*/


                        //var transition = this[ns][this[ns].active];
                        var transition = d3.active(this);//v4 this appear to be the problem. It returns the transition

                        if(transition){
                            for(var k in transition.node().__transition){
                                transition = transition.node().__transition[k];
                                if (transition) break;
                            }
                        } else {
                            for (var k in this.__transition){
                                transition = this.__transition[k];
                                if (transition) break;
                            }
                        }
                        if(!transition) utils.log("V4 Warning: No transition on the object",4);

                        
                        //var transition = this.__transition[2];
                        //if(!transition) transition = this.__transition[2];
                        /*if(!transition) {
                            for (var i = 0 ; i<this.__transition.length; i++){
                                transition = this.__transition[i];
                                if(transition) break;
                            }
                            if(!transition){
                              utils.log("V4 Warning: No transition on the object",4);
                              return;
                            }
                        }*/

                        //if(!transition) return; // V4: not sure this is optimal

                        // Needed for integration into GDO framework as it seems that constructor are different !
                        // And peer.js test equality with constructors to send data !

                        var tweenFunctions = [].slice.call(tweens.entries());
                        if (!(tweenFunctions instanceof Array)) utils.log("V4 Error: tweenFunctions  is a Map  and handled as an array",4);
                        tweenFunctions.forEach(function (d) {
                            Object.defineProperty(d, 'constructor', {
                                enumerable: false,
                                configurable: false,
                                writable: false,
                                value: Object
                            });
                        });

                        var attrTweenFunctions = [].slice.call(attrTweens.entries());
                        if (!(attrTweenFunctions instanceof Array)) utils.log("V4 Error: attrTweenFunctions  is a Map and handled as an array",4);
                        attrTweenFunctions.forEach(function (d) {
                            Object.defineProperty(d, 'constructor', {
                                enumerable: false,
                                configurable: false,
                                writable: false,
                                value: Object
                            });
                        });

                        var styleTweenFunctions = [].slice.call(styleTweens.entries());
                        if (!(styleTweenFunctions instanceof Array)) utils.log("V4 Error: styleTweenFunctions  is a Map and handled as an array",4);
                        styleTweenFunctions.forEach(function (d) {
                            Object.defineProperty(d, 'constructor', {
                                enumerable: false,
                                configurable: false,
                                writable: false,
                                value: Object
                            });
                        });

                        var args = {
                            endValues: [],
                            properties: [],
                            tweened: [],
                            tweens: tweenFunctions,
                            attrTweens: attrTweenFunctions,
                            styleTweens: styleTweenFunctions,
                            ns: ns,
                            name: name,
                            delay: (typeof transition.delay === "function") ? transition.delay() : transition.delay,//TODO v4: transition.delay doesn't exist
                            duration: (typeof transition.duration === "function") ? transition.duration() : transition.duration,//v4
                            time: (typeof transition.time === "function") ? transition.time() : transition.time,//TODO v4: transition.time doesn't exist
                            transition: transition,
                            precision: precision,
                            ease: (typeof ease === "function") ? utils.getFnName(ease) : ease,//not a string anymore
                            id: _dd3_idTransition++
                        };
                        args.elapsed = _dd3_timeTransitionRelative ? args.time - syncTime : args.time;


                        _dd3_retrieveTransitionSettings(this, args);

                        this.__dd3_transitions__.set(ns, args);//TODO: v4 should be populated
                        _dd3_selection_send.call(d3.select(this), 'transitions', { 'ns': ns });
                    });


                    t.on("interrupt.dd3", function (d, i) {

                        if (_dd3_isReceived(this) || this.__unwatch__)
                            return;
                        this.__dd3_transitions__.remove(ns);
                        _dd3_selection_send.call(d3.select(this), 'endTransition', { name: name });
                    });


                    t.on("end.dd3", function (d, i) {

                        if (_dd3_isReceived(this) || this.__unwatch__)
                            return;
                        this.__dd3_transitions__.remove(ns);
                        _dd3_selection_send.call(d3.select(this), 'endTransition', { name: name });
                    });

                    t.ease = function (e) {
                        if (typeof e === "function") {
                            dd3.defineEase(utils.getFnName(e), e);
                            e = utils.getFnName(e);
                        } else if (typeof e !== "string") {
                            utils.log("Custom ease functions have to be defined with dd3.defineEase", 2);
                            return this;
                        }
                        ease = 'dd3_' + e;
                        if (_dd3_eases[ease]) {
                            return d3.transition.prototype.ease.call(this, _dd3_eases[ease]);
                        } else {
                            return d3.transition.prototype.ease.call(this, e);
                        }
                    };

                    t.tween = function (name, tween) {
                        if (arguments.length < 2) return tweens.get(name);
                        if (utils.getFnName(tween) === "anonymous") {
                            dd3.defineTween(name + "_std_trans", tween);
                            tween = name + "_std_trans";
                        }

                        if (!tween) {
                            tweens.remove(name);
                            return d3.transition.prototype.tween.call(this, name, null);
                        } else if (typeof tween !== "string") {
                            utils.log("The tween function should be provided as a string\nCustom tween functions have to be defined with dd3.defineTween", 2);
                            return this;
                        } else if (!_dd3_tweens['dd3_' + tween]) {
                            utils.log("The function " + tween + " was not defined with dd3.defineTween\nCustom tween functions have to be defined with dd3.defineTween", 2);
                            return this;
                        }

                        tweens.set(name, 'dd3_' + tween);
                        return d3.transition.prototype.tween.call(this, name, _dd3_tweens['dd3_' + tween]);
                    };

                    //TODO V4: overwrite the attr function
                    t.attr = function (name, value){
                        
                        if(value){
                            if (typeof value === "function"){
                                _dd3_tweens["dd3_"+name+"_std_function"] = value;
                            }else{
                                _dd3_tweens["dd3_"+name+"_std_value"] = value;
                            }
                        }

                        

                        return d3.transition.prototype.attr.call(this, name, value);

                    };

                    //TODO v4: doesn't work
                    t.attrTween = function (attr, tween) {
                        var temp, trst;

                        //In v4, d3.transition.attr uses attrTween, which we don't need.  
                        if (typeof tween === "function" && utils.getFnName(tween) === "anonymous") {
                            dd3.defineTween(attr + "_std_trans", tween);
                            tween = attr + "_std_trans";
                        }
                        //v4: check attrFunctionNS$1

                        
                        if (arguments.length < 2) return attrTweens.get(attr);


                        if (!tween) {
                            attrTweens.remove(attr);
                            temp = this.tween;
                            this.tween = d3.transition.prototype.tween;
                            trst = d3.transition.prototype.attrTween.call(this, attr, null);
                            this.tween = temp;
                            return trst;
                        } else if (typeof tween !== "string") {
                            utils.log("The tween function should be provided as a string\nCustom tween functions have to be defined with dd3.defineTween", 2);
                            return this;
                        } else if (!_dd3_tweens['dd3_' + tween]) {
                            utils.log("The function " + tween + " was not defined with dd3.defineTween\nCustom tween functions have to be defined with dd3.defineTween", 2);
                            return this;
                        }

                        attrTweens.set(attr, 'dd3_' + tween);

                        temp = this.tween;
                        this.tween = d3.transition.prototype.tween;
                        trst = d3.transition.prototype.attrTween.call(this, attr, _dd3_tweens['dd3_' + tween]);
                        this.tween = temp;

                        return trst;
                    };

                    t.styleTween = function (style, tween, priority) {
                        var temp, trst;
                        if (arguments.length < 2) return styleTweens.get(style);

                        if (utils.getFnName(tween) === "anonymous") {

                            dd3.defineTween(style + "_std_trans", tween);
                            tween = style + "_std_trans";
                        }

                        if (!tween) {
                            styleTweens.remove(style);

                            temp = this.tween;
                            this.tween = d3.transition.prototype.tween;
                            trst = d3.transition.prototype.styleTween.call(this, style, null);
                            this.tween = temp;

                            return trst;
                        } else if (typeof tween !== "string") {
                            utils.log("The tween function should be provided as a string\nCustom tween functions have to be defined with dd3.defineTween", 2);
                            return this;
                        } else if (!_dd3_tweens['dd3_' + tween]) {
                            utils.log("The function " + tween + " was not defined with dd3.defineTween\nCustom tween functions have to be defined with dd3.defineTween", 2);
                            return this;
                        }

                        styleTweens.set(style, ['dd3_' + tween, priority]);

                        var args = [].slice.call(arguments);
                        args[1] = _dd3_tweens['dd3_' + tween];

                        temp = this.tween;
                        this.tween = d3.transition.prototype.tween;
                        trst = d3.transition.prototype.styleTween.apply(this, args);
                        this.tween = temp;

                        return trst;
                    };

                    t.precision = function (p) {
                        if (arguments.length < 1) return precision;
                        precision = p;
                        return this;
                    };

                    t.transition = function () {
                        return initialize(_dd3_selection_filterWatched(_dd3_hook_transition_transition.apply(this, arguments)), ease, precision);
                    };

                    return t;
                };

                return initialize(t, ease, precision);
            };

            //TODO v4: will probably fail -> should be good
            _dd3.defineEase = function (name, func) {
                if (arguments.length < 2) return _dd3_eases['dd3_' + name];
                if (!func) delete _dd3_eases['dd3_' + name];
                else _dd3_eases['dd3_' + name] = func;
                return name;
            };

            _dd3.defineTween = function (name, func, spec) {
                if (arguments.length < 2) return _dd3_tweens['dd3_' + name];
                if (!func) delete _dd3_tweens['dd3_' + name];
                else {
                    func.type = "tween" + (spec || "");
                    _dd3_tweens['dd3_' + name] = func;
                }
                return name;
            };

            _dd3.defineAttrTween = function (name, func) {
                return _dd3.defineTween(name, func, ".attr");
            };

            _dd3.defineStyleTween = function (name, func) {
                return _dd3.defineTween(name, func, ".style");
            };

            /**
             * Create the svg and provide it for use
             */
            //V4 frigging ugly but it works
            _dd3.svgNode = _dd3.select_("body").append_("svg");

            _dd3.svgCanvas = _dd3.svgNode
                .attr_("width", browser.width)
                .attr_("height", browser.height)
                .append("g")
                .attr_("id", "dd3_rootGroup")
                .attr_("transform", "translate(" + [browser.margin.left - slsg.left(0), browser.margin.top - slsg.top(0)] + ")");

            /**
             *  Getter
             *  Allow outside access to dd3 methods
             */

            _dd3.peers = peer;

            _dd3.cave = cave;

            _dd3.browser = browser;

            _dd3.getDataDimensions = dd3_data.getDimensions;

            _dd3.getData = dd3_data.getData;

            _dd3.getPointData = dd3_data.getPointData;

            _dd3.getPathData = dd3_data.getPathData;

            _dd3.getBarData = dd3_data.getBarData;

            _dd3.getPieData = dd3_data.getPieData;

            _dd3.requestRemoteData = dd3_data.requestRemoteData;

            /**Access to the data dimensions of dd3*/
            _dd3.retrieveDimensions = function (id) {
                return data["dd3_" + id].dataDimensions;
            };

            /**Access to the data of dd3*/
            _dd3.retrieveData = function (name, id) {
                return data["dd3_" + id]["dd3_" + name].dataPoints;
            };

            /** Access to the state of dd3 */
            _dd3.state = function () { return state(); };

            // We could re-synchronize before emitting the 'ready' event
            state('ready');
        };

        /**
        *  Provide listener function to listen for ready state !
        */

        _dd3.on = function (p, f) {
            if (typeof callbackListener[p] !== "undefined") {
                callbackListener[p].push(f);
                return true;
            }
            return false;
        };

        /**
         *  Initialize
         */

        utils.log('Starting dd3 initialisation', 1);
        initializer();
        utils.log('Returning _dd3', 1);
        return _dd3;

    })();
    utils.log('Returning dd3', 1);

    return dd3;
};

// These functions need to be defined before signalR is started, so we need to use a callback system:
// signalR_callback is defined later in dd3 when it is initiated.

var dd3Server = $.connection.dD3AppHub;//Contains all methods of AppHub
var signalR_callback = {};//Contains server interaction functions
var main_callback; // Callback inside the html file called when the configuration of GDO is received for application node or when the controller is updated for a controller
var orderTransmitter; // Callback inside the html file when the client is initialized

// Function used for dd3 callback
dd3Server.client.dd3Receive = function (f) {
    signalR_callback[f].apply(null, [].slice.call(arguments, 1));
};

// Non-dd3 functions

// called by AppHub when the configuration is broadcasted. Execute main_callback as defined in HTML file
dd3Server.client.receiveGDOConfiguration = function (id) {
    // To get configId from server
    if (main_callback) {
        main_callback(id);
    } else {
        gdo.consoleOut('.DD3', 1, 'No callback defined');
    }
    main_callback = null;
};

//called from AppHub. orderTransmitter is actually the orderController defined in html file. 
//It isn't in the library as the controller embed the application logic.
dd3Server.client.receiveControllerOrder = function (orders) {
    if (orderTransmitter) {
        orders = JSON.parse(orders);
        gdo.consoleOut('.DD3', 1, 'Order received : ' + orders.name + ' [' + orders.args + ']');
        orderTransmitter(orders);
    } else {
        gdo.consoleOut('.DD3', 4, 'No test controller defined');
    }
};

// ==== IF THIS NODE IS A CONTROLLER ====

//What to do when the controller is updated by the server => execute main_callback on  the received object.
dd3Server.client.updateController = function (obj) {
    gdo.consoleOut('.DD3', 1, 'Controller : Receiving update from server');
    if (main_callback) {
        main_callback(JSON.parse(obj));
    }
};


// ===============================


gdo.net.app.DD3.displayMode = 0;//TODO: email david about it

//Initialize the application node, set the orderController, the instance id, the main callback and call initDD3App;
gdo.net.app.DD3.initClient = function (launcher, orderController) {
    gdo.consoleOut('.DD3', 1, 'Initializing DD3 App Client at Node ' + gdo.clientId);
    dd3Server.instanceId = gdo.net.node[gdo.clientId].appInstanceId;
    orderTransmitter = orderController;
    main_callback = launcher;
    return initDD3App();
};

//Initialize the controller node.
gdo.net.app.DD3.initControl = function (callback) {
    gdo.consoleOut('.DD3', 1, 'Initializing DD3 App Control at Instance ' + gdo.clientId);
    main_callback = callback;
    dd3Server.server.defineController(gdo.net.instance[gdo.controlId].id);
    return gdo.net.instance[gdo.controlId].id;
};

/**What to do when application node is killed => log it + remove the client from SignalR*/ 
gdo.net.app.DD3.terminateClient = function () {
    gdo.consoleOut('.DD3', 1, 'Terminating DD3 App Client at Node ' + gdo.clientId);
    dd3Server.server.removeClient(dd3Server.instanceId);//in DD3AppHub and DD3App
};

/**What to do when controller node is killed => just log it*/
gdo.net.app.DD3.terminateControl = function () {
    gdo.consoleOut('.DD3', 1, 'Terminating DD3 App Control at Instance ' + gdo.clientId);
};