gdo.stats = parameters['stats'];
gdo.zscores = parameters['zscores'];
gdo.eicdfs = parameters['eicdfs'];
gdo.globalStats = parameters['globalStats'];
gdo.globalEicdf = parameters['globalEicdf'];

colors = chroma.scale(['white', 'red']).colors(3);
baselineType = 'perArrPair'; // perArrPair or globalFullWindow or globalPartialWindow
zscoreThreshold = 3;
percentile = 96;
thresholdType = 'zscore'; // percentile or zscore
gdo.sigmaInstance.graph.edges().forEach(handleEdge);
function handleEdge(edge) {
	const sourceArr = edge.source.split(/[N, ]/)[1];
	const targetArr = edge.target.split(/[N, ]/)[1];
	const edgeId = "S" + sourceArr + "T" + targetArr;
	
	if (baselineType === 'perArrPair') {
		handlePerArrPair(edgeId, edge);
	} else if (baselineType === 'globalFullWindow') {
		handleGlobalFullWindow(edgeId, edge);
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
	const percentileThreshold = gdo.eicdfs[edgeId][percentile];

	setEdgeColor(weight, percentileThreshold, zscore, edge);
}
function handleGlobalFullWindow(edgeId, edge) {
	const weight = edge.attrs["weight2"];
	const mean = gdo.globalStats.Mean;
	const stdev = gdo.globalStats.StandardDeviation;
	const zscore = (weight - mean) / stdev;
	const percentileThreshold = gdo.globalEicdf[percentile];

	setEdgeColor(weight, percentileThreshold, zscore, edge);
}
function setEdgeColor(weight, percentileThreshold, zscore, edge) {
	if (thresholdType === 'percentile') {
		if (weight > percentileThreshold) {
			edge.color = "rgb(255,0,0)";
			edge.hidden = false;
		} else {
			edge.hidden = true;
		}
	} else if (thresholdType === 'zscore') {
		if (!isNaN(zscore) && zscore > zscoreThreshold) {
			edge.color = "rgb(255,0,0)";
			edge.hidden = false;
		} else {
			edge.hidden = true;
		}
	}
}
gdo.sigmaInstance.refresh();
