/**
 * Created by dm214 MSc Computing Science Sep2015.
 */


/**
 * Adds method to graph class that returns an array of all connected components
 * from a source node, using breadth first search
 */
sigma.classes.graph.addMethod('findConnected', function(e){
    var k, index;
    var queue = [];
    var connected = [];
    //add source node to connected component array and add to queue
    connected.push(e.data.node.id);
    queue.push(e.data.node.id);

    //ee there are still nodes to be checked in the queue
    while (queue.length > 0){

        //take item out of queue
        var v = queue.pop();

        //get its neighbours
        index = this.allNeighborsIndex[v] || {};

        //for each of its neighbours
        for (k in index){
            //if it hasn't already been visited
            if (connected.indexOf(k)==-1){
                //add it to the connected components list and queue for checking
                connected.push(this.nodesIndex[k].id);
                queue.push(this.nodesIndex[k].id);
            }
        }
    }
    return connected;
});

/**
 * Adds method to graph class that returns nodes involving a certain bitcoin address
 */
sigma.classes.graph.addMethod('getNodesByAddr', function(addr){
    return this.nodesByAddr[addr];
});

/**
 * Adds method to graph class that removes all nodes that would be 'floating'
 * and superfluous after the input vertex is removed
 */
sigma.classes.graph.addMethod('dropConnected', function(tx) {
    var txnbrs = this.allNeighborsIndex[tx];

    for (var txnbr in txnbrs) {
        //if(txnbrs.hasOwnProperty(txnbr)) {
            //default is nbr will be dropped: prove otherwise
            var isToDrop = true;
            //get all this neighbour's neighbours
            var nbrsnbrs = this.allNeighborsIndex[txnbr];
            //for each neighbour of neighbour
            for (var nbrsnbr in nbrsnbrs) {
                //if(nbrsnbrs.hasOwnProperty(nbrsnbr)) {
                    //for each of those edges (usually only one)
                    for (var edg in nbrsnbrs[nbrsnbr]) {
                        //if (nbrsnbrs[nbrsnbr].hasOwnProperty(edg)) {
                            if (nbrsnbrs[nbrsnbr][edg].source != tx &&
                                nbrsnbrs[nbrsnbr][edg].target != tx &&
                                nbrsnbrs[nbrsnbr][edg].type != 'addr_link') {

                                isToDrop = false;
                            }
                        //}
                    }
                //}
            }
            if (isToDrop) {
                //console.log(txnbr + ' will be dropped');
                this.myDropNode(this.nodes(txnbr));
            }
            else {
                //console.log(txnbr + ' wont be dropped');
            }
        //}
    }
});

/**
 * Cusom method for graph class that removes a node from the graph
 * by accepting the node object as input rather than label of default method
 */
sigma.classes.graph.addMethod('myDropNode', function(n) {
    //console.log(this.getNodesByAddr(n.addr));
    //remove node reference from custom address index before removing node
    this.nodesByAddr[n.addr].splice(this.nodesByAddr[n.addr].indexOf(n.id), 1);
    //if it's the only reference, delete the key from the object
    if (this.nodesByAddr[n.addr].length == 0) {
        delete this.nodesByAddr[n.addr];
    }

    if (n.type == 'input') {
        numIn--;
        numNodes--;
    }
    if(n.type=='output') {
        numOut--;
        numNodes--;
    }
    if(n.type=='InOut') {
        numOut--;
        numNodes--;
    }
    console.log('dropped'+this.getNodesByAddr(n.addr));
    //perform builtin method
    this.dropNode(n.id);
});

/**
 * Creates a custom index to efficiently access nodes by address
 * using JavaScript engine's approximation of a hash table (O(1)).
 */

sigma.classes.graph.addIndex('nodesByAddrIndex', {
    constructor: function(){
        this.nodesByAddr = {};
    },
    //every time we add a node, update index object
    addNode: function(n){
        if (n.type!='tx') {
            //if we've already seen addr, add id to node array for that addr
            if (this.nodesByAddr[n.addr]) {
                var latestNode = this.nodesByAddr[n.addr][this.nodesByAddr[n.addr].length - 1]
                s.graph.addEdge({
                    id: latestNode + ':' + n.id + 'joinToExistAddr',
                    source: latestNode,
                    target: n.id,
                    weight: 30,
                    origcolor: '#555555',
                    color: '#555555',
                    type: 'addr_link'
                });
                this.nodesByAddr[n.addr].push(n.id);
            }
            //else add addr to index obj with first node
            else
                this.nodesByAddr[n.addr] = [n.id];
        }
    }
});

