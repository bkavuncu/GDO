
module.exports = {
    entry: "./Scripts/src/control.jsx",
    output: {
        path: __dirname + "/Scripts/build",
        filename: "control.js"
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: "style!css" },
	    { test: /\.jsx$/, exclude: /node_modules/, loader: "babel", 
		query: { presets: ['react', 'es2015'] } 
	    }
        ]
    }
};
