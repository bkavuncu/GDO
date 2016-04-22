/**
 * dm214
 * USAGE: Install PhantomJS and run $phantomjs spam_evolution.js
 * With a webserver running the block.html visualization on localhost:8000,
 * the script renders a sequential series of 'numBlocks' starting from 'startBlock'.
 * Snapshots are saved to 'saveDir'.
 * Snapshots are taken 'waitLoad' milliseconds after page call.
 */

var startblock = 364100;

renderBlock(startblock);


function renderBlock(block){

    var numblocks = 10;
    var saveDir = './images/';
    var waitLoad = 60000;

	var page = require('webpage').create();

    //Set resolution
	page.viewportSize = {
		width: 1000,
		height: 600
	};

	console.log('opening block '+block);

	var pageUrl = "http://localhost:8000/block.html?block="+block;

	page.open(pageUrl, function(status) {
		//WAIT FOR WEBPAGE TO BE COMPLETELY LOADED
		setTimeout(function(){
			page.render(saveDir + 'blk' + block + '.png');
			console.log('rendered block ' + block);
			if(block >= startblock + numblocks){
				phantom.exit();
			}
			else{
				block++;
				console.log('doing block ' + block);
				renderBlock(block);
			}
		}, waitLoad);
	});
}