/**
 * globally declared graph instance & other variables
 */
var isHovered = false;
var paused = false;
var msgBuf=[];
var minDegs = 0;
var minValConstraint = 0;
var maxValConstraint = Number.MAX_VALUE;
var minFeeConstraint = 0;
var maxFeeConstraint = Number.MAX_VALUE;
var addrFilter = '';
var txFilter = '';

var currUSDBTC = 0;
var txRate = 0;
var lastRateTx = 0;
var timeOfLastTx = Date.now();

var numTx = 0;
var numIn = 0
var numOut = 0;
var numNodes = 0;

var txMaxVal = 0;
var txTotalVal = 0;

var txMaxFee = 0;
var txTotalFee = 0;

var txMaxSize = 0;
var txTotalSize = 0;

var blkTimer;

var s = new sigma({
    renderer: {
        container: document.getElementById('graphcontainer'),
        type: 'canvas'
    },
    settings: {
        verbose: true,
        scalingMode: 'outside',
        batchEdgesDrawing: false,
        webglEdgesBatchSize: 50,
        hideEdgesOnMove: true,
        webglOversamplingRatio: 2,
        labelThreshold: 100000000,
        labelHoverBGColor: 'node',
        singleHover: true,
        minNodeSize: 1,
        maxNodeSize: 8,
        animationsTime: 3000
    }
});
//establish the camera
s.cameras[0].goTo({x:0,y:0,ratio:1.15,angle:0})

/**
 * Establish connection to remote controller using PeerJS
 * @param blkid
 * (blkid=-1 is flag for live transactions)
 */
function bindEvents(blkid, client){
//function peerConnect(blkid){
    //establish connection to controller
    var peer = new Peer({ key: "g9o1meczkw9x80k9" });
    //var peer = new Peer({ host: "dsigdopreprod.doc.ic.ac.uk", port: 55555 });

    var conn = peer.connect('controller');

    //update DOM with connection string
    conn.on('open', function(){
        console.log('Connection to '+conn.peer+' from '+peer.id);
        document.getElementById('peerID').innerHTML = 'ConnectionID:' + peer.id;

        conn.send({ peertype: 'info', peerpayload: client });   //SEND which node it is
        conn.send({ peertype:'block',peerpayload:blkid });
    });

    conn.on('close', function(){
        document.getElementById('peerID').innerHTML = 'Not connected to controller';
    });

    //simple messaging protocol
    conn.on('data', function(data) {
        if (data.type == 'newBlock' && data.value >= 0)
            window.open("/Web/Bitcoin/App.cshtml?block=" + data.value, '_self');

        if (data.type == 'newBlock' && data.value < 0)
            window.open("/Web/Bitcoin/App.cshtml", '_self');

        if (data.type == 'connComp') {
            if (data.value)
            //display nodes of minimum degree = 2
                minDegs = 2;
            else
            //display all nodes
                minDegs = 0;

            applyFilters();
            renderGraph();
        }

        if (data.type == 'minValConstraint') {
            minValConstraint = data.value;
            applyFilters();
            renderGraph();
        }

        if(data.type=='maxValConstraint') {
            maxValConstraint = data.value;
            applyFilters();
            renderGraph();
        }

        if (data.type == 'minFeeConstraint') {
            minFeeConstraint = data.value;
            applyFilters();
            renderGraph();
        }

        if(data.type=='maxFeeConstraint') {
            maxFeeConstraint = data.value;
            applyFilters();
            renderGraph();
        }

        if(data.type=='addrFilter') {
            addrFilter = data.value;
            applyFilters();
            renderGraph();
        }

        if(data.type=='txFilter') {
            txFilter = data.value;
            applyFilters();
            renderGraph();
        }

    });
//}

/**
 * Binds DOM events to graph
 */
//function bindEvents(){

    //colour everything grey except for hovered connected component
    s.bind('overNode',function(evt){
        isHovered = true;
        var connectedNodes = s.graph.findConnected(evt);

        s.graph.nodes().forEach(function(n) {
            if (connectedNodes.indexOf(n.id)>=0) {
                n.color = n.origcolor;
            }
            else
                n.color = '#333333';
        });

        s.graph.edges().forEach(function(e) {
            if (connectedNodes.indexOf(e.source)>=0 || connectedNodes.indexOf(e.target)>=0)
                e.color = e.origcolor;
            else
                e.color = '#333333';
        });

        //color every input/output node involving same address red
        if(evt.data.node.type != 'tx') {
            s.graph.getNodesByAddr(evt.data.node.addr).forEach(function (n) {
                s.graph.nodes(n).color = '#FF0000';
            });
            s.graph.nodes(evt.data.node.id).color = s.graph.nodes(evt.data.node.id).origcolor;
        }

        s.refresh();
    });

    s.bind('outNode',function(evt){
        isHovered = false;

        s.graph.nodes().forEach(function(n){
            n.color = n.origcolor;
        });
        s.graph.edges().forEach(function(e){
            e.color = e.origcolor;
        });
        s.refresh();
    });

    //on clicking a node
    s.bind('clickNode', function(evt){

        conn.send({peertype:'clear'});

        var connectedNodes = s.graph.findConnected(evt);

        s.graph.nodes().forEach(function(n) {
            if (connectedNodes.indexOf(n.id)>=0) {
                console.log('added node');
                conn.send({peertype:'msg',peerpayload:'incoming node'});
                conn.send({peertype:'node',peerpayload:JSON.stringify(n)});
            }
        });

        s.graph.edges().forEach(function(e) {
            if (connectedNodes.indexOf(e.source)>=0 || connectedNodes.indexOf(e.target)>=0) {
                console.log('added edge');
                conn.send({peertype:'msg',peerpayload:'incoming edge'});
                conn.send({peertype:'edge',peerpayload:JSON.stringify(e)});
            }
        });

        conn.send({peertype:'updatetable'});

    });

    s.bind('rightClickStage', function(evt){
        console.log('right clicked stage');
        if (paused){
            //empty accrued buffer
            while (msgBuf.length > 0){
                processMsg(msgBuf.shift());
            }
            applyFilters();
            renderGraph();
        }
        else if(s.isForceAtlas2Running()){
            s.killForceAtlas2();
        }

        paused = !paused;
    });
}

