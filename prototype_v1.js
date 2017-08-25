// gdo.stats = parameters['stats'];
// gdo.zscores = parameters['zscores'];
// gdo.eicdfs = parameters['eicdfs'];
// gdo.globalStats = parameters['globalStats'];
// gdo.globalEicdf = parameters['globalEicdf'];
// gdo.distances = parameters['distances'];
// gdo.populations = parameters['populations'];
// gdo.meansMatrix = parameters['meansMatrix'];
// gdo.estimates = [];
// gdo.actuals = [];

// baselineType = 'model'; // perArrPair or globalFullWindow or model
// thresholdType = 'absolute'; // percentile or zscore or absolute
// modelParamNames = ['coefPopA', 'coefPopB', 'coefDistance', 'intercept'];
// modelParams = {
// 	'coefPopA': 0.0373,
// 	'coefPopB': 0.0362,
// 	'coefDistance': -0.6737,
// 	'intercepts': [11.7695,11.8749,11.9702]
// }
// zscoreThresholds = [-Infinity, 1, Infinity];
// percentiles = [0, 95, 100];
// colors = chroma.scale(['green', 'red'])
// 			   .colors(thresholdType == 'percentile' ? percentiles.length-1 : zscoreThresholds.length-1);
// alpha = 0.1;
// colors = colors.map(c => 'rgba(' + chroma(c).alpha(alpha).rgba().toString() + ')');
// gdo.sigmaInstance.graph.edges().forEach(handleEdge);
// function handleEdge(edge) {
// 	const sourceArr = edge.source.split(/[N, ]/)[1];
// 	const targetArr = edge.target.split(/[N, ]/)[1];
// 	const edgeId = "S" + sourceArr + "T" + targetArr;
// 	// if (sourceArr != targetArr) { edge.hidden = true; return;}
// 	if (baselineType === 'perArrPair') {
// 		handlePerArrPair(edgeId, edge);
// 	} else if (baselineType === 'globalFullWindow') {
// 		handleGlobalFullWindow(edgeId, edge);
// 	} else if (baselineType === 'model') {
// 		handleModel(edgeId, edge);
// 	} else if (baselineType === 'globalPartialWindow') {
// 		console.log('Baseline Type not implemented');
// 	} else {
// 		console.log('Baseline Type not supported');
// 	}
// }
// function handlePerArrPair(edgeId, edge) {
// 	const weight = edge.attrs["weight2"];
// 	const mean = gdo.stats[edgeId].Mean;
// 	const stdev = gdo.stats[edgeId].StandardDeviation;
// 	const zscore = (weight - mean) / stdev;
// 	const percentileThresholds = percentiles.map(p => gdo.eicdfs[edgeId][p]);

// 	setEdgeColor(weight, percentileThresholds, zscore, edge);
// }
// function handleGlobalFullWindow(edgeId, edge) {
// 	const weight = edge.attrs["weight2"];
// 	const mean = gdo.globalStats.Mean;
// 	const stdev = gdo.globalStats.StandardDeviation;
// 	const zscore = (weight - mean) / stdev;
// 	const percentileThresholds = percentiles.map(p => gdo.globalEicdf[p]);

// 	setEdgeColor(weight, percentileThresholds, zscore, edge);
// }
// function handleModel(edgeId, edge) {
// 	const sourceArr = edgeId.split(/S|T/)[1]-1;
// 	const targetArr = edgeId.split(/S|T/)[2]-1;
// 	const meanFromStats = 10**gdo.stats[edgeId].Mean;
// 	const coefPopA = modelParams['coefPopA'];
// 	const coefPopB = modelParams['coefPopB'];
// 	const coefDistance = modelParams['coefDistance'];
// 	const intercepts = modelParams['intercepts'];

// 	const ratio = 67.738807805837979;
// 	const popA = Math.log(gdo.populations[sourceArr]);
// 	const popB = Math.log(gdo.populations[targetArr]);
// 	const distance = Math.log(gdo.distances[sourceArr][targetArr]);
// 	const meanFromMatrix = gdo.meansMatrix[sourceArr][targetArr];
// 	if (Math.abs(meanFromStats-meanFromMatrix) > 1) {console.log(meanFromStats,meanFromMatrix);}
// 	if (thresholdType === 'absolute') {
// 		gdo.estimates.push(intercepts[1] + coefPopA*popA + coefPopB*popB + coefDistance*distance);
// 		gdo.actuals.push(Math.log(meanFromStats*ratio));