/**
 * Receives either a transactin (utx) or block message and updates graph accordingly
 * @param msg
 */

function processMsg(msg){

    //new raw mempool transaction
    if (msg.op=='utx') {

        var i;
        var txID = msg.x.tx_index;
        var txHash = msg.x.hash;
        var txSize = msg.x.size;
        var txTime = msg.x.time;
        var txRelayer = msg.x.relayed_by;
        var inputs = msg.x.inputs;
        var outputs = msg.x.out;
        var is_coinbase = msg.x.is_coinbase || 0;


        //add new transaction node to graph
        var origTxColor = '#ffffff';
        var txColor = '#ffffff';
        if (isHovered)
            txColor = '#333333';

        var newTx=s.graph.addNode({
            id: txID,
            label: txHash,
            txHash: txHash,
            x: -0.5 + Math.random(),
            y: -0.5 + Math.random(),
            size: 2500000000,
            inVals: 0,
            outVals: 0,
            fee: 0,
            txtime: txTime,
            bytesize: txSize,
            relayer: txRelayer,
            origcolor: origTxColor,
            color: txColor,
            type: 'tx'
        });
        numNodes++;
        document.getElementById('statNumTx').innerHTML = ++numTx;
        console.log('NewTx:'); // + txID);

        //add orange inputs to graph
        var inVals = 0;

        for(i=0; i<inputs.length; i++) {
            var currInput = inputs[i];
            var currID = //currInput.prev_out.addr + ':' +
                currInput.prev_out.tx_index +  ':' +
                currInput.prev_out.n;

            //if input has not already been seen since start of viz
            //add new node and edge to tx
            var existInput = s.graph.nodes(currID);

            //default orange for input
            var origInColor = '#FF9933';
            var inColor = '#FF9933';

            //if it's the DSI address, highlight in lime green
            //if (currInput.prev_out.addr == '1HCyeFCUnxicVe1F8u1Ch3SuAdG8eh7o7L'){
            if (currInput.prev_out.addr == '1MM5pyfRLo5ezRPFZQrTFBm5tboZUyHY73'){
                origInColor = '#00FF00';
                inColor = '#00FF00';
            }

            //if it's a known address color light orange
            if (currInput.prev_out.addr_tag){
                var fromText = ' from ' + currInput.prev_out.addr_tag;
                origInColor = '#FFCF79';
                inColor = '#FFCF79';
            }
            else
                fromText=' from ' + currInput.prev_out.addr;

            if(isHovered)
                inColor='#333333';

            if (existInput === undefined) {

                s.graph.addNode({
                    id: currID,
                    label: (currInput.prev_out.value * 1000 / 100000000).toLocaleString() + 'mB' + fromText,
                    addr: currInput.prev_out.addr,
                    x: -0.5 + Math.random(),
                    y: -0.5 + Math.random(),
                    size: (currInput.prev_out.value),
                    origcolor: origInColor,
                    color: inColor,
                    type: 'input'
                }).addEdge({
                    id: currID +':'+ txID,
                    source: currID,
                    target: txID,
                    weight: 5,
                    origcolor: origInColor,
                    color: inColor,
                    type: 'in_link'
                });
                numNodes++;
                document.getElementById('statNumIn').innerHTML = ++numIn;
                //console.log('NewIn:' + currID);
            }
            //else add short orange edge from existing utxo to this new tx
            else {
                //change type to shared
                existInput.type = 'InOut';

                s.graph.addEdge({
                    id: currID + ':' + txID + 'joinToExistIn',
                    source: currID,
                    target: txID,
                    weight: 20,
                    origcolor: origInColor,
                    color: inColor,
                    type: 'in_link'
                });
                //console.log('JoinIn:' + existInput.id);
            }
            //accumulate input value
            inVals += currInput.prev_out.value;
        }

        var outVals = 0;
        //add blue outputs to graph
        for(var j=0; j<outputs.length;j++){
            var currOutput = outputs[j];

            currID = //currOutput.addr + ':' +
                currOutput.tx_index +  ':' +
                currOutput.n;

            var existOutput = s.graph.nodes(currID);

            var origOutColor = '#003399';
            var outColor = '#003399';

            //if it's the DSI address, highlight in lime green
            //if (currOutput.addr == '1HCyeFCUnxicVe1F8u1Ch3SuAdG8eh7o7L'){
            if (currOutput.addr == '1MM5pyfRLo5ezRPFZQrTFBm5tboZUyHY73'){
                origOutColor = '#00FF00';
                outColor = '#00FF00';
            }

            if (is_coinbase){
                origOutColor = '#FF0000';
                outColor = '#FF0000';
            }

            //if it's known address, colour=lightblue
            if (currOutput.addr_tag){
                var toText = ' to ' + currOutput.addr_tag;
                origOutColor = '#99CCCC';
                outColor = '#99CCCC';
                //console.log('Known Output');
            }
            else
                toText=' to ' + currOutput.addr;

            if (isHovered)
                outColor = '333333';

            if (existOutput === undefined) {

                s.graph.addNode({
                    id: currID,
                    label: (currOutput.value * 1000 / 100000000).toLocaleString()+'mB'+toText,
                    addr: currOutput.addr,
                    tag: currOutput.addr_tag,
                    x: -0.5 + Math.random(),
                    y: -0.5 + Math.random(),
                    size: (currOutput.value),
                    origcolor: origOutColor,
                    color: outColor,
                    type: 'output'
                }).addEdge({
                    id: txID + ':' + currID,
                    source: txID,
                    target: currID,
                    weight: 5,
                    origcolor: origOutColor,
                    color: outColor,
                    type: 'out_link'
                });
                numNodes++;
                document.getElementById('statNumOut').innerHTML = ++numOut;
                //console.log('NewOut:' + currID);
            }
            //it is very unlikely that there will be an existing
            //output, so draw edge in funky magenta color
            else {
                existOutput.type = 'InOut';
                s.graph.addEdge({
                    id: txID + ':' + currID + 'joinToExistOut',
                    source: txID,
                    target: currID,
                    weight: 5,
                    origcolor: origOutColor,
                    color: outColor,
                    type: 'out_link'
                });
                //console.log('JoinOut:' + existOutput.id);
            }
            //accumulate output value
            outVals += currOutput.value;
        }
        s.graph.nodes(txID).inVals = inVals;
        s.graph.nodes(txID).outVals = outVals;
        s.graph.nodes(txID).fee = Math.max((s.graph.nodes(txID).inVals-s.graph.nodes(txID).outVals),0);

        s.graph.nodes(txID).label = (s.graph.nodes(txID).outVals*1000/100000000).toLocaleString() + '+' +
                                    (s.graph.nodes(txID).fee    *1000/100000000).toLocaleString() + 'mBFee ' +
                                    txHash;

        txTotalVal += outVals;
        if (outVals > txMaxVal)
            txMaxVal = outVals;

        txTotalFee += s.graph.nodes(txID).fee;
        if (s.graph.nodes(txID).fee > txMaxFee)
            txMaxFee = s.graph.nodes(txID).fee;

        txTotalSize += txSize;
        if (txSize > txMaxSize)
            txMaxSize = txSize;

        document.getElementById('statNumNodes').innerHTML = numNodes;
    }

    /**
     * handle new block message, remove tx's
     */
    if (msg.op=='block') {
        paused = true;
        console.log('New block ' + msg.x.height + ' received');

        //update html timers and alerts
        var blkStart = Date.now();

        clearInterval(blkTimer);
        blkTimer = setInterval(timeBlock, 1000, [blkStart]);
        document.getElementById('lastBlk').innerHTML = "&nbsp(" + msg.x.height + ")";
        document.getElementById('blkAlert').innerHTML = '<FONT style="BACKGROUND-COLOR: red">NEW BLOCK AT HEIGHT '+
            msg.x.height+' RECEIVED</FONT>';
        setTimeout(function(){
            document.getElementById('blkAlert').innerHTML = "&nbsp";
        },25000);

        var txs = msg.x.txIndexes;

        var preBlockTxCount = numTx;
        for (i=0; i<txs.length; i++){
            if (s.graph.nodes(txs[i])) {
                //console.log(txs[i] + ' in graph');
                //so drop all superflous connected nodes
                s.graph.dropConnected(txs[i]);
                //drop tx node itself
                numTx--;
                numNodes--;
                s.graph.dropNode(txs[i]);
            }
            else {
            }
        }
        console.log(preBlockTxCount-numTx+' txs removed');
        paused = false;
    }
}

/**
 * This custom render functon is necessary to kill the layout algorith
 * and restart it, along with its associated web worker.
 * This is because the layout algorithm is passed the graph as a byte array
 * which cannot be updated when elements are added or removed.
 */
function renderGraph(){
    if(s.isForceAtlas2Running()){
        s.killForceAtlas2();
    }
    s.startForceAtlas2({
        linLogMode: false,
        outboundAttractionDistribution: false,
        adjustSizes: false,
        edgeWeightInfluence: 1,
        scalingRatio: 0.01,
        strongGravityMode: true,
        gravity: 1,
        barnesHutOptimize: true,
        barnesHutTheta: 0.9,
        slowDown: 20,
        startingIterations: 1,
        iterationsPerRender: 1,
        worker: true
    });
}

/**
 * Data Filters
 */
function applyFilters(){
    applyMinDeg2();
    applyValConstraints();
    applyAddress();
    applyTxFilter();
}

//Show only nodes with >degree 2
function applyMinDeg2(){
    var filter = new sigma.plugins.filter(s);

    filter
        .undo('min-degree')
        .nodesBy(function(n){
            return this.degree(n.id) >= minDegs;
        },'min-degree')
        .apply();
}

function applyValConstraints(){
    var filter = new sigma.plugins.filter(s);

    filter
        .undo('val-constraints')
        .nodesBy(function(n) {
            //if its a tx that satisfies constraints, include it
            if (n.type == 'tx')
                return (n.outVals >= minValConstraint && n.outVals <= maxValConstraint &&
                    n.fee >=minFeeConstraint && n.fee <=maxFeeConstraint);

            //if it's an input/output of a tx that satisies constraints, include it too
            else {
                var nbrs=this.adjacentNodes(n.id);
                for (var i = 0; i<nbrs.length; i++){
                    if (nbrs[i].type =='tx'){
                        if (nbrs[i].outVals >= minValConstraint && nbrs[i].outVals <= maxValConstraint  &&
                            nbrs[i].fee >= minFeeConstraint && nbrs[i].fee <= maxFeeConstraint) {
                            return true;
                        }
                    }
                }
                //if not myself nor neighbours and i'm still here, then
                return false;
            }
        }, 'val-constraints')
        .apply();
}

function applyAddress(){
    var filter = new sigma.plugins.filter(s);

    filter
        .undo('by-addr')
        .nodesBy(function(n){
            return (addrFilter == '' || n.addr == addrFilter);
        }, 'by-addr')
        .apply();
}

function applyTxFilter(){
    var filter = new sigma.plugins.filter(s);

    filter
        .undo('by-tx')
        .nodesBy(function(n){
            return (txFilter == '' || n.txHash == txFilter);
        }, 'by-tx')
        .apply();
}