// 	 	lowThreshold = intercepts[0] + coefPopA*popA + coefPopB*popB + coefDistance*distance;
// 	 	highThreshold = intercepts[2] + coefPopA*popA + coefPopB*popB + coefDistance*distance;
// 		if (Math.log(meanFromStats*ratio) < lowThreshold/2) {
// 			edge.color = colors[0];
// 			edge.type = 'curvedArrow';
// 			edge.hidden = edge.color === '#ffffff' || /rgba\(255,255,255,([+-]?([0-9]*[.])?[0-9]+)\)/.test(edge.color);
// 		} else if (Math.log(meanFromStats*ratio) > highThreshold*2) {
// 			edge.color = colors[colors.length-1];
// 			edge.type = 'curvedArrow';
// 			edge.hidden = edge.color === '#ffffff' || /rgba\(255,255,255,([+-]?([0-9]*[.])?[0-9]+)\)/.test(edge.color);
// 		} else {
// 			edge.hidden = true;
// 		}
// 	} else {
// 		console.log('thresholdType not supported');
// 	}
// }
// function setEdgeColor(weight, percentileThresholds, zscore, edge) {
// 	if (thresholdType === 'percentile') {
// 		const weightThreshold = percentileThresholds.reduce((prev, curr) => weight > prev && weight <= curr ? prev : curr, -1);
// 		const colorIndex = percentileThresholds.findIndex(p => p === weightThreshold);
// 		if (colorIndex >= 0) {
// 			edge.color = colors[colorIndex];
// 			edge.hidden = edge.color === '#ffffff' || /rgba\(255,255,255,([+-]?([0-9]*[.])?[0-9]+)\)/.test(edge.color);
// 		} else {
// 			edge.hidden = true;
// 		}
// 	} else if (thresholdType === 'zscore') {
// 		const zscoreThreshold = zscoreThresholds.reduce((prev, curr) => zscore > prev && zscore <= curr ? prev : curr, -1);
// 		const colorIndex = zscoreThresholds.findIndex(z => z === zscoreThreshold);
// 		if (!isNaN(zscore) && colorIndex >= 0) {
// 			edge.color = colors[colorIndex];
// 			edge.hidden = edge.color === '#ffffff' || /rgba\(255,255,255,([+-]?([0-9]*[.])?[0-9]+)\)/.test(edge.color);
// 		} else {
// 			edge.hidden = true;
// 		}
// 	}
// }

// gdo.sigmaInstance.refresh();



gdo.estimates = []
gdo.actuals = [];

baselineType = 'model'; // perArrPair or globalFullWindow or model
thresholdType = 'absolute'; // percentile or zscore or absolute
modelParamNames = ['coefPopA', 'coefPopB', 'coefDistance', 'intercept'];
modelParams = {
	'coefPopA': 0.0373,
	'coefPopB': 0.0362,
	'coefDistance': -0.6737,
	'intercepts': [11.7695,11.8749,11.9702]
}
zscoreThresholds = [-Infinity, 1, Infinity];
percentiles = [0, 95, 100];
colors = chroma.scale(['green', 'red'])
			   .colors(thresholdType == 'percentile' ? percentiles.length-1 : zscoreThresholds.length-1);
alpha = 0.1;
colors = colors.map(c => 'rgba(' + chroma(c).alpha(alpha).rgba().toString() + ')');
gdo.sigmaInstance.graph.edges().forEach(handleEdge);
function handleEdge(edge) {
	const sourceArr = edge.source.split(/[N, ]/)[1];
	const targetArr = edge.target.split(/[N, ]/)[1];
	const edgeId = "S" + sourceArr + "T" + targetArr;
	// if (sourceArr != targetArr) { edge.hidden = true; return;}
	if (baselineType === 'perArrPair') {
		handlePerArrPair(edgeId, edge);
	} else if (baselineType === 'globalFullWindow') {
		handleGlobalFullWindow(edgeId, edge);
	} else if (baselineType === 'model') {
		handleModel(edgeId, edge);
	} else if (baselineType === 'globalPartialWindow') {
		console.log('Baseline Type not implemented');
	} else {
		console.log('Baseline Type not supported');
	}
}
function handlePerArrPair(edgeId, edge) {
	const weight = edge.attrs["weight2"];
	const mean = gdo.stats[edgeId].Mean;
	const stdev = gdo.stats[edgeId].StandardDeviation;
	const zscore = (weight - mean) / stdev;
	const percentileThresholds = percentiles.map(p => gdo.eicdfs[edgeId][p]);

	setEdgeColor(weight, percentileThresholds, zscore, edge);
}
function handleGlobalFullWindow(edgeId, edge) {
	const weight = edge.attrs["weight2"];
	const mean = gdo.globalStats.Mean;
	const stdev = gdo.globalStats.StandardDeviation;
	const zscore = (weight - mean) / stdev;
	const percentileThresholds = percentiles.map(p => gdo.globalEicdf[p]);

	setEdgeColor(weight, percentileThresholds, zscore, edge);
}
function handleModel(edgeId, edge) {
	const sourceArr = edgeId.split(/S|T/)[1]-1;
	const targetArr = edgeId.split(/S|T/)[2]-1;
	const meanFromStats = 10**gdo.stats[edgeId].Mean;
	const coefPopA = modelParams['coefPopA'];
	const coefPopB = modelParams['coefPopB'];
	const coefDistance = modelParams['coefDistance'];
	const intercepts = modelParams['intercepts'];

	const ratio = 67.738807805837979;
	const popA = Math.log(gdo.populations[sourceArr]);
	const popB = Math.log(gdo.populations[targetArr]);
	const distance = Math.log(gdo.distances[sourceArr][targetArr]);
	const meanFromMatrix = gdo.meansMatrix[sourceArr][targetArr];
	if (Math.abs(meanFromStats-meanFromMatrix) > 1) {console.log(meanFromStats,meanFromMatrix);}
	if (thresholdType === 'absolute') {
		gdo.estimates.push(intercepts[1] + coefPopA*popA + coefPopB*popB + coefDistance*distance);
		gdo.actuals.push(Math.log(meanFromStats*ratio));

	 	lowThreshold = intercepts[0] + coefPopA*popA + coefPopB*popB + coefDistance*distance;
	 	highThreshold = intercepts[2] + coefPopA*popA + coefPopB*popB + coefDistance*distance;
		if (Math.log(meanFromStats*ratio) < lowThreshold-.5) {
			edge.color = colors[0];
			edge.type = 'curvedArrow';
			edge.hidden = edge.color === '#ffffff' || /rgba\(255,255,255,([+-]?([0-9]*[.])?[0-9]+)\)/.test(edge.color);
		} else if (Math.log(meanFromStats*ratio) > highThreshold+3) {
			edge.color = colors[colors.length-1];
			edge.type = 'curvedArrow';
			edge.hidden = edge.color === '#ffffff' || /rgba\(255,255,255,([+-]?([0-9]*[.])?[0-9]+)\)/.test(edge.color);
		} else {
			edge.hidden = true;
		}
	} else {
		console.log('thresholdType not supported');
	}
}
function setEdgeColor(weight, percentileThresholds, zscore, edge) {
	if (thresholdType === 'percentile') {
		const weightThreshold = percentileThresholds.reduce((prev, curr) => weight > prev && weight <= curr ? prev : curr, -1);
		const colorIndex = percentileThresholds.findIndex(p => p === weightThreshold);
		if (colorIndex >= 0) {
			edge.color = colors[colorIndex];
			edge.hidden = edge.color === '#ffffff' || /rgba\(255,255,255,([+-]?([0-9]*[.])?[0-9]+)\)/.test(edge.color);
		} else {
			edge.hidden = true;
		}
	} else if (thresholdType === 'zscore') {
		const zscoreThreshold = zscoreThresholds.reduce((prev, curr) => zscore > prev && zscore <= curr ? prev : curr, -1);
		const colorIndex = zscoreThresholds.findIndex(z => z === zscoreThreshold);
		if (!isNaN(zscore) && colorIndex >= 0) {
			edge.color = colors[colorIndex];
			edge.hidden = edge.color === '#ffffff' || /rgba\(255,255,255,([+-]?([0-9]*[.])?[0-9]+)\)/.test(edge.color);
		} else {
			edge.hidden = true;
		}
	}
}

gdo.sigmaInstance.refresh();
